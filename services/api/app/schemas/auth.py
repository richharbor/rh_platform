from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserPublic


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None
    role: str = Field(default="customer")
    phone: str | None = None
    city: str | None = None
    pan: str | None = None
    company_name: str | None = None
    gst_number: str | None = None
    experience_years: str | None = None
    existing_client_base: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserPublic
