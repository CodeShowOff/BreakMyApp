import json
import logging
import uuid
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)

class SecretProvider(ABC):
    @abstractmethod
    async def get_credential(self, reference_id: str) -> dict[str, str]:
        """Retrieve the secret values by their reference ID."""
        pass

    @abstractmethod
    async def create_credential(self, secret_data: dict[str, str]) -> str:
        """Store the secret values and return a reference ID."""
        pass

    @abstractmethod
    async def rotate_credential(self, reference_id: str, new_secret_data: dict[str, str]) -> None:
        """Update the secret values for a given reference ID."""
        pass

    @abstractmethod
    async def delete_credential(self, reference_id: str) -> None:
        """Delete the secret values for a given reference ID."""
        pass

class ManagedSecretProvider(SecretProvider):
    """
    A temporary mock for a managed secret provider (e.g., AWS Secrets Manager).
    In a real implementation, this would interact with an external KMS/Vault.
    Secrets are kept purely in-memory here to prevent writing them to disk.
    """
    def __init__(self) -> None:
        self._vault: dict[str, dict[str, str]] = {}
        logger.info("Initialized ManagedSecretProvider (Mock in-memory Vault)")

    async def get_credential(self, reference_id: str) -> dict[str, str]:
        if reference_id not in self._vault:
            raise KeyError(f"Secret reference {reference_id} not found in vault")
        return self._vault[reference_id]

    async def create_credential(self, secret_data: dict[str, str]) -> str:
        reference_id = f"sec-{uuid.uuid4()}"
        self._vault[reference_id] = secret_data.copy()
        return reference_id

    async def rotate_credential(self, reference_id: str, new_secret_data: dict[str, str]) -> None:
        if reference_id not in self._vault:
            raise KeyError(f"Secret reference {reference_id} not found in vault")
        self._vault[reference_id] = new_secret_data.copy()

    async def delete_credential(self, reference_id: str) -> None:
        if reference_id in self._vault:
            del self._vault[reference_id]

# Global instance for dependency injection
secret_provider = ManagedSecretProvider()
