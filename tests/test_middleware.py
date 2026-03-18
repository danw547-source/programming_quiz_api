"""
Unit tests for RequestObservabilityAndRateLimitMiddleware.

Each test builds a minimal FastAPI app with only the middleware under test
attached, keeping the tests fast and independent of the full application
wiring.  The rate limit is set to a small number so tests don't need to
fire hundreds of requests to verify the 429 behaviour.
"""
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware import RequestObservabilityAndRateLimitMiddleware


def _create_app(rate_limit: int = 2) -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        RequestObservabilityAndRateLimitMiddleware,
        requests_per_window=rate_limit,
        window_seconds=60,
    )

    @app.get("/ping")
    def ping():
        return {"ok": True}

    return app


def test_request_id_header_is_returned_and_echoed():
    app = _create_app()

    with TestClient(app) as client:
        response = client.get("/ping", headers={"X-Request-ID": "test-request-id"})

    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "test-request-id"


def test_rate_limit_returns_429_after_limit_is_exceeded():
    app = _create_app(rate_limit=2)

    with TestClient(app) as client:
        first = client.get("/ping")
        second = client.get("/ping")
        third = client.get("/ping")

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
    assert third.json()["detail"] == "Rate limit exceeded. Please try again shortly."
    assert third.headers["X-RateLimit-Remaining"] == "0"
    assert 1 <= int(third.headers["Retry-After"]) <= 60


def test_rate_limit_retry_after_reflects_remaining_window_time():
    middleware = RequestObservabilityAndRateLimitMiddleware(
        app=lambda scope, receive, send: None,
        requests_per_window=2,
        window_seconds=60,
    )

    first = middleware._check_rate_limit("client", 0.0)
    second = middleware._check_rate_limit("client", 1.0)
    third = middleware._check_rate_limit("client", 2.0)

    assert first == (False, 1, 60)
    assert second == (False, 0, 60)
    assert third == (True, 0, 58)


def test_rate_limiter_prunes_stale_buckets_for_inactive_clients():
    middleware = RequestObservabilityAndRateLimitMiddleware(
        app=lambda scope, receive, send: None,
        requests_per_window=2,
        window_seconds=60,
    )

    middleware._check_rate_limit("inactive-client", 0.0)
    middleware._check_rate_limit("active-client", 61.0)

    assert "inactive-client" not in middleware._buckets
    assert "active-client" in middleware._buckets
