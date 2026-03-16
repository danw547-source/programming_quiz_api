"""
JSON-file-backed question repository used during development and testing.

Seed data flows through a two-phase validation pipeline:
  1. `SeedQuestionPayload` (Pydantic) — validates structure, field types, and
      cross-field invariants (answer must be in options) before any Python
      objects are created.
  2. `Question.__post_init__` — re-validates the domain invariants so the
      domain model can never be constructed in an invalid state, regardless of
      how it was instantiated.

Any validation failure raises `RuntimeError` with the item index and error
detail so seed authors know exactly which record to fix.
"""
import json
from collections import Counter

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator

from app.models.question import Question
from app.repositories.question_repository import QuestionRepository


class SeedQuestionPayload(BaseModel):
    """
    Pydantic schema that validates one raw JSON record from the seed file.

    `extra="forbid"` turns unknown keys into validation errors, which catches
    typos in field names before they silently drop data.
    """

    model_config = ConfigDict(extra="forbid")

    id: int = Field(gt=0)
    question_set: str = Field(min_length=1, max_length=50)
    prompt: str = Field(min_length=1)
    options: list[str] = Field(min_length=2)
    answer: str = Field(min_length=1)
    explanation: str = Field(min_length=1)

    @field_validator("question_set", "prompt", "answer", "explanation")
    @classmethod
    def _strip_non_empty_text(cls, value: str) -> str:
        # Strip leading/trailing whitespace and reject strings that are blank
        # after stripping, since a field like "   " would pass a min_length=1 check.
        stripped = value.strip()
        if not stripped:
            raise ValueError("Value cannot be blank")

        return stripped

    @field_validator("options")
    @classmethod
    def _validate_options(cls, options: list[str]) -> list[str]:
        # Normalise and validate the option list: no blanks, no duplicates
        # (case-insensitive so "A" and "a" are treated as the same option).
        normalized_options = [option.strip() for option in options]
        if any(not option for option in normalized_options):
            raise ValueError("Options cannot be blank")

        if len({option.casefold() for option in normalized_options}) != len(normalized_options):
            raise ValueError("Options must be unique")

        return normalized_options

    @model_validator(mode="after")
    def _validate_answer_in_options(self):
        # Cross-field check: the declared answer must actually appear in the
        # options list.  Field validators run first, so by this point both
        # `answer` and `options` are already stripped and de-duplicated.
        normalized_options = {option.casefold() for option in self.options}
        if self.answer.casefold() not in normalized_options:
            raise ValueError("Answer must match one of the options")

        return self


class JsonQuestionRepository(QuestionRepository):
    """Loads questions from a JSON file and serves them from memory."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.questions = self.load_questions()
        # Pre-build an ID lookup dict to make get_by_id O(1) regardless of
        # the number of questions in the file.
        self._questions_by_id = {q.id: q for q in self.questions}

    def load_questions(self) -> list[Question]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as file:
                data = json.load(file)
        except FileNotFoundError:
            raise RuntimeError(f"Questions file not found: {self.file_path}")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Invalid JSON in questions file: {e}")

        if not isinstance(data, list):
            raise RuntimeError("Questions file must contain a JSON array")

        questions = [
            self._deserialize_question(question_data, index)
            for index, question_data in enumerate(data, start=1)
        ]
        self._ensure_unique_question_ids(questions)
        return questions

    def get_all(self, question_set: str | None = None) -> list[Question]:
        if question_set is None:
            return self.questions

        return [question for question in self.questions if question.question_set == question_set]

    def get_by_id(self, question_id: int) -> Question | None:
        return self._questions_by_id.get(question_id)

    def get_question_sets(self) -> list[str]:
        # Sort so the API returns sets in a deterministic, alphabetical order.
        return sorted({question.question_set for question in self.questions})

    @staticmethod
    def _ensure_unique_question_ids(questions: list[Question]) -> None:
        # Check for duplicate IDs after all records are deserialized.
        # Done as a separate pass instead of a per-record check so the error
        # message can list *all* duplicate IDs at once rather than one at a time.
        id_counts = Counter(question.id for question in questions)
        duplicate_ids = sorted(question_id for question_id, count in id_counts.items() if count > 1)
        if duplicate_ids:
            raise RuntimeError(f"Duplicate question ids found: {duplicate_ids}")

    @staticmethod
    def _deserialize_question(question_data: dict, index: int) -> Question:
        if not isinstance(question_data, dict):
            raise RuntimeError(f"Invalid question payload at index {index}: expected an object")

        try:
            payload = SeedQuestionPayload.model_validate(question_data)
            return Question(
                id=payload.id,
                question_set=payload.question_set,
                prompt=payload.prompt,
                options=payload.options,
                answer=payload.answer,
                explanation=payload.explanation,
            )
        except (ValidationError, ValueError) as exc:
            raise RuntimeError(f"Invalid question payload at index {index}: {exc}") from exc