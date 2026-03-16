# This file contains tests for the Question class in the app.models.question module.
from app.models.question import Question


def make_question(answer: str = "A") -> Question:
    return Question(
        id=1,
        question_set="solid",
        prompt="Test",
        options=["A", "B"],
        answer=answer,
        explanation="Explanation",
    )

def test_correct_answer():
    question = make_question()
    
    assert question.check_answer("A") is True
        
def test_wrong_answer():
    question = make_question()
    
    assert question.check_answer("B") is False

def test_correct_answer_case_insensitive():
    question = make_question()
    assert question.check_answer("a") is True

def test_correct_answer_with_whitespace():
    question = make_question()
    assert question.check_answer("  A  ") is True


def test_question_set_is_normalized():
    question = Question(
        id=1,
        question_set=" SOLID ",
        prompt="Test",
        options=["A", "B"],
        answer="A",
        explanation="Explanation",
    )

    assert question.question_set == "solid"