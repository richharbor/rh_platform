from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.profile import OnboardingUpdate
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
    return UserPublic.model_validate(current_user)
