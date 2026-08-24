import httpx
from typing import Any, Dict, List
import time
import random

class BreakMyAppClient:
    def __init__(self, base_url: str, token: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self._client = httpx.Client(
            base_url=self.base_url,
            headers={"Authorization": f"Bearer {token}"} if token else {}
        )

    def exchange_oidc_token(self, oidc_token: str) -> str:
        # MOCK IMPLEMENTATION
        print("[Mock] Exchanging OIDC token for BreakMyApp API token...")
        return "bma_mock_token_12345"
        
    def start_test_run(self, project_id: str, config_data: Dict[str, Any]) -> str:
        # MOCK IMPLEMENTATION
        print(f"[Mock] Starting test run for project {project_id}...")
        return f"tr_{int(time.time())}"
        
    def get_test_run_status(self, test_run_id: str) -> Dict[str, Any]:
        # MOCK IMPLEMENTATION
        # Simulate some polling delay then finish
        import time
        if not hasattr(self, '_mock_start_time'):
            self._mock_start_time = time.time()
            
        elapsed = time.time() - self._mock_start_time
        if elapsed < 5:
            return {"status": "running"}
        
        # After 5 seconds, finish and return findings
        return {
            "status": "completed",
            "findings": [
                {"id": "f_1", "severity": "confirmed_critical", "title": "Cross-account access via ID manipulation"},
                {"id": "f_2", "severity": "confirmed_high", "title": "Role boundary violation in settings"}
            ]
        }

    def get_findings(self, project_id: str) -> List[Dict[str, Any]]:
        # MOCK IMPLEMENTATION
        return [
            {"id": "f_1", "severity": "confirmed_critical", "title": "Cross-account access via ID manipulation"},
            {"id": "f_2", "severity": "confirmed_high", "title": "Role boundary violation in settings"}
        ]
        
    def trigger_retest(self, finding_id: str) -> str:
        # MOCK IMPLEMENTATION
        print(f"[Mock] Triggering retest for finding {finding_id}...")
        return f"tr_{int(time.time())}"
        
    def mark_baseline(self, findings: List[str]) -> bool:
        # MOCK IMPLEMENTATION
        print(f"[Mock] Marking {len(findings)} findings as baseline...")
        return True
