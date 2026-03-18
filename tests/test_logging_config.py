import logging
from collections.abc import Generator

import pytest

from app.logging_config import RequestIdFilter, setup_logging


@pytest.fixture
def clean_root_logger() -> Generator[logging.Logger, None, None]:
    root_logger = logging.getLogger()
    original_handlers = list(root_logger.handlers)
    original_level = root_logger.level

    root_logger.handlers.clear()
    root_logger.setLevel(logging.NOTSET)

    try:
        yield root_logger
    finally:
        root_logger.handlers.clear()
        for handler in original_handlers:
            root_logger.addHandler(handler)
        root_logger.setLevel(original_level)


def _request_id_filters(handler: logging.Handler) -> list[RequestIdFilter]:
    return [filter_ for filter_ in handler.filters if isinstance(filter_, RequestIdFilter)]


def test_setup_logging_adds_request_id_filter_to_existing_handlers(clean_root_logger: logging.Logger):
    handler = logging.StreamHandler()
    clean_root_logger.addHandler(handler)

    setup_logging("INFO")

    assert _request_id_filters(handler)


def test_setup_logging_does_not_duplicate_request_id_filter(clean_root_logger: logging.Logger):
    handler = logging.StreamHandler()
    clean_root_logger.addHandler(handler)

    setup_logging("INFO")
    setup_logging("DEBUG")

    assert len(_request_id_filters(handler)) == 1
    assert clean_root_logger.level == logging.DEBUG
