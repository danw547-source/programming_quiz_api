from fastapi import FastAPI
from app.controllers.quiz_controller import router as quiz_router

# This is the main entry point of the application. It creates a FastAPI instance and includes the quiz router, which contains the endpoints for handling quiz-related requests. The FastAPI instance is configured with a title for the API documentation.

app = FastAPI(title="Programming Concepts Quiz API")

app.include_router(quiz_router)