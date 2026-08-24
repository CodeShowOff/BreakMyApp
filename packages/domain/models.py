import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from .database import Base


def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(UTC)

class Role(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

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
    role = Column(Enum(Role, name="role_enum"), nullable=False, default=Role.VIEWER)
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

class ProjectMembership(Base):
    __tablename__ = "project_memberships"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    role = Column(Enum(Role, name="role_enum"), nullable=False, default=Role.VIEWER)
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

