"""Repository implementation for AIQuiz questions loaded from markdown."""
import pathlib
import re
from typing import List

from app.models.question import Question
from app.repositories.question_repository import QuestionRepository


AI_QUESTION_SET_NAME = "aiquiz"


def _parse_ai_questions(file_path: str) -> List[Question]:
    text = pathlib.Path(file_path).read_text(encoding="utf-8")

    # Support a simple markdown style where each question is separated by a
    # leading "- prompt:" marker.  This keeps the parser easy and predictable.
    entries = re.split(r"\n(?=-\s*prompt:)", text.strip())
    questions = []
    next_id = 1

    for entry in entries:
        stripped = entry.strip()
        if not stripped or not stripped.startswith("-"):
            continue

        prompt_match = re.search(r"-\s*prompt:\s*(.+)", stripped, flags=re.IGNORECASE)
        answer_match = re.search(r"answer:\s*(.+)", stripped, flags=re.IGNORECASE)
        explanation_match = re.search(r"explanation:\s*(.+)", stripped, flags=re.IGNORECASE)

        if not prompt_match or not answer_match or not explanation_match:
            raise RuntimeError(
                f"Invalid AIQuiz question format in AIQUESTIONS.md entry: {stripped[:120]}"
            )

        prompt = prompt_match.group(1).strip()
        answer = answer_match.group(1).strip()
        explanation = explanation_match.group(1).strip()

        questions.append(
            Question(
                id=next_id,
                question_set=AI_QUESTION_SET_NAME,
                prompt=prompt,
                options=[],
                answer=answer,
                explanation=explanation,
            )
        )
        next_id += 1

    return questions


class AIQuestionRepository(QuestionRepository):
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.questions = _parse_ai_questions(file_path)
        self._questions_by_id = {q.id: q for q in self.questions}

    def get_all(self, question_set: str | None = None) -> list[Question]:
        if question_set is None or question_set.strip().casefold() == AI_QUESTION_SET_NAME:
            return self.questions
        return []

    def get_by_id(self, question_id: int) -> Question | None:
        return self._questions_by_id.get(question_id)

    def get_question_sets(self) -> list[str]:
        return [AI_QUESTION_SET_NAME]
