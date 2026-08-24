from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from packages.domain.database import get_db
from packages.domain.models import Organization, OrganizationMembership, Role, User
from packages.domain.schemas import OrganizationCreate, OrganizationResponse
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
):
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
        organization_id=org.id,
        actor_id=current_user.id,
        action="organization.create",
        resource_type="organization",
        resource_id=org.id,
        ip_address=request.client.host if request.client else None
    )
    
    await db.commit()
    await db.refresh(org)
    return org

@router.get("", response_model=list[OrganizationResponse])
async def list_organizations(
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
):
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
):
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
