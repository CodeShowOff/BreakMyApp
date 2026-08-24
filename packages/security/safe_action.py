import enum
from typing import Any, ClassVar


class ActionClassification(str, enum.Enum):
    SAFE = "SAFE"             # Read operations, normal navigation
    CAUTION = "CAUTION"       # Creation operations that can be undone, minor state changes
    DESTRUCTIVE = "DESTRUCTIVE" # Deletion, irreversible operations, real payments
    FORBIDDEN = "FORBIDDEN"     # Anything crossing authorization bounds deterministically, exploits out of scope

class ActionIntent(enum.Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    EXECUTE = "execute"

class SafeActionPolicy:
    """
    Deterministic policy layer.
    Classifies actions and strictly blocks Destructive/Forbidden operations.
    Does NOT rely on LLM for enforcement.
    """
    
    DESTRUCTIVE_KEYWORDS: ClassVar[list[str]] = [
        "delete", "remove", "drop", "destroy", "cancel", "refund", "pay", "charge",
        "checkout", "purchase", "billing", "invoice", "credit", "card"
    ]

    FORBIDDEN_KEYWORDS: ClassVar[list[str]] = [
        "sql", "inject", "script", "eval", "exec", "system", "cmd", "shell",
        "password", "secret", "token", "credential"
    ]

    @classmethod
    def classify_action(cls, action_name: str, method: str | None = None, url: str | None = None) -> ActionClassification:
        name_lower = action_name.lower() if action_name else ""
        url_lower = url.lower() if url else ""
        method_upper = method.upper() if method else "GET"

        # 1. Check for Forbidden patterns
        if any(keyword in name_lower or keyword in url_lower for keyword in cls.FORBIDDEN_KEYWORDS):
            return ActionClassification.FORBIDDEN

        # 2. Check for Destructive patterns
        if method_upper == "DELETE":
            return ActionClassification.DESTRUCTIVE
            
        if any(keyword in name_lower or keyword in url_lower for keyword in cls.DESTRUCTIVE_KEYWORDS):
            return ActionClassification.DESTRUCTIVE

        # 3. Check for Caution patterns (Modifying state)
        if method_upper in ["POST", "PUT", "PATCH"]:
            return ActionClassification.CAUTION
            
        caution_keywords = ["create", "add", "update", "edit", "save", "submit", "post"]
        if any(keyword in name_lower or keyword in url_lower for keyword in caution_keywords):
            return ActionClassification.CAUTION

        # 4. Default to Safe (Read-only)
        return ActionClassification.SAFE

    @classmethod
    def evaluate(cls, action_name: str, method: str | None = None, url: str | None = None) -> ActionClassification:
        """
        Evaluate an action and return its classification.
        In the execution engine, DESTRUCTIVE and FORBIDDEN must be blocked deterministically.
        """
        return cls.classify_action(action_name, method, url)
