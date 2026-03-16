from pydantic import BaseModel, ConfigDict, Field


class QuestionSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int
    question_set: str = Field(min_length=1, max_length=50)
    prompt: str
    options: list[str]