from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class SandboxProvider(ABC):
    @abstractmethod
    async def provision_sandbox(self, sandbox_id: str, config: Dict[str, Any]) -> str:
        """
        Provision a new isolated sandbox.
        Returns a provider-specific sandbox identifier (e.g., container ID).
        """
        pass

    @abstractmethod
    async def execute_command(self, provider_sandbox_id: str, command: list[str], timeout: int = 60) -> tuple[int, str, str]:
        """
        Execute a command inside the sandbox.
        Returns (exit_code, stdout, stderr).
        """
        pass

    @abstractmethod
    async def destroy_sandbox(self, provider_sandbox_id: str) -> None:
        """
        Destroy the sandbox and clean up all resources.
        """
        pass
