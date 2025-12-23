from datetime import datetime

from pydantic import BaseModel, EmailStr


class Lead(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    created_at: datetime | None = None
