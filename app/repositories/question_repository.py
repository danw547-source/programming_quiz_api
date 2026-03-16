"""
Abstract repository interface for question data access.

Defining an interface here lets the service layer stay independent of any
specific storage backend (SQLite, PostgreSQL, in-memory for tests, etc.).
Tests swap in a lightweight in-memory implementation via dependency injection
without touching any real I/O.
"""
from abc import ABC, abstractmethod

from app.models.question import Question


class QuestionRepository(ABC):
    """Contract that every question storage backend must satisfy."""

    @abstractmethod
    def get_all(self, question_set: str | None = None) -> list[Question]: ...

    @abstractmethod
    def get_by_id(self, question_id: int) -> Question | None: ...

    @abstractmethod
    def get_question_sets(self) -> list[str]: ...