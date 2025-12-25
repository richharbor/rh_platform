from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    onboarding_completed = Column(Boolean, nullable=False, default=False)
    role = Column(String, nullable=False, default="customer")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    phone = Column(String, nullable=True)
    pan = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    experience_years = Column(String, nullable=True)
    existing_client_base = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    dob = Column(DateTime(timezone=True), nullable=True)
    country = Column(String, nullable=True)
    address_line = Column(String, nullable=True)
    city = Column(String, nullable=True)
    postcode = Column(String, nullable=True)
    profile_completed_at = Column(DateTime(timezone=True), nullable=True)
