from pydantic import BaseModel, ConfigDict, Field


class CheatSheetEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int
    prompt: str
    answer: str = Field(min_length=1)
    explanation: str = Field(min_length=1)


class QuestionSetCheatSheet(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question_set: str = Field(min_length=1, max_length=50)
    total_questions: int = Field(ge=0)
    entries: list[CheatSheetEntry]