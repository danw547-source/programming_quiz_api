import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent


@dataclass(frozen=True, slots=True)
class Settings:
    database_url: str
    question_seed_file: str


@lru_cache
def get_settings() -> Settings:
    default_database_url = f"sqlite:///{(PROJECT_ROOT / 'quiz.db').as_posix()}"
    default_seed_file = str((PROJECT_ROOT / "app" / "data" / "questions.json").resolve())

    return Settings(
        database_url=os.getenv("DATABASE_URL", default_database_url),
        question_seed_file=os.getenv("QUESTION_SEED_FILE", default_seed_file),
    )