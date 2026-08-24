import logging
from typing import Any

from temporalio import activity

from packages.ai.strategy_engine import Budget, StrategyContext, StrategyEngine
from packages.sandbox.docker import DockerSandboxProvider

logger = logging.getLogger(__name__)

# Sandbox provider could be injected or instantiated per activity.
sandbox_provider = DockerSandboxProvider()

@activity.defn(name="ValidateTarget")
async def validate_target(target_id: str) -> bool:
    logger.info(f"Validating target {target_id}")
    # In a real implementation, we would look up the target from the database,
    # verify DNS, check if it's reachable, and ensure it complies with policies.
    return True

@activity.defn(name="ResolveCredentials")
async def resolve_credentials(project_id: str) -> list[dict[str, Any]]:
    logger.info(f"Resolving credentials for project {project_id}")
    # In a real implementation, we would query the database for credential metadata,
    # and retrieve the actual secrets from the Secret Manager.
    return [{"label": "Admin", "secret": "mock_secret"}]

@activity.defn(name="ProvisionSandbox")
async def provision_sandbox(test_run_id: str) -> dict[str, Any]:
    logger.info(f"Provisioning sandbox for test run {test_run_id}")
    # We use our DockerSandboxProvider to spin up an isolated environment.
    container_id = await sandbox_provider.provision_sandbox(f"run-{test_run_id}", {})
    return {"provider": "docker", "sandbox_id": container_id}

@activity.defn(name="RunTestPlan")
async def run_test_plan(input_data: dict[str, Any]) -> list[str]:
    test_run_id = input_data["test_run_id"]
    sandbox_info = input_data["sandbox"]
    
    logger.info(f"Running test plan for {test_run_id} in sandbox {sandbox_info['sandbox_id']}")
    
    # Example of running a script inside the sandbox.
    # In practice, we'd inject a python script that runs Playwright,
    # authenticates, explores, and stores output in the tmpfs.
    command = ["python3", "-c", "print('Playwright test plan executed')"]
    exit_code, stdout, stderr = await sandbox_provider.execute_command(
        sandbox_info["sandbox_id"], 
        command
    )
    
    logger.info(f"Test plan exit code: {exit_code}, output: {stdout}")
    
    # Returns object storage references to evidence (traces, screenshots)
    return ["s3://bucket/evidence-1.zip"]

@activity.defn(name="CollectEvidence")
async def collect_evidence(evidence_refs: list[str]) -> bool:
    logger.info(f"Collecting and redacting evidence: {evidence_refs}")
    # Here we would download evidence, redact sensitive info, and re-upload.
    return True

@activity.defn(name="ExecuteTestStrategy")
async def execute_test_strategy(input_data: dict[str, Any]) -> list[dict[str, Any]]:
    logger.info(f"Executing test strategy for test run {input_data.get('test_run_id')}")
    
    budget = Budget(**input_data.get("budget", {}))
    context = StrategyContext(
        execution_attempt_id=input_data["execution_attempt_id"],
        target_url=input_data["target_url"],
        identities=input_data.get("identities", []),
        budget=budget,
        app_model=input_data.get("app_model"),
        business_rules=input_data.get("business_rules", [])
    )
    
    engine = StrategyEngine(context)
    results = await engine.execute_strategy(input_data["strategy_type"], input_data.get("strategy_data", {}))
    
    return [
        {
            "expected_behavior": r.expected_behavior,
            "observed_behavior": r.observed_behavior,
            "rule_or_state_tested": r.rule_or_state_tested,
            "evidence": r.evidence,
            "strategy_version": r.strategy_version
        } for r in results
    ]

@activity.defn(name="VerifyFindings")
async def verify_findings(test_run_id: str) -> list[dict[str, Any]]:
    logger.info(f"Verifying findings for test run {test_run_id}")
    # The AI independent verifier checks the evidence against the hypotheses.
    return [{"finding": "Example Vulnerability", "status": "confirmed"}]

@activity.defn(name="GenerateReport")
async def generate_report(input_data: dict[str, Any]) -> str:
    test_run_id = input_data["test_run_id"]
    logger.info(f"Generating report for test run {test_run_id}")
    # Generate markdown or PDF report and store in object storage.
    return "s3://bucket/reports/report-1.pdf"

@activity.defn(name="FinalizeRun")
async def finalize_run(input_data: dict[str, Any]) -> bool:
    test_run_id = input_data["test_run_id"]
    sandbox_info = input_data["sandbox"]
    
    logger.info(f"Finalizing test run {test_run_id}")
    
    # Cleanup sandbox
    try:
        await sandbox_provider.destroy_sandbox(sandbox_info["sandbox_id"])
    except Exception as e:
        logger.error(f"Failed to destroy sandbox: {e}")
        
    # Update DB state to COMPLETED
    return True
