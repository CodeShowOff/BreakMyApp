import pytest
from datetime import datetime, UTC
from packages.domain.schemas import TargetResponse
from packages.domain.models import Environment, AuthorizationStatus
from packages.security.target_policy import TargetPolicy
from unittest.mock import patch, MagicMock
import socket
import ipaddress

@pytest.fixture
def base_target():
    return TargetResponse(
        id="target-1",
        project_id="proj-1",
        name="Test Target",
        base_url="https://example.com",
        environment=Environment.STAGING,
        allowed_hosts=["example.com", "*.example.com"],
        allowed_url_prefixes=["https://example.com/api/", "http://test.example.com"],
        allowed_ports=[80, 443, 8080],
        authorization_status=AuthorizationStatus.AUTHORIZED,
        authorization_acknowledged_at=datetime.now(UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )

def test_target_policy_exact_hostname(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 443))]
        assert policy.checkNavigation("https://example.com") is True
        assert policy.checkNavigation("https://example.com/") is True
        assert policy.checkNavigation("https://example.com/foo") is True

def test_target_policy_subdomains(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 443))]
        assert policy.checkNavigation("https://api.example.com") is True
        assert policy.checkNavigation("https://staging.example.com/login") is True
        # But not a completely different domain
        assert policy.checkNavigation("https://attacker.com") is False
        # Neither a malicious lookalike
        assert policy.checkNavigation("https://myexample.com") is False
        assert policy.checkNavigation("https://example.com.malicious.com") is False

def test_target_policy_url_prefixes(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 80))]
        
        # Test exact prefix match
        assert policy.checkNavigation("https://example.com/api/v1/users") is True
        assert policy.checkNavigation("http://test.example.com/dashboard") is True
        
        # But not allowed if host isn't allowed and prefix isn't matched
        # Wait, allowed_hosts includes example.com and *.example.com.
        # Let's change allowed_hosts to be empty to purely test prefixes.
        target_prefixes = base_target.model_copy(update={"allowed_hosts": []})
        policy2 = TargetPolicy(target_prefixes)
        
        assert policy2.checkNavigation("https://example.com/api/v1") is True
        assert policy2.checkNavigation("http://test.example.com") is True
        
        # Denied because prefix doesn't match
        assert policy2.checkNavigation("https://example.com/app") is False

def test_target_policy_ports(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 8080))]
        
        # Allowed explicit ports
        assert policy.checkNavigation("https://example.com:8080/path") is True
        
        # Allowed default port for https (443) which is in allowed_ports
        assert policy.checkNavigation("https://example.com") is True
        
        # Denied port
        assert policy.checkNavigation("https://example.com:8443") is False

def test_target_policy_malicious_lookalikes(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 443))]
        
        # Bypass attempts
        assert policy.checkNavigation("https://example.com@attacker.com") is False
        assert policy.checkNavigation("https://attacker.com/example.com") is False
        assert policy.checkNavigation("https://example.com.evil.com") is False

def test_target_policy_encoded_urls(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 443))]
        
        # Testing URL encoding bypass attempts
        assert policy.checkNavigation("https://example%2Ecom") is False # Python's urlparse doesn't decode the hostname before parsing it, so it will not match "example.com"
        assert policy.checkNavigation("https://example.com%40attacker.com") is False
        assert policy.checkNavigation("https://%65xample.com") is False

def test_target_policy_redirects(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 443))]
        
        # Simulating the execution layer checking a redirect chain
        assert policy.checkNavigation("https://example.com/login") is True # Initial
        assert policy.checkNavigation("https://attacker.com/steal") is False # Redirect out of bounds is blocked
        assert policy.checkNavigation("http://test.example.com") is True # Redirect in bounds is allowed


def test_target_policy_alternate_schemes(base_target):
    policy = TargetPolicy(base_target)
    
    # Must only allow http / https
    assert policy.checkNavigation("file:///etc/passwd") is False
    assert policy.checkNavigation("ftp://example.com") is False
    assert policy.checkNavigation("javascript:alert(1)") is False

def test_target_policy_localhost(base_target):
    policy = TargetPolicy(base_target)
    
    # Explicit localhost names
    assert policy.checkNavigation("http://localhost:8080") is False
    assert policy.checkNavigation("http://LOCAL:80") is False

def test_target_policy_private_networks(base_target):
    target_all_hosts = base_target.model_copy(update={"allowed_hosts": ["*"]})
    policy = TargetPolicy(target_all_hosts)
    
    # We'll override the host matching check to always pass just for this test,
    # or just use explicit hostnames and mock DNS returning private IPs.
    target_private = base_target.model_copy(update={"allowed_hosts": ["internal-service.com"]})
    policy_priv = TargetPolicy(target_private)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        # Mock resolving to 10.x.x.x
        mock_dns.return_value = [(2, 1, 6, '', ('10.1.2.3', 80))]
        assert policy_priv.checkNavigation("https://internal-service.com") is False
        
        # Mock resolving to 127.0.0.1
        mock_dns.return_value = [(2, 1, 6, '', ('127.0.0.1', 80))]
        assert policy_priv.checkNavigation("https://internal-service.com") is False
        
        # Mock resolving to 169.254.169.254
        mock_dns.return_value = [(2, 1, 6, '', ('169.254.169.254', 80))]
        assert policy_priv.checkNavigation("https://internal-service.com") is False
        
        # Valid external IP
        mock_dns.return_value = [(2, 1, 6, '', ('8.8.8.8', 80))]
        assert policy_priv.checkNavigation("https://internal-service.com") is True

def test_target_policy_dns_failure(base_target):
    policy = TargetPolicy(base_target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        # If it fails to resolve, it blocks it for safety
        mock_dns.side_effect = socket.gaierror
        assert policy.checkNavigation("https://example.com") is False

def test_target_policy_implicit_base_url():
    target = TargetResponse(
        id="target-1",
        project_id="proj-1",
        name="Test Target",
        base_url="https://example.com",
        environment=Environment.STAGING,
        allowed_hosts=[],
        allowed_url_prefixes=[],
        allowed_ports=[],
        authorization_status=AuthorizationStatus.AUTHORIZED,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC)
    )
    policy = TargetPolicy(target)
    
    with patch("packages.security.target_policy.socket.getaddrinfo") as mock_dns:
        mock_dns.return_value = [(2, 1, 6, '', ('93.184.216.34', 443))]
        
        # If neither hosts nor prefixes defined, it should fallback to matching base_url prefix
        assert policy.checkNavigation("https://example.com") is True
        assert policy.checkNavigation("https://example.com/api/test") is True
        assert policy.checkNavigation("https://sub.example.com") is False
