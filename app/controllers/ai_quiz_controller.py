"""HTTP routing layer for AIQuiz endpoints (free-text answer mode)."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response

from app.dependencies import get_ai_quiz_service
from app.schemas.answer import AnswerResult, AnswerSubmission
from app.schemas.question import QuestionSummary

QuizServiceDependency = Annotated[object, Depends(get_ai_quiz_service)]

router = APIRouter(prefix="/ai")


@router.get("/question-sets", response_model=list[str])
def get_question_sets(service: QuizServiceDependency, response: Response):
    response.headers["Cache-Control"] = "public, max-age=86400"
    return service.get_question_sets()


@router.get("/questions", response_model=list[QuestionSummary])
def get_questions(service: QuizServiceDependency, response: Response):
    response.headers["Cache-Control"] = "public, max-age=86400"
    return service.get_questions(question_set="aiquiz")


@router.post("/answer/{question_id}", response_model=AnswerResult)
def submit_answer(question_id: int, submission: AnswerSubmission, service: QuizServiceDependency):
    result = service.check_answer(question_id, submission.answer)
    if result is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return result


@router.get("/cheat-sheet", response_model=dict)
def get_cheat_sheet(service: QuizServiceDependency, response: Response):
    response.headers["Cache-Control"] = "public, max-age=86400"
    cheat_sheet = service.get_cheat_sheet(question_set="aiquiz")
    if cheat_sheet is None:
        raise HTTPException(status_code=404, detail="Question set not found")
    return cheat_sheet
