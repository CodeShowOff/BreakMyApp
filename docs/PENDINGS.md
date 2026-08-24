# Pending Technical Debt & Future Work

## Phase 3: Credential Vault and Role Model

- **Secret Manager Provider**: The `ManagedSecretProvider` will temporarily use a mock/local store for secrets to demonstrate the interface isolation until a production Secret Manager (e.g., AWS Secrets Manager, HashiCorp Vault) is provisioned.

## Phase 4: Execution Plane and Sandbox

- **Playwright Execution**: The current implementation of `RunTestPlan` uses a dummy python script. We need to implement the actual Python Playwright test engine that authenticates the user and executes the AI hypotheses.
- **Docker Sandbox Privileges**: Currently we run as `pwuser` via Docker's `user` parameter. We should ensure the underlying image strictly restricts this user further, or implement a stronger microVM abstraction when required.

## Phase 5: Browser Agent and Application Explorer

- **Playwright Integration**: Need to integrate the isolated browser contexts with the AI reasoning loop (Explorer role) to build the application model.
