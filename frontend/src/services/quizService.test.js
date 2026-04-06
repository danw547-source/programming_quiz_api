import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost, mockCreate, mockIsAxiosError } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockApiClient = {
    get: mockGet,
    post: mockPost,
  };

  return {
    mockGet,
    mockPost,
    mockCreate: vi.fn(() => mockApiClient),
    mockIsAxiosError: vi.fn((error) => Boolean(error?.isAxiosError)),
  };
});

vi.mock("axios", () => ({
  default: {
    create: mockCreate,
    isAxiosError: mockIsAxiosError,
  },
}));

import {
  CHEAT_SHEET_ENDPOINT,
  getAnswerEndpoint,
  getCheatSheet,
  getQuestionSets,
  getQuestions,
  QUESTION_SETS_ENDPOINT,
  QUESTIONS_ENDPOINT,
  submitAnswer,
} from "./quizService";

const buildAxiosError = (detail, message = "Request failed") => ({
  isAxiosError: true,
  message,
  response: detail ? { data: { detail } } : undefined,
});

describe("quizService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockImplementation(() => ({
      get: mockGet,
      post: mockPost,
    }));
    mockIsAxiosError.mockImplementation((error) => Boolean(error?.isAxiosError));
  });

  it("getQuestions returns local questions filtered by question_set", async () => {
    const result = await getQuestions("solid principles");

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((question) => question.question_set === "solid principles")).toBe(true);
    expect(result.every((question) => !Object.hasOwn(question, "answer"))).toBe(true);
    expect(result.every((question) => !Object.hasOwn(question, "explanation"))).toBe(true);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("getQuestions returns all local questions when no set is provided", async () => {
    const result = await getQuestions();
    expect(result.length).toBeGreaterThan(100);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("getQuestions returns an empty list for unknown sets", async () => {
    const result = await getQuestions("unknown");
    expect(result).toEqual([]);
  });

  it("getQuestionSets returns local inventory", async () => {
    const result = await getQuestionSets();

    expect(result).toContain("solid principles");
    expect(result).toContain("gear4music interview cheat sheet");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("getCheatSheet loads local answers and explanations", async () => {
    const result = await getCheatSheet("  solid principles  ");

    expect(result.question_set).toBe("solid principles");
    expect(result.total_questions).toBeGreaterThan(0);
    expect(result.entries.every((entry) => entry.answer && entry.explanation)).toBe(true);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("getCheatSheet rejects blank question_set values", async () => {
    await expect(getCheatSheet("   ")).rejects.toThrow("Question set is required.");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("getCheatSheet rejects unknown sets", async () => {
    await expect(getCheatSheet("unknown")).rejects.toThrow("Question set not found");
  });

  it("submitAnswer posts to the answer endpoint and returns response data", async () => {
    const result = await submitAnswer(1, "Single Responsibility Principle");

    expect(result.correct).toBe(true);
    expect(result.correct_answer).toBe("Single Responsibility Principle");
    expect(result.explanation).toContain("SRP");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("submitAnswer returns false for incorrect answers", async () => {
    const result = await submitAnswer(1, "Wrong answer");
    expect(result.correct).toBe(false);
  });

  it("submitAnswer rejects unknown question ids", async () => {
    await expect(submitAnswer(999999, "anything")).rejects.toThrow("Question not found");
  });

  it("endpoint URL constants are exported", () => {
    expect(QUESTION_SETS_ENDPOINT).toContain("/question-sets");
    expect(QUESTIONS_ENDPOINT).toContain("/questions");
    expect(CHEAT_SHEET_ENDPOINT).toContain("/cheat-sheet");
    expect(getAnswerEndpoint(1)).toContain("/answer/1");
  });
});
