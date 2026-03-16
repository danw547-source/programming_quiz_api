from pydantic import BaseModel, ConfigDict, Field


class AnswerSubmission(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answer: str = Field(min_length=1)


class AnswerResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    correct: bool
    correct_answer: str
    explanation: str
