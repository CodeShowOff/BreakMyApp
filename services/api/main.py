import logging
import typing
from contextlib import asynccontextmanager

from fastapi import FastAPI

from services.api.api.middleware import RequestIDMiddleware
from services.api.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> typing.AsyncGenerator[None, None]:
    logger.info("Starting up BreakMyApp API...")
    yield
    logger.info("Shutting down BreakMyApp API...")

app = FastAPI(title="BreakMyApp API", version="0.1.0", lifespan=lifespan)

# Add Middlewares
app.add_middleware(RequestIDMiddleware)

# Include Routers
app.include_router(api_router, prefix="/api/v1")

from typing import cast

from fastapi import Request
from fastapi.responses import JSONResponse

from services.api.api.deps import IdempotentResponseExists


@app.exception_handler(IdempotentResponseExists)
async def idempotency_handler(request: Request, exc: IdempotentResponseExists) -> JSONResponse:
    return JSONResponse(status_code=cast(int, exc.key.status_code), content=exc.key.response_body)

@app.get("/health")
async def health_check() -> typing.Any:
    return {"status": "ok"}

@app.get("/ready")
async def readiness_check() -> typing.Any:
    return {"status": "ready"}

