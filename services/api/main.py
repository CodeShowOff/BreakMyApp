from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup OpenTelemetry here in the future
    logger.info("Starting up BreakMyApp API...")
    yield
    logger.info("Shutting down BreakMyApp API...")

app = FastAPI(title="BreakMyApp API", version="0.1.0", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/ready")
async def readiness_check():
    # Check DB and Temporal connections here in the future
    return {"status": "ready"}
