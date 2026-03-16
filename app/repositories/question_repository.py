from abc import ABC, abstractmethod

from app.models.question import Question


class QuestionRepository(ABC):
    @abstractmethod
    def get_all(self, question_set: str | None = None) -> list[Question]: ...

    @abstractmethod
    def get_by_id(self, question_id: int) -> Question | None: ...

    @abstractmethod
    def get_question_sets(self) -> list[str]: ...