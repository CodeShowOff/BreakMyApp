import json
import re
from typing import Any

# Common patterns for sensitive data
PATTERNS = {
    # JWTs usually start with eyJ and contain two dots
    "jwt": re.compile(r"eyJ[a-zA-Z0-9\-_]+\.eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+"),
    # General Bearer tokens
    "bearer": re.compile(r"Bearer\s+[a-zA-Z0-9\-\._~+/]+=*"),
    # AWS Access Key ID
    "aws_ak": re.compile(r"(?<![A-Z0-9])[A-Z0-9]{20}(?![A-Z0-9])"),
    # AWS Secret Access Key (rough approximation, 40 chars base64-like)
    "aws_secret": re.compile(r"(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])"),
}

# Keys to completely redact in JSON objects
SENSITIVE_KEYS = {
    "password",
    "passwd",
    "pwd",
    "secret",
    "api_key",
    "apikey",
    "access_token",
    "token",
    "session",
    "session_id",
    "authorization",
    "cookie",
    "set-cookie",
}


class Redactor:
    def __init__(self, known_secrets: list[str] | None = None):
        """
        Initialize the redactor with an optional list of known secrets (e.g., from the credential vault)
        to explicitly search for and redact.
        """
        self.known_secrets = []
        if known_secrets:
            # Sort by length descending to replace longest secrets first (prevent partial matches)
            self.known_secrets = sorted(known_secrets, key=len, reverse=True)

    def _redact_string(self, text: str) -> str:
        """Redact sensitive patterns and known secrets from a string."""
        if not text:
            return text
            
        redacted = text
        
        # Redact known explicit secrets
        for secret in self.known_secrets:
            if secret and len(secret) > 3: # Don't replace tiny strings to avoid false positives
                redacted = redacted.replace(secret, "[REDACTED_SECRET]")

        # Redact common patterns
        redacted = PATTERNS["jwt"].sub("[REDACTED_JWT]", redacted)
        redacted = PATTERNS["bearer"].sub("Bearer [REDACTED_TOKEN]", redacted)
        
        # We might not want to blindly run AWS pattern replacements on all text unless it looks suspicious, 
        # but for security testing platforms it's safer to over-redact.
        redacted = PATTERNS["aws_ak"].sub("[REDACTED_AWS_AK]", redacted)
        
        return redacted

    def redact(self, data: Any) -> Any:
        """
        Recursively redact sensitive data from strings, lists, or dicts.
        """
        if isinstance(data, str):
            # Try to parse as JSON first in case it's stringified JSON
            try:
                parsed = json.loads(data)
                # Only proceed if it actually parsed into a dict or list
                if isinstance(parsed, (dict, list)):
                    redacted_parsed = self.redact(parsed)
                    return json.dumps(redacted_parsed)
            except (json.JSONDecodeError, TypeError):
                pass
            
            return self._redact_string(data)
            
        elif isinstance(data, dict):
            redacted_dict = {}
            for k, v in data.items():
                if isinstance(k, str) and k.lower() in SENSITIVE_KEYS:
                    redacted_dict[k] = "[REDACTED]"
                else:
                    redacted_dict[k] = self.redact(v)
            return redacted_dict
            
        elif isinstance(data, list):
            return [self.redact(item) for item in data]
            
        return data


def redact_evidence(evidence: Any, known_secrets: list[str] | None = None) -> Any:
    """Convenience function to redact evidence."""
    redactor = Redactor(known_secrets=known_secrets)
    return redactor.redact(evidence)
