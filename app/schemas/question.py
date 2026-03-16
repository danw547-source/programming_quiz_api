"""
Pydantic response schema for a question as seen by the frontend.

`QuestionSummary` deliberately omits the `answer` and `explanation` fields
that exist on the domain `Question` model.  This ensures the correct answer
is never leaked to clients before they submit.
"""
from pydantic import BaseModel, ConfigDict, Field


class QuestionSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int
    question_set: str = Field(min_length=1, max_length=50)
    prompt: str
    options: list[str]