from app.repositories.json_question_repository import JsonQuestionRepository
from app.services.quiz_service import QuizService

# This file constructs dependencies.
# Controllers will request them instead of building them.

# Dependency injection for the quiz service, which provides access to the quiz data and logic. This allows for better modularity and testability of the application.
def get_quiz_service():
    repository = JsonQuestionRepository("app/data/questions.json")
    
    service = QuizService(repository)
    
    return service