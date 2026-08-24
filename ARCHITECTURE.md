# ARCHITECTURE.md

## 1. Architecture Goal

Build a secure, multi-tenant SaaS with a **modular control plane** and a separately isolated **execution plane**.

Primary goal:

> **Secure execution + reliable workflows + clear domain boundaries + horizontal scalability without unnecessary distributed-system complexity.**

## 2. High-Level Topology

```text
User
 ↓
Next.js / FastAPI
 ↓
Control Plane
 ├─ PostgreSQL
 ├─ Temporal
 ├─ Secret Manager
 └─ Object Storage
        ↓ restricted access
Execution Workers
 ↓
Sandbox + Playwright
 ↓
Authorized Customer Target
```

The control plane owns product state and orchestration. The execution plane performs target interaction and is untrusted.

## 3. Logical Structure

```text
apps/
  web/

services/
  api/
  worker/
  scheduler/

packages/
  domain/
  contracts/
  ai/
  browser/
  evidence/
  security/
  sandbox/
  observability/

infra/
tests/
  unit/
  integration/
  e2e/
  adversarial/
```

Keep the control plane modular rather than prematurely splitting it into microservices. Separate execution workers because security isolation and independent scaling justify the boundary.

## 4. Components & Responsibilities

| Component | Responsibility |
|---|---|
| Next.js | Web UI |
| FastAPI | API + business orchestration |
| PostgreSQL | Transactional source of truth |
| Temporal | Durable workflows/retries/recovery |
| Playwright | Browser runtime |
| SandboxProvider | Isolated execution |
| LLMProvider | AI reasoning/structured decisions |
| ObjectStore | Large immutable artifacts |
| SecretProvider | Credentials/secrets |
| OpenTelemetry | Logs/metrics/traces |
| Stripe | Billing |

Domain logic must use interfaces/adapters rather than depending directly on infrastructure implementations.

## 5. Control Plane

Owns:
- authentication/authorization
- organizations/memberships
- projects
- targets/target policies
- credential metadata
- test plans/runs
- findings/reports
- billing/usage
- audit logs

Requirements:
- stateless and horizontally scalable
- never directly browse/execute against customer targets
- long-running work delegated to Temporal
- explicit tenant context on every request/workflow

## 6. Execution Plane

Responsible for:
- sandbox provisioning
- browser execution
- application exploration
- AI testing
- evidence collection
- finding verification

Workers are untrusted and must have:
- no host filesystem access
- no Docker socket
- no privileged execution
- restricted network egress
- no cloud metadata access
- bounded CPU/memory/time
- bounded browser/model usage
- automatic cleanup

Prefer scoped job credentials and controlled APIs over direct database access.

`SandboxProvider` abstracts the sandbox; Docker is the initial implementation, with a future path to stronger isolation such as microVMs.

## 7. Trust Boundaries

Treat as untrusted:
- customer targets
- webpage/browser content and responses
- uploaded content
- LLM output
- credentials while executing

Deterministic infrastructure enforces security policy. Prompts never enforce security boundaries.

## 8. Core Domain

Primary entities:

```text
Organization
User
OrganizationMembership
Project
Target
TargetPolicy
Credential
TestPlan
TestStrategy
TestCase
TestRun
ExecutionJob
ApplicationModel
Hypothesis
Evidence
Finding
VerificationAttempt
Report
AuditEvent
UsageEvent
Subscription
```

Ownership:

```text
Organization
  ↓
Project
  ↓
Target / Credential / TestRun
  ↓
Execution / Evidence / Finding
```

Every resource must have explicit tenant ownership.

## 9. Data Architecture

PostgreSQL stores authoritative transactional state and metadata.

Object storage stores large immutable artifacts:
- screenshots
- traces
- videos
- reports
- large evidence

PostgreSQL stores references/metadata, not large artifacts.

Secrets exist only in a managed secret system. Never store plaintext credentials in PostgreSQL.

## 10. Multi-Tenancy

Tenant isolation must be enforced at multiple layers:

```text
API authorization
+
domain/service authorization
+
database constraints/RLS where appropriate
```

Never rely on frontend filtering.

Background workflows must preserve and validate organization/project ownership.

## 11. Test Run Workflow

```text
Create Test Run
 → Validate Target
 → Resolve Credentials
 → Provision Sandbox
 → Authenticate Identities
 → Explore Application
 → Build Application Model
 → Run Test Strategies
 → Collect Evidence
 → Verify Findings
 → Generate Report
 → Finalize Run
```

Temporal owns workflow state and recovery.

Activities must be idempotent or safely retryable. Large artifacts never belong in workflow state.

## 12. AI Architecture

Use bounded roles:

```text
Explorer
 → Application Model
 → Hypothesis Generator
 → Test Strategy
 → Browser Agent
 → Evidence
 → Independent Verifier
 → Finding Classifier
```

LLMs may reason and select permitted tools but cannot:
- expand target scope
- access secrets directly
- modify sandbox/security policy
- bypass authorization
- access arbitrary networks
- execute arbitrary host commands
- self-confirm findings

Use `LLMProvider` so model providers can change without changing domain logic.

## 13. Browser Architecture

Playwright is the browser runtime.

Each test identity receives an isolated browser context:

```text
Browser
 ├─ Customer A
 ├─ Customer B
 └─ Admin
```

Expose only restricted browser operations such as navigation, interaction, extraction, link/form inspection, network metadata inspection, and screenshots.

Browser actions cannot modify security policy.

## 14. Target Policy

Every target defines:

```text
base_url
allowed_hosts
allowed_url_prefixes
allowed_ports
environment
authorization_status
```

Every navigation/request must pass this policy.

Default environments:
- development
- staging
- preview

Do not permit arbitrary internet scanning. Block internal/private destinations and cloud metadata endpoints unless explicitly supported by a future controlled design.

## 15. Evidence & Findings

Pipeline:

```text
Browser
 → Evidence Collector
 → Redaction
 → Object Storage
 → Evidence Metadata
 → Finding
```

Redact passwords, cookies, session tokens, authorization headers, API keys, and unnecessary sensitive personal data.

Finding lifecycle:

```text
Candidate
 → Verifying
 → Confirmed
 → Resolved
```

Alternative terminal states: `Rejected`, `Inconclusive`, `Expired`.

Independent verification is mandatory before `Confirmed`.

## 16. Scalability

Scale independently where justified:

```text
Web/API             → multiple instances
Temporal Workers    → multiple workers
Execution Workers   → autoscaled independently
PostgreSQL          → pooling/read scaling when required
Object Storage      → independently scalable
LLM                 → routing + concurrency limits
```

Primary scaling dimensions:
- concurrent test runs
- browser sessions
- LLM calls
- evidence volume
- API traffic
- organizations/projects

Do not introduce Kafka, sharding, CQRS, or broad microservices until measured scale requires them.

## 17. Reliability

All external dependencies can fail.

Use:
- timeouts
- bounded retries
- exponential backoff
- idempotency
- cancellation
- explicit failure states
- recovery

A test run must end explicitly as:

`completed | failed | cancelled | timed_out | policy_blocked`

Never silently report partial work as successful.

## 18. Observability

Propagate:

```text
request_id
organization_id
project_id
test_run_id
execution_id
workflow_id
```

Collect structured logs, metrics, distributed traces, LLM cost/usage, browser metrics, duration, finding statistics, sandbox failures, and policy violations.

An operator must be able to trace:

```text
API → workflow → worker → browser → evidence → finding
```

## 19. Deployment

```text
Internet
 ↓
CDN/WAF
 ↓
Next.js + FastAPI
 ├─ PostgreSQL
 ├─ Temporal
 └─ Object Storage
       ↓
Execution Workers
       ↓
Sandbox
       ↓
Playwright
       ↓
Authorized Target
```

Execution workers must have materially fewer privileges than control-plane services.

Use managed secrets, encrypted storage, backups, monitoring, and infrastructure-as-code.

## 20. CI/CD

```text
PR
 → lint/type-check
 → unit tests
 → integration tests
 → security tests
 → build
 → image/container checks
 → staging
 → internal security lab
 → production
```

Production deployment must not bypass security/regression validation.

## 21. Evolution & Decision Rules

Expected evolution:

```text
Modular control plane + Docker
 → autoscaled execution workers
 → stronger sandbox/microVM
 → multi-region execution
 → advanced DB scaling/partitioning
```

Do not build future-scale infrastructure early. Preserve interfaces so upgrades do not require domain rewrites.

For every architectural change:
1. Preserve domain boundaries.
2. Prefer stateless services.
3. Keep long-running work asynchronous.
4. Keep execution isolated.
5. Keep infrastructure replaceable.
6. Enforce security deterministically.
7. Make operations observable and retry-safe.
8. Choose the simplest architecture meeting current scale.
9. Record fundamental changes as ADRs.

When tradeoffs exist, prefer:

**secure → correct → observable → scalable → maintainable → simple**

Never sacrifice a security boundary for convenience or correctness for AI autonomy.
