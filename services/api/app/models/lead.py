from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, func

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_type = Column(String, nullable=False)
    lead_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default="new")
    incentive_type = Column(String, nullable=False, default="pending")
    incentive_status = Column(String, nullable=False, default="pending")
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    requirement = Column(String, nullable=True)
    product_details = Column(JSON, nullable=True)
    consent_confirmed = Column(Boolean, nullable=False, default=False)
    convert_to_referral = Column(Boolean, nullable=False, default=False)
    expected_payout = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
