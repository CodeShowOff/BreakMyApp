from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from packages.domain.database import get_db
from packages.domain.idempotency_models import IdempotencyKey
from packages.domain.models import Organization, Project, User
from packages.domain.schemas import ProjectCreate, ProjectResponse
from packages.security.audit import AuditService
from packages.security.authorization import AuthorizationService
from services.api.api.deps import check_idempotency_key, get_current_user

router = APIRouter()
authz = AuthorizationService()

@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_in: ProjectCreate,
    request: Request,
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)],
    idempotency_record: Annotated[IdempotencyKey , Depends(check_idempotency_key)]
):
    # Fetch org to check permissions
    result_org = await db.execute(
        select(Organization).options(selectinload(Organization.members)).filter(Organization.id == project_in.organization_id)
    )
    org = result_org.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if not authz.can_manage_organization(current_user, org):
        raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to create project in this organization")

    project = Project(
        name=project_in.name,
        organization_id=project_in.organization_id
    )
    db.add(project)
    await db.flush()

    audit = AuditService(db)
    await audit.log_action(
        organization_id=str(org.id),
        actor_id=str(current_user.id),
        action="project.create",
        resource_type="project",
        resource_id=str(project.id),
        ip_address=request.client.host if request.client else None
    )

    if idempotency_record:
        idempotency_record.status_code = 201 # type: ignore
        idempotency_record.response_body = ProjectResponse.model_validate(project).model_dump(mode="json") # type: ignore
        await db.commit()

    await db.commit()
    await db.refresh(project)
    return project

@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    organization_id: str,
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
        
    # User must be a member of the organization to list its projects
    is_member = any(m.user_id == current_user.id for m in org.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Project).filter(Project.organization_id == organization_id)
    )
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Annotated[AsyncSession , Depends(get_db)],
    current_user: Annotated[User , Depends(get_current_user)]
):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members))
        .filter(Project.id == project_id)
    )
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_view_project(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden")

    return project
