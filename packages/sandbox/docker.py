import asyncio
import logging
from typing import Any, Dict

import docker
import docker.errors

from .provider import SandboxProvider

logger = logging.getLogger(__name__)

class DockerSandboxProvider(SandboxProvider):
    def __init__(self) -> None:
        self.client: docker.DockerClient | None = None
        try:
            self.client = docker.from_env()
        except Exception as e:
            logger.warning(f"Failed to initialize Docker client: {e}")

    async def provision_sandbox(self, sandbox_id: str, config: Dict[str, Any]) -> str:
        if not self.client:
            raise RuntimeError("Docker client not initialized")
        client = self.client
        
        # Hardened configuration
        # seccomp is default enabled in docker
        # no-new-privileges prevents privilege escalation
        security_opt = ["no-new-privileges:true"]
        
        # Drop all capabilities
        cap_drop = ["ALL"]
        
        image = config.get("image", "mcr.microsoft.com/playwright/python:v1.44.0-jammy")
        
        def _run() -> str:
            # We use an empty entrypoint and just sleep so the container stays alive
            # while we exec commands into it.
            container = client.containers.run(
                image,
                command="sleep 3600",
                detach=True,
                name=f"sandbox-{sandbox_id}",
                security_opt=security_opt,
                cap_drop=cap_drop,
                network_mode="bridge",
                read_only=True,
                tmpfs={"/tmp": "rw,noexec,nosuid,size=512m", "/var/tmp": "rw,noexec,nosuid"},
                mem_limit="1g",
                memswap_limit="1g",
                nano_cpus=1000000000, # 1 CPU
                auto_remove=True, # Automatically clean up container on exit
            )
            return str(container.id)
            
        container_id = await asyncio.to_thread(_run)
        logger.info(f"DockerSandboxProvider: Provisioned container {container_id} for sandbox {sandbox_id}")
        return container_id

    async def execute_command(self, provider_sandbox_id: str, command: list[str], timeout: int = 60) -> tuple[int, str, str]:
        if not self.client:
            raise RuntimeError("Docker client not initialized")
        client = self.client
            
        def _exec() -> tuple[int, str, str]:
            container = client.containers.get(provider_sandbox_id)
            # Default playwright image runs as root, but we should run as a less privileged user if possible.
            # The Microsoft image has a 'pwuser' but for now we'll rely on Docker's isolation.
            exit_code, output = container.exec_run(
                cmd=command,
                user="pwuser",
            )
            if isinstance(output, bytes):
                out_str = output.decode("utf-8", errors="replace")
            else:
                out_str = b"".join(output).decode("utf-8", errors="replace")
            return exit_code or 0, out_str, ""
            
        logger.info(f"DockerSandboxProvider: Executing command in {provider_sandbox_id}: {command}")
        # Note: asyncio.wait_for around to_thread won't kill the underlying thread/process properly,
        # but for this basic implementation we will rely on standard execution.
        try:
            return await asyncio.wait_for(asyncio.to_thread(_exec), timeout=timeout)
        except asyncio.TimeoutError:
            logger.error(f"Command timed out after {timeout} seconds")
            return -1, "", "Timeout"

    async def destroy_sandbox(self, provider_sandbox_id: str) -> None:
        if not self.client:
            return
        client = self.client
            
        def _stop() -> None:
            try:
                container = client.containers.get(provider_sandbox_id)
                # Stopping it will trigger auto_remove
                container.stop(timeout=2)
            except docker.errors.NotFound:
                pass
            except Exception as e:
                logger.error(f"Error stopping container {provider_sandbox_id}: {e}")
                
        logger.info(f"DockerSandboxProvider: Destroying container {provider_sandbox_id}")
        await asyncio.to_thread(_stop)
