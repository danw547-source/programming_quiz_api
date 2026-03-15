from fastapi import APIRouter, HTTPException, Depends 
from app.services.quiz_service import QuizService
from app.dependencies import get_quiz_service

# This controller handles quiz-related endpoints, such as fetching quiz questions and submitting answers. It uses the QuizService to perform business logic related to quizzes.

router= APIRouter() # Create an APIRouter instance for quiz-related endpoints

@router.get("/questions") # Endpoint to get quiz questions
def get_questions(service: QuizService = Depends(get_quiz_service)):
    return service.get_questions()

@router.post("/answer/{question_id}") # Endpoint to submit an answer for a specific question
def submit_answer(
    question_id: int,
    answer: str,
    service: QuizService = Depends(get_quiz_service) # Inject the QuizService dependency using FastAPI's Depends function
):
    
    result = service.check_answer(question_id, answer) # Check the submitted answer using the QuizService
    
    if result is None:
        raise HTTPException(status_code=404, detail="Question not found") # If the question is not found, raise a 404 HTTP exception
    
    return result # Return the result of checking the answer (e.g., whether it's correct or not)