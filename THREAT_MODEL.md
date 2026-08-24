# Threat Model

BreakMyApp operates an execution plane that runs arbitrary AI-driven browser actions against customer-defined targets. This inherently presents several attack surfaces.

## Trust Boundaries

1.  **Untrusted Entities:**
    *   **Customer Targets:** The web application being tested is considered hostile. It could attempt to exploit the browser or network.
    *   **Browser Content:** DOM, JavaScript, and HTTP responses returned by the target.
    *   **LLM Outputs:** We do not blindly trust the AI. It cannot dictate security boundaries or self-verify findings.
    *   **Execution Workers:** Assume the sandbox environment could be compromised by a sophisticated target payload.

2.  **Trusted Entities:**
    *   **Control Plane:** The API, database, and workflow engine.
    *   **Secret Manager:** Where credentials reside.
    *   **Target Policy:** The deterministic ruleset for what is allowed.

## Key Threats & Mitigations

*   **Threat:** AI hallucinates or maliciously decides to scan an unauthorized target.
    *   **Mitigation:** The target policy acts as a deterministic network filter. All actions must pass the policy engine.
*   **Threat:** The execution worker is compromised by an exploit in the target application.
    *   **Mitigation:** The worker has no host filesystem access, no Docker socket access, and restricted network egress.
*   **Threat:** Secrets are leaked in a generated report.
    *   **Mitigation:** Evidence redaction pipelines scrub passwords, tokens, and authorization headers before storage.
*   **Threat:** An attacker uses the platform as an open proxy.
    *   **Mitigation:** The platform enforces strict target definitions (URL, allowed hosts, ports). Default environments are restricted.
