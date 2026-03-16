"""
Centralized application settings.

All configuration is read from environment variables at startup.
`get_settings()` is cached so the environment is sampled exactly once per
process — hot-reloading env vars is not supported by design.
"""
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent


# `frozen=True` makes Settings immutable after construction, preventing
# accidental mutation of configuration values at runtime.
# `slots=True` keeps memory overhead minimal for a singleton object.
@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    question_seed_file: str
    log_level: str
    rate_limit_requests_per_minute: int


def _get_positive_int_env(var_name: str, default: int) -> int:
    """Read an environment variable as a positive integer, falling back to `default`."""
    raw_value = os.getenv(var_name)
    if raw_value is None:
        return default

    value = int(raw_value)
    if value <= 0:
        raise ValueError(f"{var_name} must be a positive integer")

    return value


# @lru_cache turns this into a lazily-initialised singleton: the first call
# reads the environment and builds Settings; every subsequent call returns the
# same cached object.  Call `get_settings.cache_clear()` in tests that need to
# inject different env values.
@lru_cache
def get_settings() -> Settings:
    default_database_url = f"sqlite:///{(PROJECT_ROOT / 'quiz.db').as_posix()}"
    default_seed_file = str((PROJECT_ROOT / "app" / "data" / "questions.json").resolve())

    return Settings(
        database_url=os.getenv("DATABASE_URL", default_database_url),
        question_seed_file=os.getenv("QUESTION_SEED_FILE", default_seed_file),
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        rate_limit_requests_per_minute=_get_positive_int_env("RATE_LIMIT_REQUESTS_PER_MINUTE", 120),
    )