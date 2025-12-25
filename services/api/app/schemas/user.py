from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str | None = None
    onboarding_completed: bool
    role: str = "customer"
    created_at: datetime | None = None
    email_verified_at: datetime | None = None
    is_email_verified: bool = False
    phone: str | None = None
    city: str | None = None
    pan: str | None = None
    company_name: str | None = None
    gst_number: str | None = None
    experience_years: str | None = None
    existing_client_base: str | None = None
    full_name: str | None = None
    username: str | None = None
    dob: datetime | None = None
    country: str | None = None
    address_line: str | None = None
    city: str | None = None
    postcode: str | None = None
    profile_completed_at: datetime | None = None
    is_profile_complete: bool = False
