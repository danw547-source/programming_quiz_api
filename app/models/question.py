from dataclasses import dataclass


@dataclass(slots=True)
class Question:
    id: int
    question_set: str
    prompt: str
    options: list[str]
    answer: str
    explanation: str

    def __post_init__(self) -> None:
        self.question_set = self.question_set.strip().casefold()
        self.options = list(self.options)
        if self.answer.strip().casefold() not in {opt.strip().casefold() for opt in self.options}:
            raise ValueError(
                f"Question {self.id}: answer {self.answer!r} is not among the options {self.options}"
            )

    def check_answer(self, user_answer: str) -> bool:
        return user_answer.strip().casefold() == self.answer.casefold()