from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import QuestionRecord
from app.models.question import Question
from app.repositories.question_repository import QuestionRepository


class SqlAlchemyQuestionRepository(QuestionRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_all(self, question_set: str | None = None) -> list[Question]:
        statement = select(QuestionRecord).order_by(QuestionRecord.id)

        if question_set is not None:
            statement = statement.where(QuestionRecord.question_set == question_set)

        return [self._to_domain(record) for record in self.session.scalars(statement).all()]

    def get_by_id(self, question_id: int) -> Question | None:
        record = self.session.get(QuestionRecord, question_id)
        if record is None:
            return None

        return self._to_domain(record)

    def get_question_sets(self) -> list[str]:
        statement = select(QuestionRecord.question_set).distinct().order_by(QuestionRecord.question_set)
        return list(self.session.scalars(statement))

    @staticmethod
    def _to_domain(record: QuestionRecord) -> Question:
        return Question(
            id=record.id,
            question_set=record.question_set,
            prompt=record.prompt,
            options=record.options,
            answer=record.answer,
            explanation=record.explanation,
        )