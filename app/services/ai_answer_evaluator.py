"""AI-backed answer comparison heuristics."""
from difflib import SequenceMatcher


def is_answer_correct(correct_answer: str, submitted_answer: str) -> bool:
    """Heuristic correctness for free-text AI-style quiz answers."""
    normalized_reference = " ".join(correct_answer.strip().lower().split())
    normalized_submission = " ".join(submitted_answer.strip().lower().split())

    if not normalized_submission:
        return False

    if normalized_reference == normalized_submission:
        return True

    # A lightweight "AI" heuristic: proportion of character sequence match.
    similarity = SequenceMatcher(None, normalized_reference, normalized_submission).ratio()

    # If the model is very close, count as correct.
    return similarity >= 0.70
