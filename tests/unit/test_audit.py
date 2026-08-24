from typing import Any, cast

from sqlalchemy.ext.asyncio import AsyncSession

from packages.security.audit import AuditService


def test_redact_metadata() -> None:
    service = AuditService(db=cast(AsyncSession, None))  # db not needed for redaction
    
    metadata = {
        "user_action": "login",
        "api_key": "sk-1234567890",
        "nested": {
            "token": "secret-token",
            "public_id": "pub-123"
        }
    }
    
    redacted = cast(dict[str, Any], service.redact_metadata(metadata))
    
    assert redacted["user_action"] == "login"
    assert redacted["api_key"] == "[REDACTED]"
    assert redacted["nested"]["token"] == "[REDACTED]"
    assert redacted["nested"]["public_id"] == "pub-123"

def test_hash_ip() -> None:
    service = AuditService(db=cast(AsyncSession, None))
    ip1 = "192.168.1.1"
    ip2 = "192.168.1.2"
    
    hash1 = service.hash_ip(ip1)
    hash1_again = service.hash_ip(ip1)
    hash2 = service.hash_ip(ip2)
    
    assert hash1 == hash1_again
    assert hash1 != hash2
    assert str(ip1) not in str(hash1)
