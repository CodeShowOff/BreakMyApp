from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from packages.domain.database import get_db
from packages.domain.models import AuditLog, Organization, User
from packages.domain.schemas import PaginatedAuditLogs
from packages.security.authorization import AuthorizationService
from services.api.api.deps import get_current_user

router = APIRouter()
authz = AuthorizationService()

@router.get("", response_model=PaginatedAuditLogs)
async def list_audit_logs(
    organization_id: str,
    limit: Annotated[int , Query(50, ge=1, le=100)],
    offset: Annotated[int , Query(0, ge=0)],
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
):
    # Fetch org
    result_org = await db.execute(
        select(Organization).options(selectinload(Organization.members)).filter(Organization.id == organization_id)
    )
    org = result_org.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # User must be an ADMIN or OWNER to view audit logs for the organization
    if not authz.can_manage_organization(current_user, org):
        raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to view audit logs")

    # Count total
    from sqlalchemy import func
    total_result = await db.execute(
        select(func.count()).select_from(AuditLog).filter(AuditLog.organization_id == organization_id)
    )
    total = total_result.scalar()

    # Fetch paginated logs
    result = await db.execute(
        select(AuditLog)
        .filter(AuditLog.organization_id == organization_id)
        .order_by(desc(AuditLog.timestamp))
        .offset(offset)
        .limit(limit)
    )
    items = result.scalars().all()

    return {"items": items, "total": total}
