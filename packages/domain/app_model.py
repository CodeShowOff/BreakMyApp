import enum
from typing import Any
from pydantic import BaseModel, Field

class ConfidenceLevel(str, enum.Enum):
    CONFIRMED = "confirmed"
    PROBABLE = "probable"
    INFERRED = "inferred"
    UNKNOWN = "unknown"

class Page(BaseModel):
    id: str = Field(..., description="Unique identifier for the page")
    url_pattern: str = Field(..., description="URL pattern or exact URL")
    title: str | None = None
    description: str | None = Field(None, description="Inferred purpose of the page")

class Input(BaseModel):
    id: str
    name: str | None = None
    type: str = Field(..., description="Type of input (text, select, checkbox, etc.)")
    placeholder: str | None = None
    is_required: bool | None = None

class Action(BaseModel):
    id: str
    page_id: str
    name: str = Field(..., description="Action name, e.g. 'Submit Form', 'Click Button'")
    selector: str | None = Field(None, description="UI selector used to perform the action")
    method: str | None = Field(None, description="HTTP method if applicable")
    inputs: list[Input] = Field(default_factory=list)

class Object(BaseModel):
    id: str = Field(..., description="System identifier for the object class (e.g., 'User', 'Project')")
    name: str = Field(..., description="Human readable name of the object")
    inferred_properties: list[str] = Field(default_factory=list)

class Relationship(BaseModel):
    source_object_id: str
    target_object_id: str
    relationship_type: str = Field(..., description="E.g., 'owns', 'contains', 'belongs to'")
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN

class RoleObservation(BaseModel):
    role: str
    capabilities: list[str] = Field(default_factory=list)
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN

class EndpointObservation(BaseModel):
    url_pattern: str
    methods_observed: list[str] = Field(default_factory=list)
    requires_auth: bool | None = None
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN

class StateObservation(BaseModel):
    key: str
    value: Any
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN

class Observation(BaseModel):
    id: str
    actor_role: str | None = None
    page: str | None = None
    action: str | None = None
    visible_effect: str | None = None
    request_metadata: dict[str, Any] | None = None
    potential_object: str | None = None
    potential_relationship: str | None = None
    confidence: ConfidenceLevel = ConfidenceLevel.UNKNOWN

class ApplicationModelPayload(BaseModel):
    pages: list[Page] = Field(default_factory=list)
    actions: list[Action] = Field(default_factory=list)
    objects: list[Object] = Field(default_factory=list)
    relationships: list[Relationship] = Field(default_factory=list)
    role_observations: list[RoleObservation] = Field(default_factory=list)
    endpoint_observations: list[EndpointObservation] = Field(default_factory=list)
    state_observations: list[StateObservation] = Field(default_factory=list)
    observations_log: list[Observation] = Field(default_factory=list)
