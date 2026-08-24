$adrs = @(
    @("0001", "control-plane-vs-execution-plane", "Control Plane versus Execution Plane"),
    @("0002", "postgresql-as-source-of-truth", "PostgreSQL as Source of Truth"),
    @("0003", "temporal-as-durable-workflow-orchestration", "Temporal as Durable Workflow Orchestration"),
    @("0004", "playwright-as-browser-runtime", "Playwright as Browser Runtime"),
    @("0005", "sandboxprovider-abstraction", "SandboxProvider Abstraction"),
    @("0006", "llmprovider-abstraction", "LLMProvider Abstraction"),
    @("0007", "s3-compatible-evidence-storage", "S3-compatible Evidence Storage"),
    @("0008", "secret-references", "Secret References"),
    @("0009", "multi-tenant-authorization-model", "Multi-tenant Authorization Model"),
    @("0010", "evidence-retention-and-redaction", "Evidence Retention and Redaction"),
    @("0011", "browser-execution-security-boundaries", "Browser Execution Security Boundaries"),
    @("0012", "llm-prompt-version-management", "LLM Prompt Version Management"),
    @("0013", "test-strategy-versioning", "Test Strategy Versioning"),
    @("0014", "finding-lifecycle", "Finding Lifecycle"),
    @("0015", "api-versioning", "API Versioning")
)

$template = @"
# {0}. {1}

## Status

Proposed

## Context

[Describe the context and problem here]

## Decision

[Describe the decision here]

## Consequences

[Describe the consequences here]
"@

foreach ($adr in $adrs) {
    $num = $adr[0]
    $slug = $adr[1]
    $title = $adr[2]
    $content = $template -f $num, $title
    $filePath = "docs/adrs/$num-$slug.md"
    Set-Content -Path $filePath -Value $content
}

Write-Host "ADRs generated successfully."
