# PROJECT_CONTEXT.md

## Product Identity

**BreakMyApp** is a production-grade, multi-tenant SaaS for authorized adversarial testing of web applications.

Core promise:

> **Your AI coding agent builds the software. Our AI tries to break it before your users do.**

The product tests whether an application’s **actual behavior and business logic** can be abused by authorized users. It is not a generic internet hacking platform.

## Product Input

A customer provides:
- An authorized development, staging, or preview application.
- Test identities representing relevant users/roles.
- A short description of intended application behavior.

The platform then:
1. Validates target scope and authorization.
2. Creates an isolated execution environment.
3. Authenticates separate test identities.
4. Explores the application.
5. Builds an application model of roles, objects, relationships, permissions, and workflows.
6. Generates bounded adversarial hypotheses.
7. Executes safe tests.
8. Collects and redacts evidence.
9. Independently verifies suspected vulnerabilities.
10. Classifies findings and produces a reproducible report.
11. Supports retesting/security regression after fixes.

**Discovery is not proof.** No AI hypothesis becomes a confirmed finding without independent verification.

## Initial Product Wedge

Focus first on authenticated application behavior and authorization:

1. **Cross-account authorization** — Can one user access another user's/tenant's resources?
2. **Role/privilege boundaries** — Can a lower-privilege role perform higher-privilege actions?
3. **Feature/entitlement boundaries** — Can a user access functionality excluded by role, plan, or entitlement?
4. **Sensitive data exposure** — Can a user access data belonging to another user, tenant, or privilege level?

Do not attempt to cover every vulnerability category initially.

Later strategies may include workflow manipulation, invitation lifecycle, file access, session lifecycle, duplicate actions, state-machine abuse, and security regression.

## Core Product Loop

```text
Authorized staging target
        ↓
Test identities + intended behavior
        ↓
Target validation + isolated execution
        ↓
Application exploration
        ↓
Application model
        ↓
Bounded adversarial testing
        ↓
Evidence
        ↓
Independent verification
        ↓
Finding + report
        ↓
Fix
        ↓
Retest / security regression
```

## Example of the Desired Outcome

For a multi-tenant invoicing app, if Customer A can access Customer B's invoice:
- The system must reproduce the behavior independently.
- Evidence must show what was expected vs. observed.
- The finding must identify the affected authorization boundary.
- Evidence must be sufficient for a developer to reproduce the issue.
- Remediation should point to the required server-side authorization/ownership enforcement.

The product should earn the reputation:

> **If it says your app is vulnerable, you can reproduce it.**

## Trust & Safety Model

Two planes exist:

### Control Plane
Owns product state and orchestration:
- users, organizations, projects
- targets and target policy
- credential metadata
- test plans/runs
- findings and reports
- billing, usage, audit logs

### Execution Plane
Performs:
- sandbox provisioning
- browser automation
- application exploration
- AI-assisted testing
- evidence collection
- verification

The execution plane, customer target, webpage content, browser responses, uploaded content, and LLM output are untrusted.

**Security boundaries must never depend on AI instructions.** Deterministic authorization, target policy, sandboxing, network restrictions, secret isolation, resource limits, and other infrastructure controls enforce them.

## AI Operating Model

Do not build one unrestricted autonomous hacking agent.

Use bounded roles such as:

```text
Orchestrator
  → Explorer
  → Application Model
  → Hypothesis/Test Strategy
  → Browser Agent
  → Evidence
  → Independent Verifier
  → Finding Classifier
```

AI may reason, classify, and select permitted tools. It must not:
- expand target scope
- access secrets directly
- change sandbox/network policy
- bypass authorization
- access arbitrary networks
- execute arbitrary host commands
- confirm its own findings

Use structured outputs and independent verification.

## Security Boundaries

Every target must explicitly define:
- base URL
- allowed hostnames
- allowed URL prefixes
- allowed ports
- environment
- authorization status

Default supported environments: development, staging, preview.

Never silently test arbitrary production targets. Block arbitrary internet scanning and uncontrolled access to internal/private infrastructure.

Test identities use separate browser contexts. Credentials are secrets: store only references in application data and retrieve them only inside the isolated execution environment. Never expose credentials in prompts, logs, traces, screenshots where avoidable, metrics, reports, or ordinary database records.

## Evidence & Findings

Evidence is a first-class product asset and should be immutable/append-only.

Store large artifacts such as screenshots, traces, videos, and reports in object storage; keep metadata/references in PostgreSQL.

Redact passwords, cookies, session tokens, authorization headers, API keys, and unnecessary sensitive personal data.

Finding lifecycle:

```text
candidate → verifying → confirmed → resolved
                         ↘ rejected
                         ↘ inconclusive
                         ↘ expired
```

A candidate can never become confirmed from an AI hypothesis alone.

## Production Baseline

Preferred technology direction:
- Frontend: Next.js + TypeScript
- API: FastAPI + Python
- Database: PostgreSQL
- Workflow/orchestration: Temporal
- Browser: Playwright
- AI: `LLMProvider` abstraction; OpenAI initially
- Sandbox: `SandboxProvider`; Docker initially
- Secrets: managed secret manager/KMS
- Object storage: S3-compatible
- Observability: OpenTelemetry
- CI/CD: GitHub Actions
- Billing: Stripe

Infrastructure must sit behind replaceable interfaces where it crosses domain boundaries.

## Engineering Priorities

Order decisions by:

**security → correctness → isolation → verification → reproducibility → observability → reliability → maintainability → cost → UX**

Principles:
- Production-first; secure defaults and explicit failure handling.
- Modular monolith for the control plane; split services only for real scaling, security, or failure-isolation needs.
- Stateless control-plane services.
- Long-running work is asynchronous through Temporal.
- PostgreSQL is the transactional source of truth.
- Evidence is immutable; large artifacts belong in object storage.
- Retries must be safe/idempotent.
- All important operations are observable.
- Bound execution time, browser actions, network requests, concurrency, model calls, tokens/cost, evidence, and storage.
- Prefer simple replaceable components over premature abstraction/distribution.
- Fundamental architectural changes require an ADR.
- Never trade a security boundary or correctness for AI autonomy or short-term speed.

## Testing & Validation

Maintain an internal vulnerable/secure application lab.

Evaluate major testing-engine changes for:
- true positives
- false positives
- missed vulnerabilities
- verification accuracy
- runtime
- cost
- policy violations

Testing should include unit, integration, E2E, adversarial/security tests, and AI evaluation benchmarks. Critical security boundaries require deterministic tests.

## First Milestone

Before dashboards, billing, enterprise features, or many strategies, prove:

```text
Authorized vulnerable staging app
+ User A
+ User B
        ↓
Explore
        ↓
Identify B-owned resource
        ↓
Attempt access as A
        ↓
Independent verification
        ↓
Convincing evidence
        ↓
Understandable vulnerability report
```

The system must reliably demonstrate this against intentionally vulnerable internal applications before broadening scope.

## Long-Term Vision

Become **continuous adversarial security testing for software built and changed by AI coding agents**:

```text
AI code change
  → deployment
  → relevant change detection
  → targeted adversarial tests
  → security regression tests
  → new behavior discovery
  → independent verification
  → PASS / FAIL
```

Everything else should grow around the reliable core testing-and-verification loop.
