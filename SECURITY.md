# Security Policy

## Authorized Testing Boundaries

BreakMyApp is a production-grade SaaS for **authorized adversarial testing**. We do not perform or condone arbitrary internet scanning or unauthorized hacking.

### Target Validation
Every test run must explicitly declare a target. Targets are validated and bounded by:
- Allowed hostnames
- Allowed URL prefixes
- Allowed ports
- Environment labels (development, staging, preview)

Any action attempting to navigate outside these authorized boundaries will be blocked and recorded as a policy violation.

## Secrets and Credentials
Customer credentials are treated as highly sensitive.
- Credentials are not stored in plaintext in the database.
- We rely on managed secret references.
- Secrets are never exposed in prompts, logs, traces, or screenshots unless absolutely necessary, and we proactively redact them.

## Execution Isolation
All browser-based tests execute in an isolated execution plane (sandbox).
- Workers do not have access to the host filesystem.
- Workers do not have access to the Docker socket.
- Network egress is strictly restricted.
- No internal cloud metadata access is permitted.

## Reporting a Vulnerability

If you believe you have discovered a vulnerability in BreakMyApp, please do not disclose it publicly. Contact our security team directly.
