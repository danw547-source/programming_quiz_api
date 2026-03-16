from __future__ import annotations

import logging
import time
import uuid
from collections import deque
from threading import Lock

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.request_context import request_id_var


logger = logging.getLogger("app.request")


class RequestObservabilityAndRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        requests_per_window: int = 120,
        window_seconds: int = 60,
    ):
        super().__init__(app)
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self._buckets: dict[str, deque[float]] = {}
        self._lock = Lock()

    def _check_rate_limit(self, client_key: str, current_time: float) -> tuple[bool, int, int]:
        with self._lock:
            bucket = self._buckets.setdefault(client_key, deque())

            while bucket and current_time - bucket[0] >= self.window_seconds:
                bucket.popleft()

            if len(bucket) >= self.requests_per_window:
                return True, 0, self.window_seconds

            bucket.append(current_time)
            remaining = self.requests_per_window - len(bucket)
            return False, remaining, self.window_seconds

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        request_id_token = request_id_var.set(request_id)

        start_time = time.perf_counter()
        client_key = request.client.host if request.client else "unknown"
        is_rate_limited, remaining_requests, retry_after = self._check_rate_limit(
            client_key, time.monotonic()
        )

        if is_rate_limited:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.warning(
                "request_rate_limited method=%s path=%s client=%s duration_ms=%s",
                request.method,
                request.url.path,
                client_key,
                duration_ms,
            )
            request_id_var.reset(request_id_token)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again shortly."},
                headers={
                    "X-Request-ID": request_id,
                    "X-RateLimit-Limit": str(self.requests_per_window),
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": str(retry_after),
                },
            )

        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
        finally:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.info(
                "request_completed method=%s path=%s status_code=%s client=%s duration_ms=%s",
                request.method,
                request.url.path,
                status_code,
                client_key,
                duration_ms,
            )
            request_id_var.reset(request_id_token)

        response.headers["X-Request-ID"] = request_id
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_window)
        response.headers["X-RateLimit-Remaining"] = str(remaining_requests)
        return response
