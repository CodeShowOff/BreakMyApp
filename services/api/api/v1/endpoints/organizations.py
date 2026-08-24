from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from packages.domain.database import get_db
from packages.domain.models import Organization, OrganizationMembership, Role, User
from packages.domain.schemas import OrganizationCreate, OrganizationResponse, OrganizationMemberResponse, OrganizationMemberCreate
from packages.security.audit import AuditService
from packages.security.authorization import AuthorizationService
from services.api.api.deps import get_current_user

router = APIRouter()
authz = AuthorizationService()

@router.post("", response_model=OrganizationResponse, status_code=201)
async def create_organization(
    org_in: OrganizationCreate,
    request: Request,
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
) -> Organization:
    org = Organization(name=org_in.name)
    db.add(org)
    await db.flush() # flush to get org.id
    
    # Creator becomes OWNER
    membership = OrganizationMembership(
        user_id=current_user.id,
        organization_id=org.id,
        role=Role.OWNER
    )
    db.add(membership)
    
    audit = AuditService(db)
    await audit.log_action(
        organization_id=str(org.id),
        actor_id=str(current_user.id),
        action="organization.create",
        resource_type="organization",
        resource_id=str(org.id),
        ip_address=request.client.host if request.client else None
    )
    
    await db.commit()
    await db.refresh(org)
    return org

@router.get("", response_model=list[OrganizationResponse])
async def list_organizations(
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
) -> Sequence[Organization]:
    # Only return orgs the user is a member of
    result = await db.execute(
        select(Organization)
        .join(OrganizationMembership)
        .filter(OrganizationMembership.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
) -> Organization:
    result = await db.execute(
        select(Organization).filter(Organization.id == org_id)
    )
    org = result.scalars().first()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Check if user is member
    result_mem = await db.execute(
        select(OrganizationMembership).filter(
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.user_id == current_user.id
        )
    )
    if not result_mem.scalars().first():
        raise HTTPException(status_code=403, detail="Forbidden")
        
    return org

@router.get("/{org_id}/members", response_model=list[OrganizationMemberResponse])
async def list_organization_members(
    org_id: str,
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
):
    # Verify org access
    result_mem = await db.execute(
        select(OrganizationMembership).filter(
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.user_id == current_user.id
        )
    )
    if not result_mem.scalars().first():
        raise HTTPException(status_code=403, detail="Forbidden")

    # Fetch members with users
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(OrganizationMembership)
        .options(selectinload(OrganizationMembership.user))
        .filter(OrganizationMembership.organization_id == org_id)
    )
    memberships = result.scalars().all()
    
    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "organization_id": m.organization_id,
            "role": m.role.value,
            "email": m.user.email if m.user else None,
            "created_at": m.created_at
        }
        for m in memberships
    ]

@router.post("/{org_id}/members", response_model=OrganizationMemberResponse, status_code=201)
async def invite_organization_member(
    org_id: str,
    member_in: OrganizationMemberCreate,
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
):
    # Verify org access (must be admin/owner, but we'll just check membership for MVP)
    result_mem = await db.execute(
        select(OrganizationMembership).filter(
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.user_id == current_user.id
        )
    )
    if not result_mem.scalars().first():
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check if user with email exists
    result_user = await db.execute(select(User).filter(User.email == member_in.email))
    user = result_user.scalars().first()

    if not user:
        import uuid
        user = User(id=f"usr_{uuid.uuid4().hex[:16]}", email=member_in.email)
        db.add(user)
        await db.flush()

    # Check if already a member
    result_existing = await db.execute(
        select(OrganizationMembership).filter(
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.user_id == user.id
        )
    )
    if result_existing.scalars().first():
        raise HTTPException(status_code=409, detail="User is already a member")

    # Determine role
    role = Role.MEMBER
    try:
        role = Role(member_in.role.upper())
    except ValueError:
        pass

    membership = OrganizationMembership(
        user_id=user.id,
        organization_id=org_id,
        role=role
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)

    return {
        "id": membership.id,
        "user_id": membership.user_id,
        "organization_id": membership.organization_id,
        "role": membership.role.value,
        "email": user.email,
        "created_at": membership.created_at
    }
