from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.otp import create_and_send_signup_otp, verify_signup_otp
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_signup_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest
from app.schemas.otp import ResendOtpRequest, SignupComplete, SignupOtpRequest, SignupOtpVerify
from app.schemas.user import UserPublic

router = APIRouter(tags=["auth"])


def _is_profile_complete(user: User) -> bool:
    return bool(
        user.profile_completed_at
        or (
            user.phone
            and user.full_name
            and user.username
            and user.dob
            and user.country
            and user.address_line
            and user.city
            and user.postcode
        )
    )


def _user_to_public(user: User) -> UserPublic:
    return UserPublic.model_validate(
        {
            **user.__dict__,
            "is_profile_complete": _is_profile_complete(user),
            "is_email_verified": bool(user.email_verified_at),
        }
    )


@router.post("/auth/signup/request-otp", status_code=status.HTTP_200_OK)
def request_signup_otp(payload: SignupOtpRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    email = payload.email.lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing and existing.email_verified_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already exists. Please log in.",
        )

    error = create_and_send_signup_otp(db, email)
    if error:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=error)

    return {"message": "OTP sent to email."}


@router.post("/auth/signup/verify-otp")
def verify_signup(payload: SignupOtpVerify, db: Session = Depends(get_db)) -> dict[str, str]:
    email = payload.email.lower()
    ok = verify_signup_otp(db, email, payload.otp)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code.")
    token = create_signup_token(email)
    return {"signup_token": token}


@router.post("/auth/signup/resend-otp")
def resend_signup(payload: ResendOtpRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    email = payload.email.lower()
    error = create_and_send_signup_otp(db, email)
    if error:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=error)
    return {"message": "OTP resent."}


@router.post("/auth/signup/complete", response_model=AuthResponse)
def complete_signup(payload: SignupComplete, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        token_payload = decode_token(payload.signup_token, expected_type="signup")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup token invalid or expired.") from None

    email = token_payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signup token invalid or expired.")

    existing = db.query(User).filter(User.email == email).first()
    now = datetime.now(timezone.utc)

    if existing:
        if existing.email_verified_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Account already exists. Please log in.",
            )
        existing.password_hash = get_password_hash(payload.password)
        existing.phone = payload.phone
        existing.email_verified_at = now
        db.add(existing)
        db.commit()
        db.refresh(existing)
        user = existing
    else:
        user = User(
            email=email,
            password_hash=get_password_hash(payload.password),
            phone=payload.phone,
            email_verified_at=now,
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account already exists.") from None
        db.refresh(user)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_to_public(user),
    )


@router.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    allowed_roles = {"customer", "partner", "referral_partner"}
    role = payload.role.lower().strip()
    if role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role selection.",
        )
    email = payload.email.lower()
    user = User(
        email=email,
        name=payload.name,
        role=role,
        phone=payload.phone,
        city=payload.city,
        pan=payload.pan,
        company_name=payload.company_name,
        gst_number=payload.gst_number,
        experience_years=payload.experience_years,
        existing_client_base=payload.existing_client_base,
        password_hash=get_password_hash(payload.password),
        email_verified_at=datetime.now(timezone.utc),
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with that email already exists.",
        ) from None

    db.refresh(user)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_to_public(user),
    )


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
        )

    if not user.email_verified_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in.",
        )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_to_public(user),
    )


@router.post("/auth/refresh", response_model=AuthResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or expired.",
        ) from None

    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or expired.",
        )

    user = db.get(User, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or expired.",
        )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_to_public(user),
    )


@router.get("/auth/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return _user_to_public(current_user)
