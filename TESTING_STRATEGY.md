# Testing Strategy

## Overview

Quality and correctness are critical for BreakMyApp. If we claim an application is vulnerable, the evidence must be reproducible and correct. 

Our testing is divided into several layers:

### Unit Tests
*   **Scope:** Individual functions, classes, and domain logic.
*   **Tools:** `pytest` (Python), `jest`/`vitest` (TypeScript).
*   **Focus:** Core business logic, policy engine rules, evidence redaction logic, and data transformation.
*   **Speed:** Must run in seconds.

### Integration Tests
*   **Scope:** Interactions between components (e.g., API to Database, Worker to Temporal).
*   **Tools:** `pytest` with testcontainers or a local compose environment.
*   **Focus:** Database schema correctness, workflow execution paths, external provider adapters (e.g., S3 storage).

### E2E Tests
*   **Scope:** Full user journeys (Frontend to API to Worker).
*   **Tools:** Playwright.
*   **Focus:** Critical paths: Login, Project Creation, Target Configuration, Test Run initiation, and Report viewing.

### Adversarial / Security Tests
*   **Scope:** The AI testing engine itself.
*   **Tools:** Internal vulnerable target applications.
*   **Focus:** Verify the engine can reliably find specific vulnerability classes (e.g., IDOR, privilege escalation) without generating false positives. Ensures security boundaries (like the Target Policy) actually block unauthorized actions.
