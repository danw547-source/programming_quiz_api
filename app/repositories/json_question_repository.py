import json

from app.models.question import Question
from app.repositories.question_repository import QuestionRepository


class JsonQuestionRepository(QuestionRepository):
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.questions = self.load_questions()
        self._questions_by_id = {q.id: q for q in self.questions}

    def load_questions(self) -> list[Question]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as file:
                data = json.load(file)
        except FileNotFoundError:
            raise RuntimeError(f"Questions file not found: {self.file_path}")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Invalid JSON in questions file: {e}")

        return [self._deserialize_question(question_data) for question_data in data]

    def get_all(self, question_set: str | None = None) -> list[Question]:
        if question_set is None:
            return self.questions

        return [question for question in self.questions if question.question_set == question_set]

    def get_by_id(self, question_id: int) -> Question | None:
        return self._questions_by_id.get(question_id)

    def get_question_sets(self) -> list[str]:
        return sorted({question.question_set for question in self.questions})

    @staticmethod
    def _deserialize_question(question_data: dict) -> Question:
        return Question(
            id=question_data["id"],
            question_set=question_data["question_set"],
            prompt=question_data["prompt"],
            options=question_data["options"],
            answer=question_data["answer"],
            explanation=question_data["explanation"],
        )