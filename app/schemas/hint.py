"""
Pydantic schema for hint responses in AI Quiz mode.
"""
from pydantic import BaseModel, ConfigDict, Field


class HintResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    partial_answer: str = Field(description="A partial answer to nudge the user in the right direction")
