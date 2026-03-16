from app.repositories.question_repository import QuestionRepository


def _normalize_question_set(question_set: str | None) -> str | None:
    if question_set is None:
        return None

    normalized_question_set = question_set.strip().casefold()
    return normalized_question_set or None


class QuizService:
    def __init__(self, repository: QuestionRepository):
        self.repository = repository

    def get_questions(self, question_set: str | None = None):
        questions = self.repository.get_all(_normalize_question_set(question_set))

        return [
            {
                "id": q.id,
                "question_set": q.question_set,
                "prompt": q.prompt,
                "options": q.options,
            }
            for q in questions
        ]

    def get_question_sets(self) -> list[str]:
        return self.repository.get_question_sets()

    def get_cheat_sheet(self, question_set: str):
        normalized_question_set = _normalize_question_set(question_set)
        if normalized_question_set is None:
            return None

        questions = self.repository.get_all(normalized_question_set)
        if not questions:
            return None

        entries = [
            {
                "id": question.id,
                "prompt": question.prompt,
                "answer": question.answer,
                "explanation": question.explanation,
            }
            for question in questions
        ]

        return {
            "question_set": normalized_question_set,
            "total_questions": len(entries),
            "entries": entries,
        }

    def check_answer(self, question_id: int, answer: str):
        question = self.repository.get_by_id(question_id)

        if not question:
            return None

        correct = question.check_answer(answer)

        return {
            "correct": correct,
            "correct_answer": question.answer,
            "explanation": question.explanation,
        }