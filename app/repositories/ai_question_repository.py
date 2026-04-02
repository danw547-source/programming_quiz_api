"""Repository implementation for AIQuiz questions loaded from markdown."""
import pathlib
import re
from typing import List

from app.models.question import Question
from app.repositories.question_repository import QuestionRepository


AI_QUESTION_SET_NAME = "aiquiz"


AI_QUESTION_FILE_PATHS = [
    "AIQUESTIONS.md",
    "AIQUESTIONS2.md",
]


def _parse_ai_questions(file_path: str, assign_set: str | None = None) -> List[Question]:
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
        question_set_match = re.search(r"question_set:\s*(.+)", stripped, flags=re.IGNORECASE)

        if not prompt_match or not answer_match or not explanation_match:
            raise RuntimeError(
                f"Invalid AIQuiz question format in {file_path} entry: {stripped[:120]}"
            )

        prompt = prompt_match.group(1).strip()
        answer = answer_match.group(1).strip()
        explanation = explanation_match.group(1).strip()
        
        # Use explicit question_set if provided in markdown, else use assign_set or default
        if question_set_match:
            question_set = question_set_match.group(1).strip().lower()
        elif assign_set:
            question_set = assign_set
        else:
            question_set = AI_QUESTION_SET_NAME

        questions.append(
            Question(
                id=next_id,
                question_set=question_set,
                prompt=prompt,
                options=[],
                answer=answer,
                explanation=explanation,
            )
        )
        next_id += 1

    return questions


class AIQuestionRepository(QuestionRepository):
    def __init__(self, file_path: str | None = None):
        questions: list[Question] = []
        next_id = 1

        # Map files to their question set names
        file_set_mapping = {
            "AIQUESTIONS.md": "gear4music",
            "AIQUESTIONS2.md": "g4m project workflow",
        }

        paths = [file_path] if file_path else AI_QUESTION_FILE_PATHS
        for path in paths:
            try:
                set_name = file_set_mapping.get(pathlib.Path(path).name, None)
                parsed = _parse_ai_questions(path, assign_set=set_name)
            except FileNotFoundError:
                continue
            for q in parsed:
                q.id = next_id
                questions.append(q)
                next_id += 1

        self.file_path = paths[0] if paths else ""
        self.questions = questions
        self._questions_by_id = {q.id: q for q in questions}

    def get_all(self, question_set: str | None = None) -> list[Question]:
        if question_set is None:
            return self.questions

        normalized_set = question_set.strip().casefold()
        return [q for q in self.questions if q.question_set.strip().casefold() == normalized_set]

    def get_by_id(self, question_id: int) -> Question | None:
        return self._questions_by_id.get(question_id)

    def get_question_sets(self) -> list[str]:
        return sorted({q.question_set for q in self.questions})
