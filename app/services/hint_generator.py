"""Intelligent hint generation for AI Quiz mode."""
import re


def generate_hint(answer: str) -> str:
    """
    Generate an intelligent, concise hint from a complete answer.
    
    The hint guides the user toward the answer without directly giving it away,
    by identifying key concepts and framing them as a direction or nudge.
    
    Args:
        answer: The complete correct answer
        
    Returns:
        A helpful hint that guides thinking in the right direction
    """
    if not answer or not answer.strip():
        return ""
    
    answer = answer.strip()
    
    # Strategy 1: Look for contrasts (this vs that) - highest priority
    if ' vs ' in answer.lower() or ' versus ' in answer.lower():
        parts = re.split(r'\s+(?:vs|versus)\s+', answer, maxsplit=1, flags=re.IGNORECASE)
        if len(parts) == 2:
            first = parts[0].strip().split()[-2:]  # Last 2 words
            second = parts[1].strip().split()[:3]  # First 3 words
            return f"Compare: {' '.join(first)} vs {' '.join(second)}"
    
    if ' rather than ' in answer.lower():
        parts = re.split(r'\s+rather than\s+', answer, maxsplit=1, flags=re.IGNORECASE)
        if len(parts) == 2:
            concept = parts[0].strip().split()[-3:]  # Last 3 words
            return f"Think about: {' '.join(concept)}"
    
    if ' instead of ' in answer.lower():
        parts = re.split(r'\s+instead of\s+', answer, maxsplit=1, flags=re.IGNORECASE)
        if len(parts) == 2:
            concept = parts[0].strip().split()[-3:]
            return f"Focus on: {' '.join(concept)}"
    
    # Strategy 2: Check for "difference" or "differ" keywords
    if 'difference' in answer.lower():
        # Find items being compared with "between"
        match = re.search(r'(?:between|among)\s+([^\s,]+)\s+(?:and|or)\s+([^\s,]+)', answer, re.IGNORECASE)
        if match:
            item1 = match.group(1)
            item2 = match.group(2)
            return f"Distinguish: {item1} from {item2}"
    
    # Strategy 3: Look for "is about" or "is a" or "means"
    match = re.search(r'(?:is|means)\s+(?:a|an)?\s*([A-Z]\w+(?:\s+\w+){0,3})', answer)
    if match:
        concept = match.group(1).strip()
        if 4 < len(concept) < 50:
            return f"Hint: {concept}"
    
    # Strategy 4: Look for action patterns "X handles/manages Y"
    match = re.search(r'^([A-Z]\w+)\s+(?:handles|manages|controls|performs|provides)', answer)
    if match:
        subject = match.group(1).strip()
        return f"What {subject} does"
    
    # Strategy 5: For lists (comma-separated), hint at first concept only
    if ',' in answer:
        first_clause = answer.split(',')[0].strip()
        words = first_clause.split()
        # Take the main concept (3-5 words)
        if len(words) > 4:
            concept = ' '.join(words[:4])
        else:
            concept = first_clause
        if len(concept) > 5 and len(concept) < 60:
            return f"Start with: {concept}"
    
    # Strategy 6: Fallback based on answer complexity
    word_count = len(answer.split())
    if word_count <= 3:
        return "A short, concise answer"
    elif word_count <= 10:
        words = answer.split()[:4]
        return f"Think about: {' '.join(words)}"
    else:
        return "Consider multiple concepts or relationships"

