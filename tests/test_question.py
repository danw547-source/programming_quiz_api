from app.models.question import Question

# This file contains tests for the Question class in the app.models.question module.

def test_correct_answer():
    
    question = Question(
        1,
        "Test", ["A", "B"],
        "A",
        "Explanation"
    )
    
    assert question.check_answer("A") is True
        
def test_wrong_answer():

    question = Question(
        1,
        "Test",
        ["A", "B"],
        "A",
        "explanation"
    )
    
    assert question.check_answer("B") is False