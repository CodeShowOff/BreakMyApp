from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# Phase 0 Placeholders for domain entities

class Organization(BaseModel):
    id: str
    name: str
    created_at: datetime

class User(BaseModel):
    id: str
    email: str
    organization_id: str

class Project(BaseModel):
    id: str
    organization_id: str
    name: str

class Target(BaseModel):
    id: str
    project_id: str
    base_url: str
    allowed_hosts: List[str]
    environment: str

class Credential(BaseModel):
    id: str
    project_id: str
    label: str
    role: str
    secret_reference: str  # Note: NOT a plaintext password

class TestPlan(BaseModel):
    id: str
    project_id: str
    name: str

class TestCase(BaseModel):
    id: str
    test_plan_id: str

class TestRun(BaseModel):
    id: str
    test_plan_id: str
    target_id: str
    status: str

class Execution(BaseModel):
    id: str
    test_run_id: str

class Hypothesis(BaseModel):
    id: str
    execution_id: str
    description: str

class Evidence(BaseModel):
    id: str
    execution_id: str
    s3_key: str

class Finding(BaseModel):
    id: str
    test_run_id: str
    status: str
    description: str

class Verification(BaseModel):
    id: str
    finding_id: str
    status: str

class PolicyViolation(BaseModel):
    id: str
    execution_id: str
    reason: str
