from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.controllers.quiz_controller import router as quiz_router
from app.database import initialize_database
from app.logging_config import setup_logging
from app.middleware import RequestObservabilityAndRateLimitMiddleware


settings = get_settings()
setup_logging(settings.log_level)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="Programming Concepts Quiz API", lifespan=lifespan)

app.add_middleware(
    RequestObservabilityAndRateLimitMiddleware,
    requests_per_window=settings.rate_limit_requests_per_minute,
    window_seconds=60,
)

# Allow requests from local frontend during development and from the deployed site in production.
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