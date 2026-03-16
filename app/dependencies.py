from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_session
from app.repositories.question_repository import QuestionRepository
from app.repositories.sqlalchemy_question_repository import SqlAlchemyQuestionRepository
from app.services.quiz_service import QuizService


def get_question_repository(
    session: Annotated[Session, Depends(get_session)],
) -> QuestionRepository:
    return SqlAlchemyQuestionRepository(session)


def get_quiz_service(
    repository: Annotated[QuestionRepository, Depends(get_question_repository)],
) -> QuizService:
    return QuizService(repository)