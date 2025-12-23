import os
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.core.email import send_email
from app.core.security import get_password_hash, verify_password
from app.models.otp import OtpCode

OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
OTP_RESEND_SECONDS = int(os.getenv("OTP_RESEND_SECONDS", "60"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))


def _generate_otp_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def create_and_send_signup_otp(db: Session, email: str) -> Optional[str]:
    now = datetime.now(timezone.utc)
    existing = (
        db.query(OtpCode)
        .filter(OtpCode.email == email, OtpCode.purpose == "signup")
        .order_by(OtpCode.id.desc())
        .first()
    )
    if existing and existing.last_sent_at and (now - existing.last_sent_at).total_seconds() < OTP_RESEND_SECONDS:
        return "Please wait before requesting another code."

    code = _generate_otp_code()
    code_hash = get_password_hash(code)
    expires_at = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

    if existing:
        existing.code_hash = code_hash
        existing.expires_at = expires_at
        existing.attempts = 0
        existing.last_sent_at = now
        db.add(existing)
    else:
        db.add(
            OtpCode(
                email=email,
                purpose="signup",
                code_hash=code_hash,
                expires_at=expires_at,
                attempts=0,
                last_sent_at=now,
            )
        )
    db.commit()

    body = f"Your Coinpay verification code is {code}. It expires in {OTP_EXPIRY_MINUTES} minutes."
    send_email("Your Coinpay verification code", email, body)
    return None


def verify_signup_otp(db: Session, email: str, otp: str) -> bool:
    now = datetime.now(timezone.utc)
    record = (
        db.query(OtpCode)
        .filter(OtpCode.email == email, OtpCode.purpose == "signup")
        .order_by(OtpCode.id.desc())
        .first()
    )
    if not record:
        return False
    if record.expires_at < now:
        return False
    if record.attempts >= OTP_MAX_ATTEMPTS:
        return False

    record.attempts += 1
    db.add(record)
    db.commit()

    return verify_password(otp, record.code_hash)
