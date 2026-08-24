# Identity and Access Control

This document outlines the implementation of Identity, Organization, and Project management within the BreakMyApp Control Plane. It acts as a reference for developers working on API boundaries or UI components.

## Overview
BreakMyApp is a heavily isolated multi-tenant system. Authentication is deferred to an external Identity Provider (IdP) (Clerk) whereas **Authorization** is managed entirely within our authoritative PostgreSQL database using an explicit hierarchy.

## Entities

1. **User**: Represents a human (or service) interacting with the API. Authenticated via Clerk.
2. **Organization**: The top-level tenant boundary. Holds billing data, test limits, and acts as the ultimate owner of child projects.
3. **Project**: A scoped execution boundary within an Organization. Contains target URLs, credentials, and test runs.
4. **Memberships**: We track roles at both the Organization (`OrganizationMembership`) and Project (`ProjectMembership`) levels.

## Role Hierarchy

Permissions evaluate roles according to the following strict hierarchy:
`OWNER > ADMIN > MEMBER > VIEWER`

- **VIEWER**: Can read project data, test runs, findings, and evidence. Cannot mutate any state.
- **MEMBER**: Can execute tests and manage test plan configurations. Cannot manage project-level credentials or invite users.
- **ADMIN**: Can manage credentials, edit project scopes, and manage members.
- **OWNER**: Can manage organization-level billing, global settings, and destroy the organization.

**Inheritance Rule**: A user's privileges on a Project evaluate their explicit `ProjectMembership` and their inherited `OrganizationMembership`, always granting the *highest* role available. (e.g. an Organization Owner cannot be downgraded to a Viewer on a specific project).

## Enforcing Authorization

Never duplicate authorization logic in routers. Always use `AuthorizationService`:

```python
from packages.security.authorization import AuthorizationService

authz = AuthorizationService()

# In your FastAPI endpoint:
if not authz.can_edit_project(current_user, project):
    raise HTTPException(status_code=403, detail="Forbidden")
```

## Audit Logging

Every mutating action **must** be logged using `AuditService`.
The service guarantees two critical security properties:
1. `redact_metadata()`: Sweeps through payload dictionaries and forcibly redacts keys like `password`, `token`, `secret`, `cookie`, `key`, and `authorization` to ensure credentials never land in the database.
2. `hash_ip()`: One-way hashes client IPs before persistence for compliance/privacy.

```python
from packages.security.audit import AuditService

audit = AuditService(db)
await audit.log_action(
    organization_id=org.id,
    actor_id=user.id,
    action="project.delete",
    resource_type="project",
    resource_id=project.id,
    metadata={"deleted_targets_count": 3}
)
```

## Idempotency

Mutating APIs (POST, PUT) should be protected against retries via the `Idempotency-Key` header.
Inject the `check_idempotency_key` dependency into the FastAPI route:

```python
from services.api.api.deps import check_idempotency_key

@router.post("/run")
async def start_run(
    ...,
    idempotency_record: IdempotencyKey = Depends(check_idempotency_key)
):
    ...
    if idempotency_record:
        idempotency_record.status_code = 201
```
