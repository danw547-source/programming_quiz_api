"""
Application factory for the Programming Concepts Quiz API.

Module-level setup (settings, logging) runs once on import.
All per-request wiring lives in dependencies.py so that tests can swap
implementations without touching this file.
"""
from contextlib import asynccontextmanager
import logging
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.gzip import GZipMiddleware

from app.config import get_settings
from app.controllers.quiz_controller import router as quiz_router
from app.controllers.ai_quiz_controller import router as ai_quiz_router
from app.database import initialize_database
from app.logging_config import setup_logging
from app.middleware import RequestObservabilityAndRateLimitMiddleware


settings = get_settings()
logger = logging.getLogger(__name__)
# Configure logging before the app starts so startup log lines are captured.
setup_logging(settings.log_level)


@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    startup_started_at = perf_counter()
    app_instance.state.startup_ready = False
    app_instance.state.database_initialization = "pending"

    # Local SQLite environments default to startup initialization.
    # Production-style deployments can disable this to avoid cold-start delays.
    if settings.initialize_database_on_startup:
        logger.info("Starting startup database initialization")
        database_initialization_started_at = perf_counter()
        try:
            initialize_database()
        except Exception:
            initialization_duration = perf_counter() - database_initialization_started_at
            app_instance.state.database_initialization = "failed"
            logger.exception("Startup database initialization failed after %.3fs", initialization_duration)
            raise
        else:
            initialization_duration = perf_counter() - database_initialization_started_at
            app_instance.state.database_initialization = "completed"
            logger.info("Startup database initialization completed in %.3fs", initialization_duration)
    else:
        app_instance.state.database_initialization = "skipped"
        logger.info("Skipping startup database initialization (INITIALIZE_DATABASE_ON_STARTUP=false)")

    startup_duration = perf_counter() - startup_started_at
    app_instance.state.startup_ready = True
    logger.info(
        "Application startup completed in %.3fs (database_initialization=%s)",
        startup_duration,
        app_instance.state.database_initialization,
    )
    yield


app = FastAPI(title="Programming Concepts Quiz API", lifespan=lifespan)
app.state.startup_ready = False
app.state.database_initialization = "pending"

# Middleware is invoked in *reverse* registration order.
# GZIP compression is registered first (will be innermost) to compress all responses.
# This reduces ~700KB of JSON questions to ~100KB, a 7x improvement in network transfer time.
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Rate limiting + observability is registered second so it wraps everything
# except GZIP compression — every request is counted and logged before routing begins.
app.add_middleware(
    RequestObservabilityAndRateLimitMiddleware,
    requests_per_window=settings.rate_limit_requests_per_minute,
    window_seconds=60,
)

# CORS is registered third so its headers appear on every response,
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

@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


@app.get("/ready")
def ready(request: Request) -> dict[str, bool | str]:
    startup_ready = bool(getattr(request.app.state, "startup_ready", False))
    database_initialization = getattr(request.app.state, "database_initialization", "unknown")
    return {
        "status": "ready" if startup_ready else "starting",
        "ready": startup_ready,
        "database_initialization": str(database_initialization),
    }

app.include_router(quiz_router)
app.include_router(ai_quiz_router)