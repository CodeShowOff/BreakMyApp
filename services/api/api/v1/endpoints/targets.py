from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from packages.domain.database import get_db
from packages.domain.idempotency_models import IdempotencyKey
from packages.domain.models import Organization, Project, Target, User, AuthorizationStatus
from packages.domain.schemas import TargetCreate, TargetResponse
from packages.security.audit import AuditService
from packages.security.authorization import AuthorizationService
from packages.security.target_policy import TargetPolicy
from services.api.api.deps import check_idempotency_key, get_current_user

router = APIRouter()
authz = AuthorizationService()

@router.post("/projects/{project_id}/targets", response_model=TargetResponse, status_code=201)
async def create_target(
    project_id: str,
    target_in: TargetCreate,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    idempotency_record: Annotated[IdempotencyKey, Depends(check_idempotency_key)]
) -> Target:
    if not target_in.authorization_acknowledged:
        raise HTTPException(status_code=400, detail="Explicit authorization acknowledgement is required.")

    result_project = await db.execute(
        select(Project)
        .options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members))
        .filter(Project.id == project_id)
    )
    project = result_project.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_manage_targets(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to manage targets")

    temp_target_response = TargetResponse(
        id="temp",
        project_id=project_id,
        name=target_in.name,
        base_url=target_in.base_url,
        environment=target_in.environment,
        allowed_hosts=target_in.allowed_hosts,
        allowed_url_prefixes=target_in.allowed_url_prefixes,
        allowed_ports=target_in.allowed_ports,
        authorization_status=AuthorizationStatus.PENDING,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    
    policy = TargetPolicy(temp_target_response)
    if not policy.checkNavigation(target_in.base_url):
        raise HTTPException(status_code=400, detail="Invalid target base_url or policy violation")

    # Reachability verification
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=False) as client:
            # We don't want to actually send a full GET, HEAD is safer and faster if supported,
            # but we can do GET to ensure it's a real server response
            response = await client.get(target_in.base_url)
            response.raise_for_status()
    except httpx.RequestError:
        raise HTTPException(status_code=400, detail="Target is unreachable")
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=400, detail="Target returned an error status")

    target = Target(
        project_id=project_id,
        name=target_in.name,
        base_url=target_in.base_url,
        environment=target_in.environment,
        allowed_hosts=target_in.allowed_hosts,
        allowed_url_prefixes=target_in.allowed_url_prefixes,
        allowed_ports=target_in.allowed_ports,
        authorization_status=AuthorizationStatus.AUTHORIZED,
        authorization_acknowledged_at=datetime.now(UTC),
        created_by=current_user.id
    )
    db.add(target)
    await db.flush()

    audit = AuditService(db)
    await audit.log_action(
        organization_id=str(project.organization_id),
        actor_id=str(current_user.id),
        action="target.create",
        resource_type="target",
        resource_id=str(target.id),
        ip_address=request.client.host if request.client else None
    )

    if idempotency_record:
        idempotency_record.status_code = 201 # type: ignore
        idempotency_record.response_body = TargetResponse.model_validate(target).model_dump(mode="json") # type: ignore
        await db.commit()

    await db.commit()
    await db.refresh(target)
    return target

@router.get("/projects/{project_id}/targets", response_model=list[TargetResponse])
async def list_targets(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> Sequence[Target]:
    result_project = await db.execute(
        select(Project)
        .options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members))
        .filter(Project.id == project_id)
    )
    project = result_project.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_view_project(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Target).filter(Target.project_id == project_id)
    )
    return result.scalars().all()

@router.get("/targets/{target_id}", response_model=TargetResponse)
async def get_target(
    target_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> Target:
    result = await db.execute(
        select(Target)
        .options(selectinload(Target.project).selectinload(Project.members), 
                 selectinload(Target.project).selectinload(Project.organization).selectinload(Organization.members))
        .filter(Target.id == target_id)
    )
    target = result.scalars().first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")

    if not authz.can_view_project(current_user, target.project):
        raise HTTPException(status_code=403, detail="Forbidden")

    return target
