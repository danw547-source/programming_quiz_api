/**
 * Integration tests for the Quiz component.
 *
 * The entire quizService module is mocked so tests control exactly what the
 * API returns without any real network calls.
 *
 * Math.random is spied on and forced to return a high value (0.9999) so the
 * Fisher-Yates shuffle keeps the original question order — this makes
 * assertions about which question appears first predictable.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Quiz from "./Quiz";
import * as quizService from "../services/quizService";

vi.mock("../services/quizService", () => ({
  CHEAT_SHEET_ENDPOINT: "http://127.0.0.1:8000/cheat-sheet",
  QUESTIONS_ENDPOINT: "http://127.0.0.1:8000/questions",
  QUESTION_SETS_ENDPOINT: "http://127.0.0.1:8000/question-sets",
  getAnswerEndpoint: (questionId) => `http://127.0.0.1:8000/answer/${questionId}`,
  getCheatSheet: vi.fn(),
  getQuestionSets: vi.fn(),
  getQuestions: vi.fn(),
  submitAnswer: vi.fn(),
}));

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question_set: "solid principles",
    prompt: "What does SRP stand for?",
    options: ["Single Responsibility Principle", "Simple Rendering Pattern"],
  },
  {
    id: 2,
    question_set: "solid principles",
    prompt: "What does DIP stand for?",
    options: ["Dependency Inversion Principle", "Domain Integration Pattern"],
  },
];

const SAMPLE_CHEAT_SHEET = {
  question_set: "solid principles",
  total_questions: 2,
  entries: [
    {
      id: 1,
      prompt: "What does SRP stand for?",
      answer: "Single Responsibility Principle",
      explanation: "SRP says a class should have one reason to change.",
    },
    {
      id: 2,
      prompt: "What does DIP stand for?",
      answer: "Dependency Inversion Principle",
      explanation: "DIP says high-level modules should depend on abstractions.",
    },
  ],
};

describe("Quiz component", () => {
  let randomSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9999);

    quizService.getQuestionSets.mockResolvedValue(["solid principles"]);
    quizService.getQuestions.mockResolvedValue(SAMPLE_QUESTIONS);
    quizService.getCheatSheet.mockResolvedValue(SAMPLE_CHEAT_SHEET);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it("loads question sets and questions on first render", async () => {
    render(
      <Quiz
        isLightTheme
        selectedCategory="programming"
        onCategoryChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(quizService.getQuestionSets).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(quizService.getQuestions).toHaveBeenCalledWith(undefined);
    });

    expect(screen.getByText("What does SRP stand for?")).toBeInTheDocument();
  });

  it("shows answer and explanation for the current question in cheat sheet", async () => {
    const user = userEvent.setup();

    render(
      <Quiz
        isLightTheme
        selectedCategory="programming"
        onCategoryChange={vi.fn()}
      />,
    );

    await screen.findByText("What does SRP stand for?");

    await user.click(screen.getByRole("button", { name: "Cheat Sheet" }));

    await waitFor(() => {
      expect(quizService.getCheatSheet).toHaveBeenCalledWith("solid principles");
    });

    expect(screen.getByText("Answer: Single Responsibility Principle")).toBeInTheDocument();
    expect(screen.getByText("SRP says a class should have one reason to change.")).toBeInTheDocument();
    expect(screen.queryByText("DIP says high-level modules should depend on abstractions.")).not.toBeInTheDocument();
  });
});
