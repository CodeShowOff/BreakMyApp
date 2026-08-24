from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from packages.domain.database import get_db
from packages.domain.models import Organization, Project, TestRun, User
from packages.domain.schemas import TestRunResponse
from packages.security.authorization import AuthorizationService
from services.api.api.deps import get_current_user

router = APIRouter()
authz = AuthorizationService()

@router.get("/projects/{project_id}/test-runs", response_model=list[TestRunResponse])
async def list_test_runs(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> Sequence[TestRun]:
    result_proj = await db.execute(
        select(Project).options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members)).filter(Project.id == project_id)
    )
    project = result_proj.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_view_project(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(TestRun).filter(TestRun.project_id == project_id).order_by(TestRun.created_at.desc())
    )
    return result.scalars().all()

@router.get("/projects/{project_id}/test-runs/{run_id}", response_model=TestRunResponse)
async def get_test_run(
    project_id: str,
    run_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> TestRun:
    result_proj = await db.execute(
        select(Project).options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members)).filter(Project.id == project_id)
    )
    project = result_proj.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_view_project(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(TestRun).filter(TestRun.id == run_id, TestRun.project_id == project_id)
    )
    run = result.scalars().first()
    if not run:
        raise HTTPException(status_code=404, detail="Test Run not found")

    return run
