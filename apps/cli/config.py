from typing import List
from pydantic import BaseModel, Field

class TargetConfig(BaseModel):
    url: str

class RoleConfig(BaseModel):
    name: str
    credential: str

class ProjectConfig(BaseModel):
    target: TargetConfig
    roles: List[RoleConfig] = Field(default_factory=list)
    strategies: List[str] = Field(default_factory=list)
    fail_on: List[str] = Field(default_factory=list)

import yaml
from pathlib import Path

def load_config(path: str | Path) -> ProjectConfig:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    
    with open(path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    return ProjectConfig(**(data or {}))
