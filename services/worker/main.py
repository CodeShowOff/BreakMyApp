import asyncio
import logging
import os

from temporalio.client import Client
from temporalio.worker import Worker

from packages.domain.workflows import CreateTestRun
from services.worker.activities import (
    collect_evidence,
    finalize_run,
    generate_report,
    provision_sandbox,
    resolve_credentials,
    run_test_plan,
    validate_target,
    verify_findings,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main() -> None:
    temporal_address = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    logger.info(f"Connecting to Temporal at {temporal_address}...")
    
    try:
        client = await Client.connect(temporal_address)
        logger.info("Connected to Temporal.")
        
        # We will register activities and workflows here in future phases.
        worker = Worker(
            client,
            task_queue="breakmyapp-task-queue",
            workflows=[CreateTestRun],
            activities=[
                validate_target,
                resolve_credentials,
                provision_sandbox,
                run_test_plan,
                collect_evidence,
                verify_findings,
                generate_report,
                finalize_run,
            ],
        )
        logger.info("Starting Temporal Worker...")
        await worker.run()
    except Exception as e:
        logger.error(f"Failed to start worker: {e}")

if __name__ == "__main__":
    asyncio.run(main())
