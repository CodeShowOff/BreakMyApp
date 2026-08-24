import pytest

from packages.ai.verifier import IndependentVerifier
from packages.domain.models import ConfidenceScore, FindingStatus, SeverityLevel
from packages.domain.schemas import FindingCreate


@pytest.mark.asyncio
async def test_verifier_confirm_finding():
    verifier = IndependentVerifier()
    
    # Simulate a candidate finding from discovery
    candidate = FindingCreate(
        project_id="proj-123",
        target_id="tgt-456",
        test_run_id="run-789",
        title="Test Finding",
        status=FindingStatus.CANDIDATE,
        severity=SeverityLevel.MEDIUM,
        confidence=ConfidenceScore.WEAK,
        severity_policy_version="v0",
        details={
            "identity": "user_a",
            "resource_owner": "user_b",
            "action": "READ",
            "expected_behavior": "Access Denied",
            "observed_behavior": "Returned sensitive invoice data"
        }
    )
    
    result = await verifier.verify_candidate(candidate)
    
    assert result.confidence == ConfidenceScore.CONFIRMED
    assert result.is_reproducible is True
    assert result.evidence["identity_authenticated"] == "user_a"
    assert result.evidence["resource_owned_by"] == "user_b"


@pytest.mark.asyncio
async def test_verifier_reject_false_positive():
    verifier = IndependentVerifier()
    
    # Simulate a candidate where identity is the owner
    candidate = FindingCreate(
        project_id="proj-123",
        target_id="tgt-456",
        test_run_id="run-789",
        title="Test Finding",
        status=FindingStatus.CANDIDATE,
        severity=SeverityLevel.HIGH,
        confidence=ConfidenceScore.STRONG,
        severity_policy_version="v0",
        details={
            "identity": "user_a",
            "resource_owner": "user_a", # Owner matches identity
            "action": "MODIFY",
            "expected_behavior": "Success",
            "observed_behavior": "Success"
        }
    )
    
    result = await verifier.verify_candidate(candidate)
    
    assert result.confidence == ConfidenceScore.FALSE_POSITIVE
    assert result.is_reproducible is True # Reproducible, but not a finding


@pytest.mark.asyncio
async def test_verifier_reject_misleading():
    verifier = IndependentVerifier()
    
    # Simulate a candidate with misleading observed behavior
    candidate = FindingCreate(
        project_id="proj-123",
        target_id="tgt-456",
        test_run_id="run-789",
        title="Test Finding",
        status=FindingStatus.CANDIDATE,
        severity=SeverityLevel.HIGH,
        confidence=ConfidenceScore.STRONG,
        severity_policy_version="v0",
        details={
            "identity": "user_a",
            "resource_owner": "user_b",
            "action": "WRITE",
            "expected_behavior": "Access Denied",
            "observed_behavior": "I intentionally misleadingly think it succeeded"
        }
    )
    
    result = await verifier.verify_candidate(candidate)
    
    assert result.confidence == ConfidenceScore.FALSE_POSITIVE
    assert result.is_reproducible is False


@pytest.mark.asyncio
async def test_verifier_severity_calculation():
    verifier = IndependentVerifier()
    
    # Test DELETE action -> CRITICAL
    severity = verifier._calculate_severity(
        {"action": "DELETE", "data_sensitivity": "LOW"}, 
        ConfidenceScore.CONFIRMED
    )
    assert severity == SeverityLevel.CRITICAL
    
    # Test WRITE action -> HIGH
    severity = verifier._calculate_severity(
        {"action": "WRITE", "data_sensitivity": "LOW"}, 
        ConfidenceScore.CONFIRMED
    )
    assert severity == SeverityLevel.HIGH
    
    # Test READ action (confirmed) -> MEDIUM
    severity = verifier._calculate_severity(
        {"action": "READ", "data_sensitivity": "LOW"}, 
        ConfidenceScore.CONFIRMED
    )
    assert severity == SeverityLevel.MEDIUM
