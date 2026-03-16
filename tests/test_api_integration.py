from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_quiz_service
from app.main import app
from app.models.question import Question
from app.repositories.question_repository import QuestionRepository
from app.services.quiz_service import QuizService


class InMemoryRepository(QuestionRepository):
    def __init__(self, questions: list[Question]):
        self._questions = questions
        self._by_id = {question.id: question for question in questions}

    def get_all(self, question_set: str | None = None) -> list[Question]:
        if question_set is None:
            return self._questions

        return [question for question in self._questions if question.question_set == question_set]

    def get_by_id(self, question_id: int) -> Question | None:
        return self._by_id.get(question_id)

    def get_question_sets(self) -> list[str]:
        return sorted({question.question_set for question in self._questions})


@pytest.fixture
def sample_questions() -> list[Question]:
    return [
        Question(
            id=1,
            question_set="solid principles",
            prompt="What does SRP stand for?",
            options=["Single Responsibility Principle", "Simple Rendering Pattern"],
            answer="Single Responsibility Principle",
            explanation="SRP means one reason to change.",
        ),
        Question(
            id=2,
            question_set="python beginner",
            prompt="Which function prints to console?",
            options=["echo", "print"],
            answer="print",
            explanation="print() writes to standard output.",
        ),
    ]


@pytest.fixture
def client(sample_questions: list[Question]) -> Generator[TestClient, None, None]:
    def _build_service() -> QuizService:
        return QuizService(InMemoryRepository(sample_questions))

    app.dependency_overrides[get_quiz_service] = _build_service

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_get_question_sets_returns_sorted_unique_values(client: TestClient):
    response = client.get("/question-sets")

    assert response.status_code == 200
    assert response.json() == ["python beginner", "solid principles"]


def test_get_questions_can_filter_by_question_set(client: TestClient):
    response = client.get("/questions", params={"question_set": "SoLiD PrInCiPlEs"})

    assert response.status_code == 200
    body = response.json()

    assert len(body) == 1
    assert body[0]["id"] == 1
    assert body[0]["question_set"] == "solid principles"
    assert "answer" not in body[0]
    assert "explanation" not in body[0]


def test_get_cheat_sheet_returns_answers_for_set(client: TestClient):
    response = client.get("/cheat-sheet", params={"question_set": "python beginner"})

    assert response.status_code == 200
    body = response.json()

    assert body["question_set"] == "python beginner"
    assert body["total_questions"] == 1
    assert body["entries"][0]["id"] == 2
    assert body["entries"][0]["answer"] == "print"
    assert body["entries"][0]["explanation"] == "print() writes to standard output."


def test_get_cheat_sheet_returns_404_for_unknown_set(client: TestClient):
    response = client.get("/cheat-sheet", params={"question_set": "unknown"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Question set not found"


def test_submit_answer_returns_result(client: TestClient):
    response = client.post("/answer/1", json={"answer": "Single Responsibility Principle"})

    assert response.status_code == 200
    body = response.json()

    assert body["correct"] is True
    assert body["correct_answer"] == "Single Responsibility Principle"
    assert body["explanation"] == "SRP means one reason to change."


def test_submit_answer_returns_404_for_missing_question(client: TestClient):
    response = client.post("/answer/999", json={"answer": "anything"})

    assert response.status_code == 404
    assert response.json()["detail"] == "Question not found"
