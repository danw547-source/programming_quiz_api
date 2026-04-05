import json
from collections import Counter
from pathlib import Path


QUESTIONS_FILE_PATH = Path("app/data/questions.json")
QUESTIONS_PER_SET = 20
SPECIAL_SET_COUNTS = {
    "g4m 2": 25,
    "g4mextended": 35,
    "caching & indexing beginner": 8,
}
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
    "windows os",
    "software and productivity",
    "hardware",
    "networking",
    "office 365",
    "google workspace",
    "fitness instructing level 1",
    "fitness instructing level 2",
    "fitness instructing level 3",
    "music theory grade 1",
    "music theory grade 2",
    "music theory grade 3",
    "music theory grade 4",
    "music theory grade 5",
    "music theory grade 6",
    "music theory grade 7",
    "music theory grade 8",
    "vue.js beginner",
    "vue.js intermediate",
    "vue.js expert",
    "react beginner",
    "react intermediate",
    "react expert",
    "laravel beginner",
    "laravel intermediate",
    "laravel expert",
    "php beginner",
    "php intermediate",
    "php expert",
    "javascript beginner",
    "javascript intermediate",
    "javascript expert",
    "sql beginner",
    "sql intermediate",
    "sql expert",
    "gear4music",
    "g4m project workflow",
    "g4m 2",
    "g4mextended",
    "caching & indexing beginner",
    "object oriented programming",
}


def test_seed_questions_have_expected_set_inventory_and_counts():
    with QUESTIONS_FILE_PATH.open("r", encoding="utf-8") as file:
        questions = json.load(file)

    question_set_counts = Counter(question["question_set"] for question in questions)

    assert set(question_set_counts) == EXPECTED_QUESTION_SETS

    expected_total = 0
    for question_set in EXPECTED_QUESTION_SETS:
        expected_count = SPECIAL_SET_COUNTS.get(question_set, QUESTIONS_PER_SET)
        assert question_set_counts[question_set] == expected_count
        expected_total += expected_count

    assert len(questions) == expected_total
