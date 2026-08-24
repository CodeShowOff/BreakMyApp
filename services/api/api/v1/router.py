from fastapi import APIRouter

from .endpoints import audit_logs, credentials, organizations, projects, targets

api_router = APIRouter()
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(targets.router, tags=["targets"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(credentials.router, tags=["credentials"])

