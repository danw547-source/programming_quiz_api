"""
FastAPI dependency providers.

Each function here is a factory that FastAPI calls once per request.
Returning a fresh `QuizService` (and therefore a fresh `Session`) per request
keeps database transactions short-lived and prevents session state from
bleeding between requests.

Tests override `get_quiz_service` via `app.dependency_overrides` to inject an
in-memory repository, avoiding any real database access during the test run.
"""
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_session
from app.repositories.ai_question_repository import AIQuestionRepository
from app.repositories.question_repository import QuestionRepository
from app.repositories.sqlalchemy_question_repository import SqlAlchemyQuestionRepository
from app.services.quiz_service import QuizService


def get_question_repository(
    session: Annotated[Session, Depends(get_session)],
) -> QuestionRepository:
    # `get_session` is a generator that yields a Session and closes it after
    # the request completes, so each request gets its own isolated session.
    return SqlAlchemyQuestionRepository(session)


def get_quiz_service(
    repository: Annotated[QuestionRepository, Depends(get_question_repository)],
) -> QuizService:
    return QuizService(repository)


def get_ai_question_repository() -> QuestionRepository:
    # AIQUESTIONS.md is in repository root; services run with project root as cwd.
    return AIQuestionRepository("AIQUESTIONS.md")


def get_ai_quiz_service(
    repository: Annotated[QuestionRepository, Depends(get_ai_question_repository)],
) -> QuizService:
    return QuizService(repository)