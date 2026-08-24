# 0002. PostgreSQL as Source of Truth

## Status

Accepted (Implemented in Phase 1)

## Context

We need a primary transactional store for product state, orchestrations, identities, and metadata. In the modern SaaS ecosystem, there are choices between NoSQL (MongoDB, DynamoDB) and Relational (PostgreSQL, MySQL). We also need to support durable workflows and idempotency mechanisms to prevent race conditions or retried API requests from duplicating workflows and financial states.

## Decision

1. **Database Platform**: PostgreSQL is the single authoritative source of truth for all domain entities, RBAC configurations, project settings, test configurations, and finding status.
2. **ORM & Migrations**: We use **SQLAlchemy (asyncio)** for database mapping to integrate natively with FastAPI. **Alembic** manages our schema migrations reliably.
3. **Idempotency**: Rather than introducing Redis purely for idempotency (which increases operational complexity), we use a PostgreSQL table (`idempotency_keys`) to safely lock and track the state of mutating API requests (POST/PUT).
4. **Data Isolation**: Application-level logic (`AuthorizationService` + `selectinload` scoped queries) filters data heavily on `organization_id`. Database constraints (foreign keys on delete cascades) enforce referential integrity across tenants.

## Consequences

- **Pros**: ACID compliance. Rich relational modeling matches our hierarchical RBAC perfectly. Keeping idempotency in PostgreSQL keeps infrastructure minimal early in the startup lifecycle.
- **Cons**: Scaling out writes is harder than NoSQL, though read replicas can be added later. We must be very careful not to introduce N+1 queries when resolving deep RBAC hierarchies (mitigated via `selectinload`).
