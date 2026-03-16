import json

import pytest

from app.repositories.json_question_repository import JsonQuestionRepository


def _write_questions_file(tmp_path, payload):
    questions_file = tmp_path / "questions.json"
    questions_file.write_text(json.dumps(payload), encoding="utf-8")
    return questions_file


def test_load_questions_validates_and_returns_questions(tmp_path):
    questions_file = _write_questions_file(
        tmp_path,
        [
            {
                "id": 1,
                "question_set": "solid principles",
                "prompt": "What does SRP stand for?",
                "options": ["Single Responsibility Principle", "Simple Rendering Pattern"],
                "answer": "Single Responsibility Principle",
                "explanation": "SRP means one reason to change.",
            }
        ],
    )

    repository = JsonQuestionRepository(str(questions_file))

    assert len(repository.get_all()) == 1
    assert repository.get_all()[0].question_set == "solid principles"


def test_load_questions_raises_for_duplicate_ids(tmp_path):
    questions_file = _write_questions_file(
        tmp_path,
        [
            {
                "id": 1,
                "question_set": "solid principles",
                "prompt": "Prompt one",
                "options": ["A", "B"],
                "answer": "A",
                "explanation": "One",
            },
            {
                "id": 1,
                "question_set": "python beginner",
                "prompt": "Prompt two",
                "options": ["C", "D"],
                "answer": "C",
                "explanation": "Two",
            },
        ],
    )

    with pytest.raises(RuntimeError, match="Duplicate question ids"):
        JsonQuestionRepository(str(questions_file))


def test_load_questions_raises_for_answer_not_in_options(tmp_path):
    questions_file = _write_questions_file(
        tmp_path,
        [
            {
                "id": 1,
                "question_set": "solid principles",
                "prompt": "Prompt",
                "options": ["A", "B"],
                "answer": "C",
                "explanation": "Explanation",
            }
        ],
    )

    with pytest.raises(RuntimeError, match="Answer must match one of the options"):
        JsonQuestionRepository(str(questions_file))


def test_load_questions_raises_for_non_array_payload(tmp_path):
    questions_file = _write_questions_file(tmp_path, {"id": 1})

    with pytest.raises(RuntimeError, match="JSON array"):
        JsonQuestionRepository(str(questions_file))
