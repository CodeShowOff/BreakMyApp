import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(UTC)

class Role(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class Environment(str, enum.Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PREVIEW = "preview"

class AuthorizationStatus(str, enum.Enum):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    REJECTED = "rejected"


class FindingStatus(str, enum.Enum):
    CANDIDATE = "candidate"
    VERIFYING = "verifying"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    INCONCLUSIVE = "inconclusive"
    EXPIRED = "expired"
    RESOLVED = "resolved"


class ConfidenceScore(str, enum.Enum):
    CONFIRMED = "confirmed"
    STRONG = "strong"
    WEAK = "weak"
    INCONCLUSIVE = "inconclusive"
    FALSE_POSITIVE = "false_positive"


class SeverityLevel(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    organizations = relationship("OrganizationMembership", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("ProjectMembership", back_populates="user", cascade="all, delete-orphan")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    members = relationship("OrganizationMembership", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")

class OrganizationMembership(Base):
    __tablename__ = "organization_memberships"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), primary_key=True)
    role: Mapped[Role] = mapped_column(Enum(Role, name="role_enum"), nullable=False, default=Role.VIEWER)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="organizations")
    organization = relationship("Organization", back_populates="members")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    organization = relationship("Organization", back_populates="projects")
    members = relationship("ProjectMembership", back_populates="project", cascade="all, delete-orphan")
    targets = relationship("Target", back_populates="project", cascade="all, delete-orphan")


class ProjectMembership(Base):
    __tablename__ = "project_memberships"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    role: Mapped[Role] = mapped_column(Enum(Role, name="role_enum"), nullable=False, default=Role.VIEWER)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="projects")
    project = relationship("Project", back_populates="members")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(String, nullable=True) # User ID or Service
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    metadata_ = Column("metadata", JSON, nullable=True)
    ip_hash_or_safe_network_metadata = Column(String, nullable=True)

class Target(Base):
    __tablename__ = "targets"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    base_url = Column(String, nullable=False)
    environment: Mapped[Environment] = mapped_column(Enum(Environment, name="environment_enum"), nullable=False)
    allowed_hosts = Column(JSON, default=list, nullable=False)
    allowed_url_prefixes = Column(JSON, default=list, nullable=False)
    allowed_ports = Column(JSON, default=list, nullable=False)
    authorization_status: Mapped[AuthorizationStatus] = mapped_column(Enum(AuthorizationStatus, name="authorization_status_enum"), default=AuthorizationStatus.PENDING, nullable=False)
    authorization_method = Column(String, nullable=True)
    authorization_acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project", back_populates="targets")
    creator = relationship("User")

class Credential(Base):
    __tablename__ = "credentials"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String, nullable=False)
    role_label = Column(String, nullable=False)
    identity_type = Column(String, nullable=False)
    secret_reference = Column(String, nullable=False)
    login_strategy = Column(String, nullable=False)
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project")


class TestRunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMED_OUT = "timed_out"
    POLICY_BLOCKED = "policy_blocked"

class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(String, ForeignKey("targets.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[TestRunStatus] = mapped_column(Enum(TestRunStatus, name="test_run_status_enum"), default=TestRunStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project")
    target = relationship("Target")
    jobs = relationship("ExecutionJob", back_populates="test_run", cascade="all, delete-orphan")


class ExecutionJobStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ExecutionJob(Base):
    __tablename__ = "execution_jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    test_run_id = Column(String, ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    job_type = Column(String, nullable=False)
    status: Mapped[ExecutionJobStatus] = mapped_column(Enum(ExecutionJobStatus, name="execution_job_status_enum"), default=ExecutionJobStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    test_run = relationship("TestRun", back_populates="jobs")
    attempts = relationship("ExecutionAttempt", back_populates="job", cascade="all, delete-orphan")


class ExecutionAttemptStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class ExecutionAttempt(Base):
    __tablename__ = "execution_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    execution_job_id = Column(String, ForeignKey("execution_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    attempt_number = Column(Integer, nullable=False, default=1)
    status: Mapped[ExecutionAttemptStatus] = mapped_column(Enum(ExecutionAttemptStatus, name="execution_attempt_status_enum"), default=ExecutionAttemptStatus.PENDING, nullable=False)
    log_uri = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    job = relationship("ExecutionJob", back_populates="attempts")
    sandboxes = relationship("Sandbox", back_populates="attempt", cascade="all, delete-orphan")


class SandboxStatus(str, enum.Enum):
    PROVISIONING = "provisioning"
    RUNNING = "running"
    DESTROYED = "destroyed"
    FAILED = "failed"

class Sandbox(Base):
    __tablename__ = "sandboxes"

    id = Column(String, primary_key=True, default=generate_uuid)
    execution_attempt_id = Column(String, ForeignKey("execution_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String, nullable=False)
    provider_sandbox_id = Column(String, nullable=True)
    status: Mapped[SandboxStatus] = mapped_column(Enum(SandboxStatus, name="sandbox_status_enum"), default=SandboxStatus.PROVISIONING, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    attempt = relationship("ExecutionAttempt", back_populates="sandboxes")

class ApplicationModel(Base):
    __tablename__ = "application_models"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(String, ForeignKey("targets.id", ondelete="CASCADE"), nullable=False, index=True)
    test_run_id = Column(String, ForeignKey("test_runs.id", ondelete="SET NULL"), nullable=True, index=True)
    model_version = Column(String, nullable=False)
    exploration_version = Column(String, nullable=False)
    prompt_version = Column(String, nullable=False)
    browser_version = Column(String, nullable=False)
    model_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project")
    target = relationship("Target")
    test_run = relationship("TestRun")


class RuleSource(str, enum.Enum):
    USER_DEFINED = "user_defined"
    APPLICATION_INFERRED = "application_inferred"
    SYSTEM_GENERATED = "system_generated"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class BusinessRule(Base):
    __tablename__ = "business_rules"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_source: Mapped[RuleSource] = mapped_column(Enum(RuleSource, name="rule_source_enum"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project")
    versions = relationship("BusinessRuleVersion", back_populates="rule", cascade="all, delete-orphan")

class BusinessRuleVersion(Base):
    __tablename__ = "business_rule_versions"

    id = Column(String, primary_key=True, default=generate_uuid)
    rule_id = Column(String, ForeignKey("business_rules.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    rule = relationship("BusinessRule", back_populates="versions")

class TestStrategy(Base):
    __tablename__ = "test_strategies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    description = Column(String, nullable=False)
    required_roles = Column(JSON, nullable=False)
    required_capabilities = Column(JSON, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel, name="risk_level_enum"), nullable=False)
    destructive = Column(Integer, nullable=False, default=0)
    enabled = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    test_cases = relationship("TestCase", back_populates="strategy", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    strategy_id = Column(String, ForeignKey("test_strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    strategy = relationship("TestStrategy", back_populates="test_cases")

class TestHypothesis(Base):
    __tablename__ = "test_hypotheses"

    id = Column(String, primary_key=True, default=generate_uuid)
    execution_attempt_id = Column(String, ForeignKey("execution_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    test_case_id = Column(String, ForeignKey("test_cases.id", ondelete="SET NULL"), nullable=True, index=True)
    description = Column(String, nullable=False)
    evidence_references = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    attempt = relationship("ExecutionAttempt")
    test_case = relationship("TestCase")

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    execution_attempt_id = Column(String, ForeignKey("execution_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    test_hypothesis_id = Column(String, ForeignKey("test_hypotheses.id", ondelete="SET NULL"), nullable=True, index=True)
    expected_behavior = Column(String, nullable=False)
    observed_behavior = Column(String, nullable=False)
    rule_or_state_tested = Column(String, nullable=False)
    evidence = Column(JSON, nullable=False)
    strategy_version = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    attempt = relationship("ExecutionAttempt")
    hypothesis = relationship("TestHypothesis")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(String, ForeignKey("targets.id", ondelete="CASCADE"), nullable=False, index=True)
    test_run_id = Column(String, ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    test_hypothesis_id = Column(String, ForeignKey("test_hypotheses.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[FindingStatus] = mapped_column(Enum(FindingStatus, name="finding_status_enum"), default=FindingStatus.CANDIDATE, nullable=False)
    severity: Mapped[SeverityLevel] = mapped_column(Enum(SeverityLevel, name="severity_level_enum"), nullable=False)
    confidence: Mapped[ConfidenceScore] = mapped_column(Enum(ConfidenceScore, name="confidence_score_enum"), nullable=False)
    severity_policy_version = Column(String, nullable=False)
    details = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    project = relationship("Project")
    target = relationship("Target")
    test_run = relationship("TestRun")
    hypothesis = relationship("TestHypothesis")
    verification_attempts = relationship("VerificationAttempt", back_populates="finding", cascade="all, delete-orphan")


class VerificationAttempt(Base):
    __tablename__ = "verification_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    finding_id = Column(String, ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    execution_attempt_id = Column(String, ForeignKey("execution_attempts.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    finding = relationship("Finding", back_populates="verification_attempts")
    execution_attempt = relationship("ExecutionAttempt")
    result = relationship("VerificationResult", back_populates="verification_attempt", uselist=False, cascade="all, delete-orphan")


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    verification_attempt_id = Column(String, ForeignKey("verification_attempts.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    confidence: Mapped[ConfidenceScore] = mapped_column(Enum(ConfidenceScore, name="confidence_score_enum"), nullable=False)
    is_reproducible = Column(Integer, nullable=False, default=0)
    evidence = Column(JSON, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    verification_attempt = relationship("VerificationAttempt", back_populates="result")
