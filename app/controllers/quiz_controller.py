from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.services.quiz_service import QuizService
from app.dependencies import get_quiz_service
from app.schemas.answer import AnswerResult, AnswerSubmission
from app.schemas.cheat_sheet import QuestionSetCheatSheet
from app.schemas.question import QuestionSummary


QuizServiceDependency = Annotated[QuizService, Depends(get_quiz_service)]

router = APIRouter()


@router.get("/question-sets", response_model=list[str])
def get_question_sets(service: QuizServiceDependency):
    return service.get_question_sets()


@router.get("/questions", response_model=list[QuestionSummary])
def get_questions(
    service: QuizServiceDependency,
    question_set: Annotated[str | None, Query(min_length=1, max_length=50)] = None,
):
    return service.get_questions(question_set=question_set)


@router.get("/cheat-sheet", response_model=QuestionSetCheatSheet)
def get_cheat_sheet(
    service: QuizServiceDependency,
    question_set: Annotated[str, Query(min_length=1, max_length=50)],
):
    cheat_sheet = service.get_cheat_sheet(question_set=question_set)
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