"""
Structured logging configuration.

Attaches a `request_id` field to every log record by injecting a
`RequestIdFilter` onto the stream handler.  The ID comes from the
per-request ContextVar set by the middleware, so it flows through to every
logger in the call stack with no extra plumbing.
"""
import logging

from app.request_context import request_id_var


class RequestIdFilter(logging.Filter):
    """Inject the current request_id into every log record it processes."""

    def filter(self, record: logging.LogRecord) -> bool:
        # Fall back to "-" when called outside a request context (e.g., startup).
        record.request_id = request_id_var.get("-")
        return True


def _has_request_id_filter(handler: logging.Handler) -> bool:
    return any(isinstance(filter_, RequestIdFilter) for filter_ in handler.filters)


def _ensure_request_id_filter_on_handlers(root_logger: logging.Logger) -> None:
    for handler in root_logger.handlers:
        if not _has_request_id_filter(handler):
            handler.addFilter(RequestIdFilter())


def setup_logging(level: str = "INFO") -> None:
    # Guard against double-initialisation: test runners (and Uvicorn) configure
    # the root logger before the app starts, so we only adjust the level rather
    # than adding a second handler.
    root_logger = logging.getLogger()

    if root_logger.handlers:
        _ensure_request_id_filter_on_handlers(root_logger)
        root_logger.setLevel(level.upper())
        return

    handler = logging.StreamHandler()
    handler.addFilter(RequestIdFilter())
    handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s request_id=%(request_id)s %(message)s"
        )
    )

    root_logger.addHandler(handler)
    root_logger.setLevel(level.upper())
