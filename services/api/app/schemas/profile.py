from pydantic import BaseModel


class OnboardingUpdate(BaseModel):
    onboarding_completed: bool


class ProfileUpdate(BaseModel):
    address_line: str | None = None
    city: str | None = None
    postcode: str | None = None
    dob: str | None = None
    full_name: str | None = None
    username: str | None = None
    country: str | None = None
    phone: str | None = None
