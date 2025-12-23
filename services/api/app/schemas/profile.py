from pydantic import BaseModel


class OnboardingUpdate(BaseModel):
    onboarding_completed: bool
