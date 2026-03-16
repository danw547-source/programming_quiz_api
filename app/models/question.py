"""
Core domain model for a quiz question.

`Question` is a plain value object — it owns no persistence concerns and
carries no framework dependencies.  Business logic (normalisation, answer
checking) lives here so it is exercised in isolation from database or HTTP
layers.
"""
from dataclasses import dataclass


@dataclass(slots=True)
class Question:
    """
    An immutable representation of a single quiz question.

    `question_set` is normalised to lowercase-stripped form on construction so
    that comparisons throughout the codebase never need to worry about casing.
    """

    id: int
    question_set: str
    prompt: str
    options: list[str]
    answer: str
    explanation: str

    def __post_init__(self) -> None:
        # Normalise question_set once at construction time so the rest of the
        # codebase can rely on a consistent, case-insensitive key.
        # `casefold` is stronger than `lower` for Unicode correctness (e.g. ß→ss).
        self.question_set = self.question_set.strip().casefold()
        self.options = list(self.options)
        # Validate here as a second safety net; SeedQuestionPayload already
        # checks this, but the domain model must not allow an invalid state
        # regardless of how it was constructed.
        if self.answer.strip().casefold() not in {opt.strip().casefold() for opt in self.options}:
            raise ValueError(
                f"Question {self.id}: answer {self.answer!r} is not among the options {self.options}"
            )

    def check_answer(self, user_answer: str) -> bool:
        # Strip whitespace and casefold so "  A  " matches "a" without special
        # handling on the frontend or in the controller.
        return user_answer.strip().casefold() == self.answer.casefold()