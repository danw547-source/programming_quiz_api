from app.models.question import Question
from app.services.quiz_service import QuizService
from app.repositories.question_repository import QuestionRepository
from typing import List


# A simple in-memory repository used only for testing, so we don't need a real JSON file.
class InMemoryRepository(QuestionRepository):
    def __init__(self, questions: List[Question]):
        self._questions = questions
        self._by_id = {q.id: q for q in questions}

    def get_all(self) -> List[Question]:
        return self._questions

    def get_by_id(self, question_id: int) -> Question | None:
        return self._by_id.get(question_id)


SAMPLE_QUESTION = Question(
    id=1,
    prompt="Test question",
    options=["A", "B", "C", "D"],
    answer="A",
    explanation="A is correct because it is A.",
)


def make_service():
    return QuizService(InMemoryRepository([SAMPLE_QUESTION]))


# --- get_questions ---

def test_get_questions_returns_questions_without_answer():
    service = make_service()
    questions = service.get_questions()
    assert len(questions) == 1
    # The answer field must not be exposed to the frontend
    assert "answer" not in questions[0]


def test_get_questions_returns_expected_fields():
    service = make_service()
    q = service.get_questions()[0]
    assert q["id"] == 1
    assert q["prompt"] == "Test question"
    assert q["options"] == ["A", "B", "C", "D"]


# --- check_answer ---

def test_check_answer_correct():
    service = make_service()
    result = service.check_answer(1, "A")
    assert result["correct"] is True
    assert result["correct_answer"] == "A"


def test_check_answer_wrong():
    service = make_service()
    result = service.check_answer(1, "B")
    assert result["correct"] is False
    assert result["correct_answer"] == "A"


def test_check_answer_returns_real_explanation_when_correct():
    result = make_service().check_answer(1, "A")
    # Should return the actual explanation, not a hardcoded "Correct!" string
    assert result["explanation"] == "A is correct because it is A."


def test_check_answer_returns_real_explanation_when_wrong():
    result = make_service().check_answer(1, "B")
    assert result["explanation"] == "A is correct because it is A."


def test_check_answer_returns_none_for_unknown_question():
    result = make_service().check_answer(999, "A")
    assert result is None
