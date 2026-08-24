import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class RedactionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # This middleware ensures no sensitive information leaks into access logs
        # Redacting specific headers, etc., in FastAPI standard loggings can be tricky directly in middleware,
        # but we can sanitize headers from the scope to ensure standard logging might miss them if it relies on scope,
        # though ASGI specifies headers as bytes. Real redaction for Python `logging` requires a Log Filter.
        # But for scope-based inspection or any manual logging we might do, we can mask known headers.
        
        SENSITIVE_HEADERS = [b"authorization", b"cookie", b"x-api-key"]
        if "headers" in request.scope:
            sanitized_headers = []
            for name, value in request.scope["headers"]:
                if name.lower() in SENSITIVE_HEADERS:
                    sanitized_headers.append((name, b"[REDACTED]"))
                else:
                    sanitized_headers.append((name, value))
            request.scope["headers"] = tuple(sanitized_headers)

        response = await call_next(request)
        return response

