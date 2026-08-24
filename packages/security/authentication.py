import os
from abc import ABC, abstractmethod

from clerk_backend_api import authenticate_request_async
from clerk_backend_api.security import AuthenticateRequestOptions
from fastapi import HTTPException, Request


class RequestishWrapper:
    def __init__(self, request: Request):
        self.url = str(request.url)
        self.method = request.method
        self.headers = dict(request.headers)

class AuthenticationProvider(ABC):
    @abstractmethod
    async def get_user_id(self, request: Request) -> str | None:
        pass

class ClerkAuthenticationProvider(AuthenticationProvider):
    async def get_user_id(self, request: Request) -> str | None:
        secret_key = os.environ.get("CLERK_SECRET_KEY")
        if not secret_key:
            # Fallback for local dev if keys aren't set yet
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return request.headers.get("X-Dummy-User-Id")
            return auth_header.replace("Bearer ", "").strip()
            
        req_wrapper = RequestishWrapper(request)
        options = AuthenticateRequestOptions(secret_key=secret_key)
        
        try:
            request_state = await authenticate_request_async(req_wrapper, options)
            if request_state.is_signed_in and request_state.payload:
                return request_state.payload.get("sub")
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Clerk authentication failed: {e}")
        return None

# Singleton for dependency injection
auth_provider = ClerkAuthenticationProvider()

async def get_current_user_id(request: Request) -> str:
    user_id = await auth_provider.get_user_id(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id
