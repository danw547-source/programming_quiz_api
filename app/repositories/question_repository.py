from abc import ABC, abstractmethod
from typing import List
from app.models.question import Question

# This file defines a contract for the QuestionRepository interface, which specifies the methods that any concrete implementation of a question repository must implement. The repository is responsible for retrieving questions from a data source, such as a database or an in-memory list.
class QuestionRepository(ABC):

# The get_all method retrieves all questions from the repository and returns them as a list of Question objects. 
    @abstractmethod
    def get_all(self) -> List[Question]:
        pass
    
# The get_by_id method retrieves a specific question by its id and returns it as a Question object, or None if the question is not found.
    @abstractmethod
    def get_by_id(self, question_id: int) -> Question | None:
        pass
    
# Any repository must implement these methods.
# This allows the system to work with:JSON, Database, External API etc without changing the service.
# This demonstrates Dependency Inversion Principle.