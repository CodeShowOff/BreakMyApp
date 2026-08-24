# 0016. Target Boundary Enforcement

## Status

Accepted

## Context

BreakMyApp uses AI-driven agents to independently explore and test target applications. Because the system can make network requests on behalf of the customer, there is a substantial risk that agents could be manipulated (via prompt injection or accidental navigation) into attacking arbitrary internet infrastructure or internal cloud services (e.g. Server-Side Request Forgery).

We must ensure that the platform only tests explicitly authorized targets and never accesses out-of-scope infrastructure.

## Decision

We have implemented a strict **Target Registration and Authorized Testing Boundary** mechanism (Phase 2):

1. **Explicit Authorization**: Target environments (development, staging, preview) cannot be registered without explicit user acknowledgement (`authorization_acknowledged: bool`) proving authorization to test the application.
2. **Deterministic TargetPolicy**: A centralized programmatic `TargetPolicy` acts as a firewall before any network access. It performs pre-flight checks on all URLs and navigations.
3. **DNS-Level SSRF Prevention**: The `TargetPolicy` resolves hostnames to their underlying IPs before allowing access, explicitly denying routing to private networks (`10.0.0.0/8`, `127.0.0.0/8`, etc.) and cloud metadata endpoints (`169.254.169.254`).
4. **Reachability with Disabled Redirects**: Upon registration, targets are verified via `httpx`. We disabled `follow_redirects` during this phase so that a malicious server cannot redirect our validation request to an internal private IP, bypassing the policy checks.

## Consequences

* **Security**: It guarantees that the AI agents operate entirely within safe, customer-defined boundaries.
* **Flexibility**: We can support exact matches, wildcards (subdomains), specific ports, and URL prefixes cleanly.
* **Operational Overhead**: Target registration failures due to unreachable environments or DNS misconfigurations are blocked early, improving system stability.
