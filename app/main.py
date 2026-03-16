"""
Application factory for the Programming Concepts Quiz API.

Module-level setup (settings, logging) runs once on import.
All per-request wiring lives in dependencies.py so that tests can swap
implementations without touching this file.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.controllers.quiz_controller import router as quiz_router
from app.database import initialize_database
from app.logging_config import setup_logging
from app.middleware import RequestObservabilityAndRateLimitMiddleware


settings = get_settings()
# Configure logging before the app starts so startup log lines are captured.
setup_logging(settings.log_level)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Run Alembic migrations and seed missing questions each time the app boots.
    # Both operations are idempotent, so restarting is always safe.
    initialize_database()
    yield


app = FastAPI(title="Programming Concepts Quiz API", lifespan=lifespan)

# Middleware is invoked in *reverse* registration order.
# Rate limiting + observability is registered first so it wraps everything,
# including CORS — every request is counted and logged before routing begins.
app.add_middleware(
    RequestObservabilityAndRateLimitMiddleware,
    requests_per_window=settings.rate_limit_requests_per_minute,
    window_seconds=60,
)

# CORS is registered second so its headers appear on every response,
# including 429 rate-limit rejections produced by the middleware above.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://beatthebacklog.net",
        "https://www.beatthebacklog.net",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
)

app.include_router(quiz_router)