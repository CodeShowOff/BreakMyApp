# 0009. Multi-tenant Authorization Model

## Status

Accepted (Implemented in Phase 1)

## Context

BreakMyApp is a multi-tenant SaaS application that needs strong isolation between organizations and projects. We need a robust mechanism to manage identities, handle authentication, and define boundaries to ensure no user can perform unauthorized actions against another tenant's resources. In a security testing tool, this isolation is paramount to prevent cross-tenant data leakage or target manipulation.

## Decision

1. **Identity Provider (IdP)**: Use Clerk for user authentication, session management, and OAuth integrations. Clerk sits behind an `AuthenticationProvider` interface (`ClerkAuthenticationProvider`) so that it can be swapped if necessary without massive architectural rewrites.
2. **Role-Based Access Control (RBAC)**: We implement hierarchical server-side authorization mapped through our own PostgreSQL database (authoritative).
    - Hierarchy: `OWNER` > `ADMIN` > `MEMBER` > `VIEWER`.
    - Both `OrganizationMembership` and `ProjectMembership` exist. A user's effective project privileges evaluate direct project roles first, falling back to organization roles which are inherited downwards.
3. **Audit Logging**: Any write, creation, or deletion of resources generates a structured `AuditLog` entry in PostgreSQL. Audit events scrub sensitive metadata (e.g., passwords, session tokens) and one-way hash IP addresses.

## Consequences

- **Pros**: Clear, deterministic boundaries mapped heavily into relational PostgreSQL tables. Inherited hierarchy avoids having to redundantly assign permissions at both levels. Clerk handles the complexity of secure IAM flows out-of-the-box.
- **Cons**: We duplicate the shadow "User" identities in our PostgreSQL DB (`id`, `email`) when they authenticate to link them to relational boundaries efficiently. This requires synchronization if a user deletes their account from Clerk.
