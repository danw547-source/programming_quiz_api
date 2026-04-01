"""AI-backed answer comparison heuristics."""
import re
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

    if similarity >= 0.60:
        return True

    # Fallback: word-level overlap to cover paraphrases and explanations.
    reference_words = [word for word in re.sub(r"[^a-z0-9]+", " ", normalized_reference).split() if len(word) > 2]
    submission_words = [word for word in re.sub(r"[^a-z0-9]+", " ", normalized_submission).split() if len(word) > 2]

    if not reference_words or not submission_words:
        return False

    shared = set(reference_words) & set(submission_words)
    overlap_ratio = len(shared) / max(len(reference_words), len(submission_words))

    return overlap_ratio >= 0.45
