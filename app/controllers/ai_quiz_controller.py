"""HTTP routing layer for AIQuiz endpoints (free-text answer mode)."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.dependencies import get_ai_quiz_service
from app.schemas.answer import AnswerResult, AnswerSubmission
from app.schemas.question import QuestionSummary
from app.schemas.hint import HintResult

QuizServiceDependency = Annotated[object, Depends(get_ai_quiz_service)]

router = APIRouter(prefix="/ai")


@router.get("/question-sets", response_model=list[str])
def get_question_sets(service: QuizServiceDependency, response: Response):
    response.headers["Cache-Control"] = "public, max-age=86400"
    return service.get_question_sets()


@router.get("/questions", response_model=list[QuestionSummary])
def get_questions(
    service: QuizServiceDependency,
    response: Response,
    question_set: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
):
    response.headers["Cache-Control"] = "public, max-age=86400"

    question_set = question_set.strip() if question_set else None
    questions = service.get_questions(question_set=question_set)

    # For AI mode, remove options to make questions free-text
    for q in questions:
        q["options"] = []

    # AI quiz gets a capped subset to keep rounds short and consistent.
    from random import shuffle

    selected = list(questions)
    shuffle(selected)
    return selected[:20]


@router.post("/answer/{question_id}", response_model=AnswerResult)
def submit_answer(question_id: int, submission: AnswerSubmission, service: QuizServiceDependency):
    result = service.check_answer(question_id, submission.answer, ai_mode=True)
    if result is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return result


@router.get("/cheat-sheet", response_model=dict)
def get_cheat_sheet(
    service: QuizServiceDependency,
    response: Response,
    question_set: Annotated[str, Query(min_length=1, max_length=50)],
):
    response.headers["Cache-Control"] = "public, max-age=86400"
    cheat_sheet = service.get_cheat_sheet(question_set=question_set)
    if cheat_sheet is None:
        raise HTTPException(status_code=404, detail="Question set not found")
    return cheat_sheet


@router.get("/hint/{question_id}", response_model=HintResult)
def get_hint(question_id: int, service: QuizServiceDependency):
    hint = service.get_hint(question_id)
    if hint is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return hint
