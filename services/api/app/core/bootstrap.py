import logging
import os
from typing import Optional

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User

logger = logging.getLogger(__name__)


def ensure_user_role_column() -> None:
    inspector = inspect(engine)
    columns = {col["name"] for col in inspector.get_columns("users")}
    if "role" in columns:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user' NOT NULL"))
    logger.info("Added missing 'role' column to users table.")


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
