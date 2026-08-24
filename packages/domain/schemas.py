from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from .models import AuthorizationStatus, Environment

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    id: str # Will be provided by Clerk

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrganizationBase(BaseModel):
    name: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    organization_id: str

class ProjectResponse(ProjectBase):
    id: str
    organization_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    organization_id: str
    actor_id: str | None = None
    action: str
    resource_type: str
    resource_id: str
    metadata_: dict[str, Any] | None = None
    ip_hash_or_safe_network_metadata: str | None = None
    model_config = ConfigDict(from_attributes=True)

class PaginatedAuditLogs(BaseModel):
    items: list[AuditLogResponse]
    total: int

class TargetBase(BaseModel):
    name: str
    base_url: str
    environment: Environment
    allowed_hosts: list[str] = Field(default_factory=list)
    allowed_url_prefixes: list[str] = Field(default_factory=list)
    allowed_ports: list[int] = Field(default_factory=list)

class TargetCreate(TargetBase):
    authorization_acknowledged: bool = Field(description="Must explicitly acknowledge authorization to test this target.")

class TargetResponse(TargetBase):
    id: str
    project_id: str
    authorization_status: AuthorizationStatus
    authorization_method: str | None = None
    authorization_acknowledged_at: datetime | None = None
    created_by: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
