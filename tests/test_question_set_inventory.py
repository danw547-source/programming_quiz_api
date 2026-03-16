import json
from collections import Counter
from pathlib import Path


QUESTIONS_FILE_PATH = Path("app/data/questions.json")
QUESTIONS_PER_SET = 20
EXPECTED_QUESTION_SETS = {
    "solid principles",
    "mvc model view controller beginner",
    "mvc model view controller intermediate",
    "mvc model view controller expert",
    "python beginner",
    "python intermediate",
    "python expert",
    "restful api",
    "music theory beginner",
    "music theory intermediate",
    "music theory expert",
    "ear training fundamentals beginner",
    "rhythm and meter mastery beginner",
    "functional harmony foundations intermediate",
    "melody and phrase construction intermediate",
    "sight reading and notation fluency intermediate",
    "circle of fifths and modulation intermediate",
    "counterpoint and voice leading advanced",
    "form and analysis advanced",
    "jazz harmony and improvisation language advanced",
    "guitar comping and rhythm styles advanced",
    "scales beginner",
    "scales intermediate",
    "scales expert",
    "keyboard music theory beginner",
    "keyboard music theory intermediate",
    "keyboard music theory expert",
    "guitar based music theory beginner",
    "guitar based music theory intermediate",
    "guitar based music theory expert",
    "finance general",
    "home cooking general",
    "equinology general",
}


def test_seed_questions_have_expected_set_inventory_and_counts():
    with QUESTIONS_FILE_PATH.open("r", encoding="utf-8") as file:
        questions = json.load(file)

    question_set_counts = Counter(question["question_set"] for question in questions)

    assert set(question_set_counts) == EXPECTED_QUESTION_SETS
    assert all(count == QUESTIONS_PER_SET for count in question_set_counts.values())
    assert len(questions) == len(EXPECTED_QUESTION_SETS) * QUESTIONS_PER_SET
