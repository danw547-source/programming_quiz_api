"""
HTTP routing layer for the quiz API.

Controllers are thin: they validate HTTP-level inputs (via Query/Path
constraints), delegate all business logic to QuizService, and translate
service-layer None returns into appropriate HTTP error responses.  No
domain rules live here.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.services.quiz_service import QuizService
from app.dependencies import get_quiz_service
from app.schemas.answer import AnswerResult, AnswerSubmission
from app.schemas.cheat_sheet import QuestionSetCheatSheet
from app.schemas.question import QuestionSummary


# Type alias keeps endpoint signatures concise while still surfacing the full
# dependency chain (FastAPI resolves Depends(get_quiz_service) per request).
QuizServiceDependency = Annotated[QuizService, Depends(get_quiz_service)]

router = APIRouter()


@router.get("/question-sets", response_model=list[str])
def get_question_sets(service: QuizServiceDependency, response: Response):
    # Cache question sets for 24 hours (86400 seconds).
    # Sets are only updated when migrations run, so long caching is safe.
    response.headers["Cache-Control"] = "public, max-age=86400"
    return service.get_question_sets()


@router.get("/questions", response_model=list[QuestionSummary])
def get_questions(
    service: QuizServiceDependency,
    response: Response,
    question_set: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
):
    # Cache questions for 24 hours (86400 seconds).
    # Questions are only updated when migrations run, so long caching is safe.
    response.headers["Cache-Control"] = "public, max-age=86400"
    return service.get_questions(question_set=question_set)


@router.get("/cheat-sheet", response_model=QuestionSetCheatSheet)
def get_cheat_sheet(
    service: QuizServiceDependency,
    response: Response,
    question_set: Annotated[str, Query(min_length=1, max_length=50)],
):
    # Cache cheat sheets for 24 hours (86400 seconds).
    # Cheat sheets are only updated when migrations run, so long caching is safe.
    response.headers["Cache-Control"] = "public, max-age=86400"
    cheat_sheet = service.get_cheat_sheet(question_set=question_set)
    # The service returns None when the set name is not found; raise 404 here
    # rather than in the service so error semantics stay in the HTTP layer.
    if cheat_sheet is None:
        raise HTTPException(status_code=404, detail="Question set not found")

    return cheat_sheet


@router.post("/answer/{question_id}", response_model=AnswerResult)
def submit_answer(
    question_id: int,
    submission: AnswerSubmission,
    service: QuizServiceDependency,
):

    result = service.check_answer(question_id, submission.answer)

    if result is None:
        raise HTTPException(status_code=404, detail="Question not found")

    return result