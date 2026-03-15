from typing import List

# This file defines the Question class, which represents a question in the quiz application. Each question has an id, a prompt, a list of options, an answer, and an explanation.
class Question:
    
    def __init__(self, id:int, prompt: str, options:List[str], answer: str, explanation: str):
        self.id = id
        self.prompt = prompt
        self.options = options
        self.answer = answer
        self.explanation = explanation
        
    # This method checks if the user's answer is correct by comparing it to the correct answer. It ignores leading and trailing whitespace and is case-insensitive.    
    def check_answer(self, user_answer: str) -> bool:
        return user_answer.strip().lower() == self.answer.lower()