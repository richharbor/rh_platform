from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.core.database import get_db
from app.models.lead import Lead as LeadModel
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadDetail, LeadPublic

router = APIRouter()

INCENTIVE_MAP = {
    "self": "Free add-ons, priority RM, faster callback",
    "partner": "Cash payout + contests",
    "referral": "Gifts / vouchers",
    "cold": "Up to 25% payout on conversion",
}

DEFAULT_STATUS = "new"


def _lead_to_public(lead: LeadModel) -> LeadPublic:
    return LeadPublic(
        id=lead.id,
        product_type=lead.product_type,
        lead_type=lead.lead_type,
        status=lead.status,
        incentive_type=lead.incentive_type,
        incentive_status=lead.incentive_status,
        expected_payout=lead.expected_payout,
        name=lead.name,
        phone=lead.phone,
        email=lead.email,
        city=lead.city,
        requirement=lead.requirement,
        created_at=lead.created_at,
    )


def _lead_to_detail(lead: LeadModel) -> LeadDetail:
    return LeadDetail(
        **_lead_to_public(lead).model_dump(),
        product_details=lead.product_details or {},
        consent_confirmed=lead.consent_confirmed,
        convert_to_referral=lead.convert_to_referral,
    )


user_router = APIRouter(prefix="/leads", tags=["leads"])
admin_router = APIRouter(prefix="/admin/leads", tags=["admin"])


@user_router.post("", response_model=LeadPublic, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeadPublic:
    if payload.lead_type == "cold" and not payload.consent_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent confirmation is required for cold references.",
        )

    incentive_type = INCENTIVE_MAP[payload.lead_type]
    expected_payout = None
    if payload.lead_type == "cold":
        expected_payout = "Up to 25% payout"
    elif payload.lead_type == "partner":
        expected_payout = "Payout on successful conversion"
    elif payload.lead_type == "referral":
        expected_payout = "Gift / voucher on conversion"

    lead = LeadModel(
        user_id=current_user.id,
        product_type=payload.product_type,
        lead_type=payload.lead_type,
        status=DEFAULT_STATUS,
        incentive_type=incentive_type,
        incentive_status="pending",
        expected_payout=expected_payout,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        city=payload.city,
        requirement=payload.requirement,
        product_details=payload.product_details or {},
        consent_confirmed=payload.consent_confirmed,
        convert_to_referral=payload.convert_to_referral,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return _lead_to_public(lead)


@user_router.get("", response_model=list[LeadPublic])
def list_my_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[LeadPublic]:
    leads = (
        db.query(LeadModel)
        .filter(LeadModel.user_id == current_user.id)
        .order_by(LeadModel.created_at.desc())
        .all()
    )
    return [_lead_to_public(lead) for lead in leads]


@user_router.get("/{lead_id}", response_model=LeadDetail)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LeadDetail:
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id, LeadModel.user_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found.")
    return _lead_to_detail(lead)


@admin_router.get("", response_model=list[LeadPublic])
def list_leads(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    search: str | None = Query(None),
) -> list[LeadPublic]:
    query = db.query(LeadModel)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(LeadModel.name.ilike(like))
    leads = query.order_by(LeadModel.created_at.desc()).offset(offset).limit(limit).all()
    return [_lead_to_public(lead) for lead in leads]


router.include_router(user_router)
router.include_router(admin_router)
