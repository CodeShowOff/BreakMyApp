# 0005. SandboxProvider Abstraction

## Status

Accepted

## Context

The execution plane needs to run untrusted AI-generated code and browser automation scripts against customer targets. This code cannot run directly on the host worker nodes due to security risks. We need an isolated environment (sandbox) for each execution attempt, but the specific sandboxing technology (Docker, Firecracker microVMs, gVisor) may evolve as our scale and security needs change.

## Decision

We will introduce a `SandboxProvider` abstract base class to decouple the execution plane workflows from the underlying sandboxing technology.
The initial implementation will be `DockerSandboxProvider`, which creates heavily restricted containers (read-only filesystem, dropped capabilities, memory/CPU limits, default seccomp, `no-new-privileges:true`). 

## Consequences

- The Temporal workflows and activities do not need to know about Docker or containers; they only interact with the `SandboxProvider` interface.
- Upgrading to a stronger isolation technology like microVMs in the future will only require implementing a new `SandboxProvider` and swapping it in the worker configuration.
- The control plane and execution workflows remain pristine and testable without requiring an actual sandbox environment during unit testing (by using a mock provider).
