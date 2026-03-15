from pydantic import BaseModel

# This file defines the data shape that the API expects when the user submits an answer.
# Pydantic automatically validates that the request body contains an "answer" field as a string.
class AnswerSubmission(BaseModel):
    answer: str
