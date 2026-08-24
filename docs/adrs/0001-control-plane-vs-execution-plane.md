# 0001. Control Plane versus Execution Plane

## Status

Accepted (Core Architecture Principle)

## Context

BreakMyApp executes adversarial security tests against customer web applications. These tests involve running untrusted code (browser automation, AI models exploring DOMs, rendering untrusted web content) which poses a severe security risk if compromised. We need a way to build a reliable, scalable SaaS platform (managing users, billing, orchestration) while safely executing untrusted operations without risking the integrity of the SaaS infrastructure or cross-tenant data.

## Decision

We will explicitly split the system into two distinct environments:

1. **The Control Plane**:
   - Built with Next.js and FastAPI.
   - Responsible for IAM (Organizations, Projects, Users), state management (PostgreSQL), and durable workflows (Temporal).
   - Treated as highly trusted. It never executes arbitrary code or navigates to customer targets directly.

2. **The Execution Plane**:
   - Composed of isolated Sandbox workers running Playwright.
   - Treated as **untrusted**. It has no direct access to the database or cloud control metadata. 
   - Receives scoped jobs from the Control Plane, executes the adversarial exploration against the target, and uploads findings/evidence back.

## Consequences

- **Pros**: Significant security boundaries. If an execution worker is compromised by a malicious target application, the blast radius is contained to that specific ephemeral sandbox, protecting the Control Plane and other tenants' data.
- **Cons**: Increased operational complexity. We must manage two deployment topologies and ensure secure, asynchronous communication (e.g., via Temporal) between the trusted and untrusted planes.
