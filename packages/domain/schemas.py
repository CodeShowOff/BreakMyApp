from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from .models import (
    AuthorizationStatus,
    ConfidenceScore,
    Environment,
    ExecutionAttemptStatus,
    ExecutionJobStatus,
    FindingStatus,
    RetestStatus,
    SandboxStatus,
    SeverityLevel,
    TestRunStatus,
)


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


class OrganizationMemberCreate(BaseModel):
    email: str
    role: str = "MEMBER"

class OrganizationMemberResponse(BaseModel):
    id: str
    user_id: str
    organization_id: str
    role: str
    email: str | None = None
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


class CredentialBase(BaseModel):
    label: str = Field(..., description="E.g., Customer A, Admin, etc.")
    role_label: str = Field(..., description="Role of the identity, e.g., admin, user")
    identity_type: str = Field(..., description="Type of identity, e.g., user, service_account")
    login_strategy: str = Field(default="username + password")
    metadata_: dict[str, Any] | None = Field(None, alias="metadata")

class CredentialCreate(CredentialBase):
    secret_data: dict[str, str] = Field(..., description="The actual secrets (e.g., username, password) to be stored in the vault.")

class CredentialResponse(CredentialBase):
    id: str
    project_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TestRunBase(BaseModel):
    project_id: str
    target_id: str

class TestRunCreate(TestRunBase):
    pass

class TestRunResponse(TestRunBase):
    id: str
    status: TestRunStatus
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ExecutionJobBase(BaseModel):
    test_run_id: str
    job_type: str

class ExecutionJobCreate(ExecutionJobBase):
    pass

class ExecutionJobResponse(ExecutionJobBase):
    id: str
    status: ExecutionJobStatus
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ExecutionAttemptBase(BaseModel):
    execution_job_id: str
    attempt_number: int

class ExecutionAttemptCreate(ExecutionAttemptBase):
    pass

class ExecutionAttemptResponse(ExecutionAttemptBase):
    id: str
    status: ExecutionAttemptStatus
    log_uri: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SandboxBase(BaseModel):
    execution_attempt_id: str
    provider: str

class SandboxCreate(SandboxBase):
    pass

class SandboxResponse(SandboxBase):
    id: str
    provider_sandbox_id: str | None = None
    status: SandboxStatus
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ApplicationModelBase(BaseModel):
    project_id: str
    target_id: str
    test_run_id: str | None = None
    model_version: str
    exploration_version: str
    prompt_version: str
    browser_version: str
    model_data: dict[str, Any]

class ApplicationModelCreate(ApplicationModelBase):
    pass

class ApplicationModelResponse(ApplicationModelBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class BusinessRuleBase(BaseModel):
    project_id: str
    rule_source: str
    name: str
    description: str

class BusinessRuleCreate(BusinessRuleBase):
    pass

class BusinessRuleResponse(BusinessRuleBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class BusinessRuleVersionBase(BaseModel):
    rule_id: str
    version: int
    content: dict[str, Any]

class BusinessRuleVersionCreate(BusinessRuleVersionBase):
    pass

class BusinessRuleVersionResponse(BusinessRuleVersionBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TestStrategyBase(BaseModel):
    name: str
    version: str
    description: str
    required_roles: list[str]
    required_capabilities: list[str]
    risk_level: str
    destructive: bool
    enabled: bool

class TestStrategyCreate(TestStrategyBase):
    pass

class TestStrategyResponse(TestStrategyBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TestCaseBase(BaseModel):
    strategy_id: str
    name: str
    description: str

class TestCaseCreate(TestCaseBase):
    pass

class TestCaseResponse(TestCaseBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TestHypothesisBase(BaseModel):
    execution_attempt_id: str
    test_case_id: str | None = None
    description: str
    evidence_references: dict[str, Any]

class TestHypothesisCreate(TestHypothesisBase):
    pass

class TestHypothesisResponse(TestHypothesisBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TestResultBase(BaseModel):
    execution_attempt_id: str
    test_hypothesis_id: str | None = None
    expected_behavior: str
    observed_behavior: str
    rule_or_state_tested: str
    evidence: dict[str, Any]
    strategy_version: str

class TestResultCreate(TestResultBase):
    pass

class TestResultResponse(TestResultBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FindingFingerprintBase(BaseModel):
    target_id: str
    fingerprint_hash: str
    resource: str | None = None
    operation: str | None = None
    authorization_boundary: str | None = None
    root_cause_category: str | None = None
    strategy: str | None = None

class FindingFingerprintCreate(FindingFingerprintBase):
    pass

class FindingFingerprintResponse(FindingFingerprintBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ExpectedBehaviorBase(BaseModel):
    project_id: str
    target_id: str
    scope: str
    behavior_description: str

class ExpectedBehaviorCreate(ExpectedBehaviorBase):
    pass

class ExpectedBehaviorResponse(ExpectedBehaviorBase):
    id: str
    created_by: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SuppressionRuleBase(BaseModel):
    project_id: str
    target_id: str
    scope: str
    reason: str
    expiration: datetime | None = None

class SuppressionRuleCreate(SuppressionRuleBase):
    pass

class SuppressionRuleResponse(SuppressionRuleBase):
    id: str
    created_by: str | None = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class FindingBase(BaseModel):
    project_id: str
    target_id: str
    test_run_id: str
    test_hypothesis_id: str | None = None
    fingerprint_id: str | None = None
    
    title: str
    status: FindingStatus
    severity: SeverityLevel
    confidence: ConfidenceScore
    severity_policy_version: str
    
    affected_identity: str | None = None
    expected_behavior: str | None = None
    observed_behavior: str | None = None
    violated_rule: str | None = None
    impact: str | None = None
    reproduction_steps: dict[str, Any] | list[Any] | None = None
    evidence: dict[str, Any] | list[Any] | None = None
    
    test_strategy: str | None = None
    strategy_version: str | None = None
    recommended_remediation: str | None = None
    retest_status: RetestStatus | None = None
    
    details: dict[str, Any]

class FindingCreate(FindingBase):
    pass

class FindingResponse(FindingBase):
    id: str
    first_detected: datetime
    last_verified: datetime
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class VerificationAttemptBase(BaseModel):
    finding_id: str
    execution_attempt_id: str | None = None
    status: str

class VerificationAttemptCreate(VerificationAttemptBase):
    pass

class VerificationAttemptResponse(VerificationAttemptBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class VerificationResultBase(BaseModel):
    verification_attempt_id: str
    confidence: ConfidenceScore
    is_reproducible: bool
    evidence: dict[str, Any]
    reason: str

class VerificationResultCreate(VerificationResultBase):
    pass

class VerificationResultResponse(VerificationResultBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
