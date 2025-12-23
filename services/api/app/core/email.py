import os
import smtplib
from email.mime.text import MIMEText
from typing import Optional

SMTP_HOST = os.getenv("EMAIL_HOST")
SMTP_PORT = int(os.getenv("EMAIL_PORT", "587"))
SMTP_USER = os.getenv("EMAIL_USER")
SMTP_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_FROM = os.getenv("EMAIL_FROM", SMTP_USER or "no-reply@example.com")


def send_email(subject: str, recipient: str, body: str) -> Optional[str]:
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        return "Email settings not configured"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = recipient

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
          server.starttls()
          server.login(SMTP_USER, SMTP_PASSWORD)
          server.sendmail(SMTP_FROM, [recipient], msg.as_string())
    except Exception as exc:  # pragma: no cover - best effort email send
        return str(exc)
    return None
