from pydantic import BaseModel, EmailStr, Field


class SignupOtpRequest(BaseModel):
    email: EmailStr


class SignupOtpVerify(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class SignupComplete(BaseModel):
    signup_token: str
    password: str = Field(min_length=8)
    phone: str


class ResendOtpRequest(BaseModel):
    email: EmailStr
    purpose: str = "signup"
