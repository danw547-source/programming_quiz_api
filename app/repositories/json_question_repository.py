import json # Import the json module to work with JSON data
from typing import List # Import the List type from the typing module for type annotations
from app.models.question import Question # Import the Question class from the models package
from app.repositories.question_repository import QuestionRepository

class JsonQuestionRepository(QuestionRepository):
    # This class implements the QuestionRepository interface and provides a way to load questions from a JSON file. The JSON file should contain an array of question objects, each with the same structure as the Question class.
    def __init__(self, file_path:str):
        self.file_path = file_path
        self.questions = self.load_questions()

    # The load_questions method reads the JSON file, parses it, and creates a list of Question objects from the data. It uses a list comprehension to iterate over the parsed JSON data and unpack each question's attributes into the Question constructor.
    def load_questions(self) -> List[Question]:
        
        with open(self.file_path, "r", encoding="utf-8") as file: # Open the JSON file in read mode using a context manager (with statement) to ensure that the file is properly closed after reading.
            data = json.load(file)# Load the JSON data from the file and store it in the data variable. The json.load function reads the file and parses the JSON content into a Python data structure (in this case, a list of dictionaries).
            
        return [Question(**q) for q in data] # Unpack the question data into the Question constructor using **q, where q is a dictionary representing a single question from the JSON file. This allows us to create a Question object for each entry in the JSON array.
    
    def get_all(self) -> List[Question]:
        return self.questions
    
    def get_by_id(self, question_id:int) -> Question | None:
        
        for question in self.questions:
            if question.id == question_id:
                return question
        return None
    
# This is a concrete implementation of the repository interface.

# Later you could add: DatabaseQuestionRepository, ApiQuestionRepository without modifying the rest of the system.

# This demonstrates Open Closed Principle.