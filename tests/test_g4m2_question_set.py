import json
from pathlib import Path


QUESTIONS_FILE_PATH = Path("app/data/questions.json")
AI_QUESTIONS_FILE_PATH = Path("AIQUESTIONS2.md")


def test_g4m2_exists_with_25_seed_questions():
    with QUESTIONS_FILE_PATH.open("r", encoding="utf-8") as file:
        questions = json.load(file)

    g4m2_questions = [question for question in questions if question["question_set"] == "g4m 2"]
    assert len(g4m2_questions) == 25


def test_g4m2_aiquiz_entries_exist_with_25_questions():
    text = AI_QUESTIONS_FILE_PATH.read_text(encoding="utf-8")
    entry_count = text.count("question_set: g4m 2")
    assert entry_count == 25


def test_g4mextended_exists_with_35_seed_questions():
    with QUESTIONS_FILE_PATH.open("r", encoding="utf-8") as file:
        questions = json.load(file)

    g4mextended_questions = [question for question in questions if question["question_set"] == "g4mextended"]
    assert len(g4mextended_questions) == 35


def test_g4mextended_aiquiz_entries_exist_with_35_questions():
    text = AI_QUESTIONS_FILE_PATH.read_text(encoding="utf-8")
    entry_count = text.count("question_set: g4mextended")
    assert entry_count == 35
