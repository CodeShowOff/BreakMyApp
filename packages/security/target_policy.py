import socket
import ipaddress
from urllib.parse import urlparse

from packages.domain.schemas import TargetResponse

class TargetPolicy:
    def __init__(self, target: TargetResponse):
        self.target = target
        self.allowed_hosts = set(target.allowed_hosts)
        self.allowed_url_prefixes = target.allowed_url_prefixes
        self.allowed_ports = set(target.allowed_ports)

    def is_private_ip(self, ip_str: str) -> bool:
        try:
            ip = ipaddress.ip_address(ip_str)
            if str(ip) == "169.254.169.254":
                return True
            return (
                ip.is_private or
                ip.is_loopback or
                ip.is_link_local or
                ip.is_multicast or
                ip.is_reserved or
                ip.is_unspecified
            )
        except ValueError:
            return False

    def resolves_to_private(self, hostname: str) -> bool:
        try:
            addrinfo = socket.getaddrinfo(hostname, None)
            for info in addrinfo:
                ip = str(info[4][0])
                if self.is_private_ip(ip):
                    return True
            return False
        except socket.gaierror:
            # If DNS fails to resolve, we block for safety
            return True

    def checkNavigation(self, url: str) -> bool:
        return self._check_url(url)

    def checkRequest(self, destination: str) -> bool:
        return self._check_url(destination)

    def checkAction(self, action: str) -> bool:
        # Default allow for actions, as no explicit action policies are defined yet
        return True

    def _host_matches(self, hostname: str) -> bool:
        if hostname in self.allowed_hosts:
            return True
        # Check wildcard subdomains
        for allowed in self.allowed_hosts:
            if allowed.startswith("*."):
                base_domain = allowed[2:]
                if hostname.endswith("." + base_domain):
                    return True
        return False

    def _prefix_matches(self, url: str) -> bool:
        if not self.allowed_url_prefixes:
            return False
        for prefix in self.allowed_url_prefixes:
            if url.startswith(prefix):
                return True
        return False

    def _check_url(self, url: str) -> bool:
        try:
            parsed = urlparse(url)
        except Exception:
            return False

        if parsed.scheme not in ("http", "https"):
            return False
        
        hostname = parsed.hostname
        if not hostname:
            return False

        port = parsed.port
        if port:
            if self.allowed_ports and port not in self.allowed_ports:
                return False
        else:
            default_port = 443 if parsed.scheme == "https" else 80
            if self.allowed_ports and default_port not in self.allowed_ports:
                return False

        if not self.allowed_hosts and not self.allowed_url_prefixes:
            if not url.startswith(self.target.base_url):
                return False
        else:
            host_allowed = self.allowed_hosts and self._host_matches(hostname)
            prefix_allowed = self.allowed_url_prefixes and self._prefix_matches(url)
            
            if not (host_allowed or prefix_allowed):
                return False

        if hostname.lower() in ("localhost", "local", "invalid"):
            return False
            
        if self.resolves_to_private(hostname):
            return False

        return True
