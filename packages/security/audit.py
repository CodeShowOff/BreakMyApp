import hashlib
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from packages.domain.models import AuditLog


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def redact_metadata(self, metadata: dict[str, Any] | None) -> dict[str, Any] | None:
        """Redact sensitive keys from metadata before logging."""
        if not metadata:
            return None
        
        redacted = metadata.copy()
        sensitive_keys = ["password", "secret", "token", "key", "authorization", "cookie"]
        
        for k, v in redacted.items():
            if any(s in k.lower() for s in sensitive_keys):
                redacted[k] = "[REDACTED]"
            elif isinstance(v, dict):
                redacted[k] = self.redact_metadata(v)
                
        return redacted

    def hash_ip(self, ip_address: str | None) -> str | None:
        if not ip_address:
            return None
        # Hash IP with a salt (in a real app, use a secret salt)
        salt = "breakmyapp-audit-salt"
        return hashlib.sha256(f"{ip_address}{salt}".encode()).hexdigest()

    async def log_action(
        self,
        organization_id: str,
        actor_id: str | None,
        action: str,
        resource_type: str,
        resource_id: str,
        metadata: dict[str, Any] | None = None,
        ip_address: str | None = None
    ):
        """Create a new audit log entry."""
        log_entry = AuditLog(
            organization_id=organization_id,
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_=self.redact_metadata(metadata),
            ip_hash_or_safe_network_metadata=self.hash_ip(ip_address)
        )
        self.db.add(log_entry)
        await self.db.commit()
