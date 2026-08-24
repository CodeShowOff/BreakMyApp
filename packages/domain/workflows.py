from datetime import timedelta
from typing import Any

from temporalio import workflow
from temporalio.common import RetryPolicy


@workflow.defn
class CreateTestRun:
    @workflow.run
    async def run(self, input_data: dict[str, Any]) -> None:
        test_run_id = input_data["test_run_id"]
        project_id = input_data["project_id"]
        target_id = input_data["target_id"]

        # Standard retry policy for activities that can fail transiently
        retry_policy = RetryPolicy(
            initial_interval=timedelta(seconds=1),
            backoff_coefficient=2.0,
            maximum_interval=timedelta(seconds=60),
            maximum_attempts=5,
        )
        
        # Long tests might need a different policy or no retries
        no_retry_policy = RetryPolicy(
            maximum_attempts=1,
        )

        # 1. Validate Target
        await workflow.execute_activity(
            "ValidateTarget",
            target_id,
            start_to_close_timeout=timedelta(minutes=1),
            retry_policy=retry_policy,
        )

        # 2. Resolve Credentials
        credentials = await workflow.execute_activity(
            "ResolveCredentials",
            project_id,
            start_to_close_timeout=timedelta(minutes=1),
            retry_policy=retry_policy,
        )

        # 3. Provision Sandbox
        sandbox_info = await workflow.execute_activity(
            "ProvisionSandbox",
            test_run_id,
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=retry_policy,
        )
        
        try:
            # 4. Run Test Plan
            evidence_refs = await workflow.execute_activity(
                "RunTestPlan",
                {"test_run_id": test_run_id, "sandbox": sandbox_info, "credentials": credentials},
                start_to_close_timeout=timedelta(minutes=30),
                retry_policy=no_retry_policy, # We don't blindly retry the whole test plan if it fails
            )

            # 5. Collect Evidence
            await workflow.execute_activity(
                "CollectEvidence",
                evidence_refs,
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=retry_policy,
            )

            # 6. Verify Findings
            findings = await workflow.execute_activity(
                "VerifyFindings",
                test_run_id,
                start_to_close_timeout=timedelta(minutes=10),
                retry_policy=retry_policy,
            )

            # 7. Generate Report
            await workflow.execute_activity(
                "GenerateReport",
                {"test_run_id": test_run_id, "findings": findings},
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=retry_policy,
            )
        finally:
            # 8. Finalize Run (cleanups, state updates)
            await workflow.execute_activity(
                "FinalizeRun",
                {"test_run_id": test_run_id, "sandbox": sandbox_info},
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=retry_policy,
            )
