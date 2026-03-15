from app.repositories.json_question_repository import JsonQuestionRepository
from app.services.quiz_service import QuizService

# This file constructs dependencies.
# Controllers will request them instead of building them.

# The service is created once when the application starts, so the questions file
# is only read once rather than on every request.
_service = QuizService(JsonQuestionRepository("app/data/questions.json"))

# Dependency injection for the quiz service, which provides access to the quiz data and logic. This allows for better modularity and testability of the application.
def get_quiz_service():
    return _service