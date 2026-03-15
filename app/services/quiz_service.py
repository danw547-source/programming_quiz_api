# This file defines the QuizService class, which contains the business logic for the quiz application. The service interacts with the QuestionRepository to retrieve questions and check answers. It provides methods to get all questions and to check a user's answer for a specific question. The service is designed to be independent of the data source, allowing for flexibility in how questions are stored and retrieved.

from app.repositories.question_repository import QuestionRepository

class QuizService:
    
    def __init__(self, repository: QuestionRepository):
        self.repository = repository
        
    def get_questions(self):
        
        questions = self.repository.get_all()
        
        return [
            {
                "id": q.id,
                "prompt": q.prompt,
                "options": q.options
            }
            for q in questions
        ]
        
    def check_answer(self, question_id, answer: str):
        
        question = self.repository.get_by_id(question_id)
        
        if not question:
            return None
        
        correct = question.check_answer(answer)
        
        return {
            "correct": correct,
            "correct_answer": question.answer,
            "explanation": question.explanation,
        }