"""
Business logic for the quiz.

`QuizService` is the only layer that orchestrates cross-cutting logic
(normalisation, response shaping, missing-entity handling).  It depends on
the `QuestionRepository` interface, not any concrete implementation, so it
is trivially testable with an in-memory stub.
"""
from functools import lru_cache

from app.repositories.question_repository import QuestionRepository
from app.services.ai_answer_evaluator import is_answer_correct


def _normalize_question_set(question_set: str | None) -> str | None:
    """Strip and casefold a question set name; return None if the result is empty.

    Keeping normalisation in a standalone function (rather than a method) makes
    it easy to test in isolation and to reuse across service methods.
    """
    if question_set is None:
        return None

    normalized_question_set = question_set.strip().casefold()
    return normalized_question_set or None


class QuizService:
    def __init__(self, repository: QuestionRepository):
        self.repository = repository
        # Cache is stored on the instance so it's automatically cleared
        # if the service is recreated (e.g., when the app restarts or tests run).
        self._get_question_sets_cache = None
        self._get_all_cache = {}  # key: (normalized_question_set or None) -> value: [Questions]

    def get_questions(self, question_set: str | None = None):
        # The answer and explanation fields are intentionally excluded from this
        # response.  Exposing them would let clients trivially read the correct
        # answer before attempting the question (bypassing the submit flow).
        normalized_set = _normalize_question_set(question_set)
        
        # Check cache first
        cache_key = normalized_set
        if cache_key in self._get_all_cache:
            questions = self._get_all_cache[cache_key]
        else:
            # Query database and cache result
            questions = self.repository.get_all(normalized_set)
            self._get_all_cache[cache_key] = questions

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
        # Cache the result since question sets rarely change at runtime.
        if self._get_question_sets_cache is None:
            self._get_question_sets_cache = self.repository.get_question_sets()
        return self._get_question_sets_cache

    def get_cheat_sheet(self, question_set: str):
        normalized_question_set = _normalize_question_set(question_set)
        if normalized_question_set is None:
            return None

        # Return None (→ 404 at the controller layer) when no questions are
        # found, rather than returning an empty cheat sheet, to distinguish
        # "valid set with no questions" from "set name not recognised".
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

    def check_answer(self, question_id: int, answer: str, ai_mode: bool = False):
        question = self.repository.get_by_id(question_id)

        # None here means the ID does not exist; the controller converts this to
        # a 404 rather than a 500 so the client gets a useful error message.
        if not question:
            return None

        if ai_mode:
            correct = (
                is_answer_correct(question.answer, answer)
                or is_answer_correct(question.explanation, answer)
            )
        else:
            correct = question.check_answer(answer)

        return {
            "correct": correct,
            "correct_answer": question.answer,
            "explanation": question.explanation,
        }