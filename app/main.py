from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.quiz_controller import router as quiz_router

# This is the main entry point of the application. It creates a FastAPI instance and includes the quiz router, which contains the endpoints for handling quiz-related requests. The FastAPI instance is configured with a title for the API documentation.

app = FastAPI(title="Programming Concepts Quiz API")

# Allow requests from local frontend during development and from the deployed site in production.
app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"https://beatthebacklog.net",
		"https://www.beatthebacklog.net",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Register quiz routes so FastAPI exposes /questions and /answer/{question_id}.
app.include_router(quiz_router)