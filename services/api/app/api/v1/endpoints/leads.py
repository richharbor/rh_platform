from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.lead import Lead

router = APIRouter(prefix="/admin/leads", tags=["admin"])


@router.get("", response_model=list[Lead])
def list_leads(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None),
) -> list[Lead]:
    query = db.query(User)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter((User.email.ilike(like)) | (User.name.ilike(like)))
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    return [
        Lead(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at,
        )
        for user in users
    ]
