from app.models.question import Question
from app.services.quiz_service import QuizService
from app.repositories.question_repository import QuestionRepository


# A simple in-memory repository used only for testing, so we don't need a real JSON file.
class InMemoryRepository(QuestionRepository):
    def __init__(self, questions: list[Question]):
        self._questions = questions
        self._by_id = {q.id: q for q in questions}

    def get_all(self, question_set: str | None = None) -> list[Question]:
        if question_set is None:
            return self._questions

        return [question for question in self._questions if question.question_set == question_set]

    def get_question_sets(self) -> list[str]:
        return sorted({question.question_set for question in self._questions})

    def get_by_id(self, question_id: int) -> Question | None:
        return self._by_id.get(question_id)


SAMPLE_QUESTION = Question(
    id=1,
    question_set="solid",
    prompt="Test question",
    options=["A", "B", "C", "D"],
    answer="A",
    explanation="A is correct because it is A.",
)

SECOND_QUESTION = Question(
    id=2,
    question_set="python",
    prompt="Another question",
    options=["A", "B", "C", "D"],
    answer="B",
    explanation="B is correct because it is B.",
)


def make_service(questions: list[Question] | None = None):
    return QuizService(InMemoryRepository(questions or [SAMPLE_QUESTION]))


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
    assert q["question_set"] == "solid"
    assert q["prompt"] == "Test question"
    assert q["options"] == ["A", "B", "C", "D"]


def test_get_questions_can_filter_by_question_set():
    service = make_service([SAMPLE_QUESTION, SECOND_QUESTION])

    questions = service.get_questions(question_set="PyThOn")

    assert len(questions) == 1
    assert questions[0]["id"] == 2


def test_get_question_sets_returns_sorted_unique_values():
    service = make_service([SAMPLE_QUESTION, SECOND_QUESTION, SAMPLE_QUESTION])

    assert service.get_question_sets() == ["python", "solid"]


def test_get_cheat_sheet_returns_all_entries_for_set():
    service = make_service([SAMPLE_QUESTION, SECOND_QUESTION])

    cheat_sheet = service.get_cheat_sheet("  SoLiD ")

    assert cheat_sheet["question_set"] == "solid"
    assert cheat_sheet["total_questions"] == 1
    assert len(cheat_sheet["entries"]) == 1
    assert cheat_sheet["entries"][0]["id"] == 1
    assert cheat_sheet["entries"][0]["answer"] == "A"
    assert cheat_sheet["entries"][0]["explanation"] == "A is correct because it is A."


def test_get_cheat_sheet_returns_none_for_unknown_set():
    service = make_service([SAMPLE_QUESTION])

    assert service.get_cheat_sheet("missing-set") is None


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


def test_check_answer_ai_mode_matches_fuzzy_text():
    ai_question = Question(
        id=99,
        question_set="aiquiz",
        prompt="What programming principle means each module has one responsibility?",
        options=[],
        answer="Single responsibility principle",
        explanation="SRP encourages one reason to change.",
    )
    service = QuizService(InMemoryRepository([ai_question]))

    result = service.check_answer(99, "single responsibility principle")
    assert result["correct"] is True

    result2 = service.check_answer(99, "Single Responsibility")
    assert result2["correct"] is True

    result3 = service.check_answer(99, "not related")
    assert result3["correct"] is False
