from packages.security.audit import AuditService


def test_redact_metadata():
    service = AuditService(db=None)  # db not needed for redaction
    
    metadata = {
        "user_action": "login",
        "api_key": "sk-1234567890",
        "nested": {
            "token": "secret-token",
            "public_id": "pub-123"
        }
    }
    
    redacted = service.redact_metadata(metadata)
    
    assert redacted["user_action"] == "login"
    assert redacted["api_key"] == "[REDACTED]"
    assert redacted["nested"]["token"] == "[REDACTED]"
    assert redacted["nested"]["public_id"] == "pub-123"

def test_hash_ip():
    service = AuditService(db=None)
    ip1 = "192.168.1.1"
    ip2 = "192.168.1.2"
    
    hash1 = service.hash_ip(ip1)
    hash1_again = service.hash_ip(ip1)
    hash2 = service.hash_ip(ip2)
    
    assert hash1 == hash1_again
    assert hash1 != hash2
    assert ip1 not in hash1
