import json

from packages.evidence.redactor import Redactor, redact_evidence


def test_redact_string_patterns():
    # Test JWT
    text_with_jwt = "Token: eyJhbGciOiJIUzI1NiIsInR5cCI.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    redacted = redact_evidence(text_with_jwt)
    assert "[REDACTED_JWT]" in redacted
    assert "eyJ" not in redacted
    
    # Test Bearer
    text_with_bearer = "Authorization: Bearer test123abc=="
    redacted = redact_evidence(text_with_bearer)
    assert "Bearer [REDACTED_TOKEN]" in redacted
    assert "test123abc==" not in redacted
    
    # Test AWS Access Key
    text_with_aws = "AWS_KEY=AKIAIOSFODNN7EXAMPLE"
    redacted = redact_evidence(text_with_aws)
    assert "[REDACTED_AWS_AK]" in redacted
    assert "AKIAIOSFODNN7EXAMPLE" not in redacted


def test_redact_known_secrets():
    known_secrets = ["super-secret-password-123!", "another_secret"]
    text = "Connecting with pwd: super-secret-password-123! and another_secret in log"
    redacted = redact_evidence(text, known_secrets=known_secrets)
    assert "[REDACTED_SECRET]" in redacted
    assert "super-secret-password-123!" not in redacted
    assert "another_secret" not in redacted
    # Order test (longest first should prevent partial matches if one is a substring of another)
    secrets_overlap = ["secret", "my-super-secret"]
    text_overlap = "using my-super-secret"
    redactor = Redactor(known_secrets=secrets_overlap)
    assert redactor.known_secrets == ["my-super-secret", "secret"]
    assert redactor.redact(text_overlap) == "using [REDACTED_SECRET]"


def test_redact_json_keys():
    evidence_json = {
        "url": "http://target.local",
        "headers": {
            "Host": "target.local",
            "Authorization": "Bearer eyJhbG...",
            "Cookie": "session=123456"
        },
        "response": {
            "status": 200,
            "data": {
                "password": "my_password_123",
                "apikey": "key_abcdef"
            }
        }
    }
    
    redacted = redact_evidence(evidence_json)
    assert redacted["headers"]["Authorization"] == "[REDACTED]"
    assert redacted["headers"]["Cookie"] == "[REDACTED]"
    assert redacted["response"]["data"]["password"] == "[REDACTED]"
    assert redacted["response"]["data"]["apikey"] == "[REDACTED]"
    assert redacted["url"] == "http://target.local"


def test_redact_stringified_json():
    evidence_str = '{"session_id": "999", "message": "hello"}'
    redacted = redact_evidence(evidence_str)
    
    # It should parse, redact, and re-serialize
    parsed_redacted = json.loads(redacted)
    assert parsed_redacted["session_id"] == "[REDACTED]"
    assert parsed_redacted["message"] == "hello"

def test_no_false_positives_for_short_secrets():
    redacted = redact_evidence("this is a test", known_secrets=["is", "a"])
    assert "this is a test" == redacted # Too short to redact

