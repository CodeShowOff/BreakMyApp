from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from packages.domain.database import get_db
from packages.domain.idempotency_models import IdempotencyKey
from packages.domain.models import Credential, Organization, Project, User
from packages.domain.schemas import CredentialCreate, CredentialResponse
from packages.security.audit import AuditService
from packages.security.authorization import AuthorizationService
from packages.security.secret_manager import secret_provider
from services.api.api.deps import check_idempotency_key, get_current_user

router = APIRouter()
authz = AuthorizationService()


@router.post("/projects/{project_id}/credentials", response_model=CredentialResponse, status_code=201)
async def create_credential(
    project_id: str,
    credential_in: CredentialCreate,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    idempotency_record: Annotated[IdempotencyKey | None, Depends(check_idempotency_key)] = None
) -> Credential:
    result_project = await db.execute(
        select(Project)
        .options(selectinload(Project.members), selectinload(Project.organization).selectinload(Organization.members))
        .filter(Project.id == project_id)
    )
    project = result_project.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not authz.can_manage_credentials(current_user, project):
        raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to manage credentials")

    # Store secrets securely in the vault and get a reference
    secret_reference = await secret_provider.create_credential(credential_in.secret_data)

    credential = Credential(
        project_id=project_id,
        label=credential_in.label,
        role_label=credential_in.role_label,
        identity_type=credential_in.identity_type,
        secret_reference=secret_reference,
        login_strategy=credential_in.login_strategy,
        metadata_=credential_in.metadata_
    )
    db.add(credential)
    await db.flush()

    audit = AuditService(db)
    await audit.log_action(
        organization_id=str(project.organization_id),
        actor_id=str(current_user.id),
        action="credential.create",
        resource_type="credential",
        resource_id=str(credential.id),
        ip_address=request.client.host if request.client else None
    )

    if idempotency_record:
        idempotency_record.status_code = 201 # type: ignore
        idempotency_record.response_body = CredentialResponse.model_validate(credential).model_dump(mode="json") # type: ignore
        await db.commit()

    await db.commit()
    await db.refresh(credential)
    return credential


@router.get("/projects/{project_id}/credentials", response_model=list[CredentialResponse])
async def list_credentials(
    project_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> Sequence[Credential]:
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
        select(Credential).filter(Credential.project_id == project_id)
    )
    return result.scalars().all()


@router.delete("/credentials/{credential_id}", status_code=204)
async def delete_credential(
    credential_id: str,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
) -> None:
    result = await db.execute(
        select(Credential)
        .options(selectinload(Credential.project).selectinload(Project.members), 
                 selectinload(Credential.project).selectinload(Project.organization).selectinload(Organization.members))
        .filter(Credential.id == credential_id)
    )
    credential = result.scalars().first()
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found")

    if not authz.can_manage_credentials(current_user, credential.project):
        raise HTTPException(status_code=403, detail="Forbidden: Insufficient permissions to delete credentials")

    # Delete from Vault
    await secret_provider.delete_credential(str(credential.secret_reference))

    # Log deletion
    audit = AuditService(db)
    await audit.log_action(
        organization_id=str(credential.project.organization_id),
        actor_id=str(current_user.id),
        action="credential.delete",
        resource_type="credential",
        resource_id=str(credential.id),
        ip_address=request.client.host if request.client else None
    )

    await db.delete(credential)
    await db.commit()
