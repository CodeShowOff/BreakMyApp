from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from packages.domain.database import get_db
from packages.domain.models import Finding, Organization, Project, User
from packages.domain.schemas import FindingResponse
from packages.security.authorization import AuthorizationService
from services.api.api.deps import get_current_user

router = APIRouter()
authz = AuthorizationService()

@router.get("/projects/{project_id}/findings", response_model=list[FindingResponse])
async def list_findings(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> Sequence[Finding]:
    result_proj = await db.execute(
        select(Project).options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members)).filter(Project.id == project_id)
    )
    project = result_proj.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_view_project(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Finding).filter(Finding.project_id == project_id)
    )
    return result.scalars().all()

@router.get("/projects/{project_id}/findings/{finding_id}", response_model=FindingResponse)
async def get_finding(
    project_id: str,
    finding_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> Finding:
    result_proj = await db.execute(
        select(Project).options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members)).filter(Project.id == project_id)
    )
    project = result_proj.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_view_project(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Finding).filter(Finding.id == finding_id, Finding.project_id == project_id)
    )
    finding = result.scalars().first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    return finding
