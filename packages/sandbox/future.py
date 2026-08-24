import logging
from typing import Any, Dict

from .provider import SandboxProvider

logger = logging.getLogger(__name__)

class FutureSandboxProvider(SandboxProvider):
    """
    A stub provider to demonstrate that the architecture supports
    stronger microVM isolation (e.g., Firecracker) in the future.
    """
    
    async def provision_sandbox(self, sandbox_id: str, config: Dict[str, Any]) -> str:
        logger.info(f"FutureSandboxProvider: Provisioning microVM for {sandbox_id}")
        return f"vm-{sandbox_id}"

    async def execute_command(self, provider_sandbox_id: str, command: list[str], timeout: int = 60) -> tuple[int, str, str]:
        logger.info(f"FutureSandboxProvider: Executing command in {provider_sandbox_id}: {command}")
        return 0, "mock stdout", ""

    async def destroy_sandbox(self, provider_sandbox_id: str) -> None:
        logger.info(f"FutureSandboxProvider: Destroying microVM {provider_sandbox_id}")
