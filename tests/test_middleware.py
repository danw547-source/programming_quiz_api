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
