# 0015. API Versioning and Standards

## Status

Accepted (Implemented in Phase 1)

## Context

Our external APIs and internal frontend-to-backend APIs must be consistent, versioned, and easy to trace. As BreakMyApp scales, we need to ensure that clients do not break when new resource schemas are introduced, and that operators can debug requests smoothly from end to end across our services (FastAPI control plane to Temporal/Playwright execution workers).

## Decision

1. **Namespace**: All operational control plane APIs are versioned under `/api/v1/*`.
2. **Standard Headers**:
   - `X-Request-ID`: Injected by `RequestIDMiddleware` in FastAPI if absent. Echoed back on responses and attached to OpenTelemetry spans and logs.
   - `Idempotency-Key`: Expected for POST/PUT mutating operations. Handled by a FastAPI dependency that checks the `idempotency_keys` table.
3. **Pydantic Schemas**: Responses and Requests are modeled strictly via Pydantic schemas (e.g. `OrganizationResponse`, `ProjectCreate`), separated from the SQLAlchemy `models.py` representations. This provides a hard boundary avoiding accidental database schema leakage.

## Consequences

- **Pros**: Easy route scoping. Clean request tracing. Safe retries out of the box via Idempotency keys. Safe JSON serialization boundaries.
- **Cons**: We have to manage two models for every entity (Database `Base` model vs API `BaseModel`), meaning more boilerplate when adding new fields.
