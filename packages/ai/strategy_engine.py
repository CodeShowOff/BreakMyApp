import asyncio
import logging
from typing import Any

from pydantic import BaseModel, Field

from packages.domain.models import TestResult
from packages.security.safe_action import ActionClassification, SafeActionPolicy

logger = logging.getLogger(__name__)

class Budget(BaseModel):
    max_steps: int = Field(default=10)
    max_tokens: int = Field(default=10000)
    max_browser_actions: int = Field(default=20)
    timeout_seconds: int = Field(default=300)

class StrategyContext(BaseModel):
    execution_attempt_id: str
    target_url: str
    identities: list[dict[str, Any]]
    budget: Budget
    app_model: dict[str, Any] | None = None
    business_rules: list[dict[str, Any]] = Field(default_factory=list)

class StrategyEngine:
    """
    Deterministic orchestrator that runs versioned, bounded test strategies.
    Enforces step limits, timeouts, and safe-action policy.
    """

    def __init__(self, context: StrategyContext):
        self.context = context
        self.steps_taken = 0
        self.browser_actions_taken = 0
        self.tokens_used = 0

    async def execute_strategy(self, strategy_type: str, strategy: dict[str, Any]) -> list[TestResult]:
        """
        Executes a specific test strategy.
        Enforces budgets before taking any action.
        """
        results: list[TestResult] = []
        try:
            # Enforce timeout context
            async with asyncio.timeout(self.context.budget.timeout_seconds):
                if strategy_type == "cross_account_authorization":
                    results = await self._run_cross_account_authorization()
                elif strategy_type == "role_boundary":
                    results = await self._run_role_boundary()
                elif strategy_type == "entitlement_boundary":
                    results = await self._run_entitlement_boundary()
                elif strategy_type == "sensitive_data_exposure":
                    results = await self._run_sensitive_data_exposure()
                elif strategy_type == "business_rule_validation":
                    results = await self._run_business_rule_validation()
                else:
                    logger.warning(f"Unknown strategy type: {strategy_type}")
        except TimeoutError:
            logger.error("Strategy execution timed out.")
        
        return results

    def _check_budget(self) -> None:
        """Checks if the budget has been exceeded."""
        if self.steps_taken >= self.context.budget.max_steps:
            raise RuntimeError("Max steps budget exceeded")
        if self.browser_actions_taken >= self.context.budget.max_browser_actions:
            raise RuntimeError("Max browser actions budget exceeded")
        if self.tokens_used >= self.context.budget.max_tokens:
            raise RuntimeError("Max token budget exceeded")

    def _evaluate_action(self, action_name: str, method: str | None = None, url: str | None = None) -> bool:
        """
        Evaluate an action using the SafeActionPolicy.
        Raises an exception if the action is DESTRUCTIVE or FORBIDDEN.
        """
        classification = SafeActionPolicy.evaluate(action_name, method, url)
        if classification in [ActionClassification.DESTRUCTIVE, ActionClassification.FORBIDDEN]:
            raise PermissionError(f"Action {action_name} is classified as {classification} and cannot be executed.")
        return True

    async def _run_cross_account_authorization(self) -> list[TestResult]:
        """
        1. Cross-account authorization
        Determine whether one authorized identity can access resources belonging to another.
        """
        logger.info("Running Cross-Account Authorization strategy")
        self._check_budget()
        self.steps_taken += 1
        
        # Implementation skeleton:
        # 1. Establish identity A & B.
        # 2. Discover B-owned resources.
        # 3. Attempt equivalent access as A.
        # 4. Compare expected vs observed behavior.
        
        # Ensure we do not modify or delete data (evaluating safe action)
        self._evaluate_action("access_resource", "GET", "/api/resources/B-id")
        
        return []

    async def _run_role_boundary(self) -> list[TestResult]:
        """
        2. Role boundary
        Compare authorized identities with different privilege levels.
        """
        logger.info("Running Role Boundary strategy")
        self._check_budget()
        self.steps_taken += 1
        
        # Implementation skeleton:
        # 1. Identify actions available to a higher role.
        # 2. Test whether lower roles can perform those actions.
        
        return []

    async def _run_entitlement_boundary(self) -> list[TestResult]:
        """
        3. Entitlement boundary
        Compare identities such as free, paid, trial, expired.
        """
        logger.info("Running Entitlement Boundary strategy")
        self._check_budget()
        self.steps_taken += 1
        
        # Implementation skeleton:
        # 1. Determine whether restricted functionality remains usable.
        # 2. Do not create purchases or irreversible billing events (SafeActionPolicy handles this).
        
        return []

    async def _run_sensitive_data_exposure(self) -> list[TestResult]:
        """
        4. Sensitive data exposure
        Determine whether a lower-privilege session can access protected data.
        """
        logger.info("Running Sensitive Data Exposure strategy")
        self._check_budget()
        self.steps_taken += 1
        
        # Implementation skeleton:
        # Prefer passive evidence and minimum necessary disclosure.
        
        return []

    async def _run_business_rule_validation(self) -> list[TestResult]:
        """
        5. Business-rule/state validation
        Test expected permission, state transition, expected precondition vs actual behavior.
        """
        logger.info("Running Business Rule Validation strategy")
        self._check_budget()
        self.steps_taken += 1
        
        # Implementation skeleton:
        # Use self.context.business_rules to validate specific scenarios.
        
        return []
