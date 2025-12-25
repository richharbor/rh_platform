import logging
import os
from typing import Optional

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User

logger = logging.getLogger(__name__)


def ensure_user_columns() -> None:
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("users")}
    alterations: list[str] = []

    if "role" not in columns:
        alterations.append("ADD COLUMN role VARCHAR DEFAULT 'customer' NOT NULL")
    if "email_verified_at" not in columns:
        alterations.append("ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE")
    if "phone" not in columns:
        alterations.append("ADD COLUMN phone VARCHAR")
    if "city" not in columns:
        alterations.append("ADD COLUMN city VARCHAR")
    if "pan" not in columns:
        alterations.append("ADD COLUMN pan VARCHAR")
    if "company_name" not in columns:
        alterations.append("ADD COLUMN company_name VARCHAR")
    if "gst_number" not in columns:
        alterations.append("ADD COLUMN gst_number VARCHAR")
    if "experience_years" not in columns:
        alterations.append("ADD COLUMN experience_years VARCHAR")
    if "existing_client_base" not in columns:
        alterations.append("ADD COLUMN existing_client_base VARCHAR")
    if "full_name" not in columns:
        alterations.append("ADD COLUMN full_name VARCHAR")
    if "username" not in columns:
        alterations.append("ADD COLUMN username VARCHAR UNIQUE")
    if "dob" not in columns:
        alterations.append("ADD COLUMN dob TIMESTAMP WITH TIME ZONE")
    if "country" not in columns:
        alterations.append("ADD COLUMN country VARCHAR")
    if "address_line" not in columns:
        alterations.append("ADD COLUMN address_line VARCHAR")
    if "city" not in columns:
        alterations.append("ADD COLUMN city VARCHAR")
    if "postcode" not in columns:
        alterations.append("ADD COLUMN postcode VARCHAR")
    if "profile_completed_at" not in columns:
        alterations.append("ADD COLUMN profile_completed_at TIMESTAMP WITH TIME ZONE")

    if not alterations:
        return

    alter_sql = "ALTER TABLE users " + ", ".join(alterations)
    with engine.begin() as conn:
        conn.execute(text(alter_sql))
    logger.info("Ensured user columns: %s", ", ".join(alterations))


def ensure_superadmin() -> Optional[User]:
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        logger.warning("ADMIN_EMAIL/ADMIN_PASSWORD not set; superadmin account not created.")
        return None

    db: Session = SessionLocal()
    try:
        normalized_email = admin_email.lower()
        user = db.query(User).filter(User.email == normalized_email).first()

        if user:
            if user.role != "admin" or not user.password_hash:
                user.role = "admin"
                user.password_hash = get_password_hash(admin_password)
                db.add(user)
                db.commit()
                db.refresh(user)
            return user

        user = User(
            email=normalized_email,
            name="Super Admin",
            role="admin",
            password_hash=get_password_hash(admin_password),
            onboarding_completed=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Superadmin account ensured for %s", normalized_email)
        return user
    finally:
        db.close()
