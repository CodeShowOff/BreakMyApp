from fastapi import APIRouter

from .endpoints import application_models, audit_logs, business_rules, credentials, findings, organizations, projects, targets, test_runs

api_router = APIRouter()
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(targets.router, tags=["targets"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(credentials.router, tags=["credentials"])
api_router.include_router(findings.router, tags=["findings"])
api_router.include_router(test_runs.router, tags=["test-runs"])
api_router.include_router(business_rules.router, tags=["business-rules"])
api_router.include_router(application_models.router, tags=["application-models"])

