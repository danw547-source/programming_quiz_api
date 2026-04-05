import pytest

from app.config import get_settings


def test_initialize_database_on_startup_defaults_true_for_sqlite(monkeypatch: pytest.MonkeyPatch):
    get_settings.cache_clear()
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("INITIALIZE_DATABASE_ON_STARTUP", raising=False)

    settings = get_settings()

    assert settings.initialize_database_on_startup is True


def test_initialize_database_on_startup_defaults_false_for_non_sqlite(monkeypatch: pytest.MonkeyPatch):
    get_settings.cache_clear()
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/quiz")
    monkeypatch.delenv("INITIALIZE_DATABASE_ON_STARTUP", raising=False)

    settings = get_settings()

    assert settings.initialize_database_on_startup is False


def test_initialize_database_on_startup_accepts_explicit_true(monkeypatch: pytest.MonkeyPatch):
    get_settings.cache_clear()
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/quiz")
    monkeypatch.setenv("INITIALIZE_DATABASE_ON_STARTUP", "true")

    settings = get_settings()

    assert settings.initialize_database_on_startup is True


def test_initialize_database_on_startup_rejects_invalid_value(monkeypatch: pytest.MonkeyPatch):
    get_settings.cache_clear()
    monkeypatch.setenv("INITIALIZE_DATABASE_ON_STARTUP", "maybe")

    with pytest.raises(ValueError, match="INITIALIZE_DATABASE_ON_STARTUP"):
        get_settings()
