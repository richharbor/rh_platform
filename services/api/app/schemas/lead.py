from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field

LeadType = Literal["self", "partner", "referral", "cold"]
ProductType = Literal[
    "unlisted_shares",
    "loans",
    "insurance",
    "private_markets",
    "bulk_deals",
    "corporate_finance",
]


class LeadCreate(BaseModel):
    product_type: ProductType
    lead_type: LeadType
    name: str = Field(min_length=2)
    phone: str | None = None
    email: EmailStr | None = None
    city: str | None = None
    requirement: str | None = None
    product_details: dict[str, Any] | None = None
    consent_confirmed: bool = False
    convert_to_referral: bool = False


class LeadPublic(BaseModel):
    id: int
    product_type: ProductType
    lead_type: LeadType
    status: str
    incentive_type: str
    incentive_status: str
    expected_payout: str | None = None
    name: str
    phone: str | None = None
    email: EmailStr | None = None
    city: str | None = None
    requirement: str | None = None
    created_at: datetime | None = None


class LeadDetail(LeadPublic):
    product_details: dict[str, Any] | None = None
    consent_confirmed: bool
    convert_to_referral: bool
