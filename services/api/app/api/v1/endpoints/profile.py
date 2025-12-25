from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from datetime import datetime, timezone

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.profile import OnboardingUpdate, ProfileUpdate
from app.schemas.user import UserPublic

router = APIRouter(tags=["profile"])


@router.patch("/profile/onboarding", response_model=UserPublic)
def update_onboarding(
    payload: OnboardingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserPublic:
    current_user.onboarding_completed = payload.onboarding_completed
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _user_to_public(current_user)


@router.put("/me/profile", response_model=UserPublic)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserPublic:
    for field in [
        "address_line",
        "city",
        "postcode",
        "full_name",
        "username",
        "country",
        "phone",
        "pan",
        "company_name",
        "gst_number",
        "experience_years",
        "existing_client_base",
    ]:
        value = getattr(payload, field)
        if value is not None:
            setattr(current_user, field, value)

    if payload.dob:
        try:
            current_user.dob = datetime.fromisoformat(payload.dob)
        except Exception:
            raise ValueError("Invalid date format; use ISO date string.")

    if _is_profile_complete(current_user):
        current_user.profile_completed_at = current_user.profile_completed_at or datetime.now(timezone.utc)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _user_to_public(current_user)


def _is_profile_complete(user: User) -> bool:
    return bool(
        user.phone
        and user.full_name
        and user.username
        and user.dob
        and user.country
        and user.address_line
        and user.city
        and user.postcode
    )


def _user_to_public(user: User) -> UserPublic:
    return UserPublic.model_validate(
        {
            **user.__dict__,
            "is_profile_complete": _is_profile_complete(user) or bool(user.profile_completed_at),
            "is_email_verified": bool(user.email_verified_at),
        }
    )
