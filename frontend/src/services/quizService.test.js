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

  it("getQuestions returns response data and passes question_set filter", async () => {
    const responsePayload = [{ id: 1, question_set: "solid principles", prompt: "P", options: ["A"] }];
    mockGet.mockResolvedValueOnce({ data: responsePayload });

    const result = await getQuestions("solid principles");

    expect(mockGet).toHaveBeenCalledWith("/questions", {
      params: { question_set: "solid principles" },
    });
    expect(result).toEqual(responsePayload);
  });

  it("getQuestions omits filter params when question_set is not provided", async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await getQuestions();

    expect(mockGet).toHaveBeenCalledWith("/questions", {
      params: undefined,
    });
  });

  it("getQuestions surfaces API detail from axios errors", async () => {
    mockGet.mockRejectedValueOnce(buildAxiosError("Question set not found"));

    await expect(getQuestions("unknown")).rejects.toThrow("Question set not found");
  });

  it("getQuestionSets returns response data", async () => {
    const responsePayload = ["python beginner", "solid principles"];
    mockGet.mockResolvedValueOnce({ data: responsePayload });

    const result = await getQuestionSets();

    expect(mockGet).toHaveBeenCalledWith("/question-sets");
    expect(result).toEqual(responsePayload);
  });

  it("getCheatSheet trims and forwards the selected question set", async () => {
    const responsePayload = {
      question_set: "solid principles",
      total_questions: 1,
      entries: [{ id: 1, prompt: "P", answer: "A", explanation: "E" }],
    };
    mockGet.mockResolvedValueOnce({ data: responsePayload });

    const result = await getCheatSheet("  solid principles  ");

    expect(mockGet).toHaveBeenCalledWith("/cheat-sheet", {
      params: { question_set: "solid principles" },
    });
    expect(result).toEqual(responsePayload);
  });

  it("getCheatSheet rejects blank question_set values", async () => {
    await expect(getCheatSheet("   ")).rejects.toThrow("Question set is required.");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("submitAnswer posts to the answer endpoint and returns response data", async () => {
    const responsePayload = {
      correct: true,
      correct_answer: "Single Responsibility Principle",
      explanation: "SRP means one reason to change.",
    };
    mockPost.mockResolvedValueOnce({ data: responsePayload });

    const result = await submitAnswer(1, "Single Responsibility Principle");

    expect(mockPost).toHaveBeenCalledWith("/answer/1", {
      answer: "Single Responsibility Principle",
    });
    expect(result).toEqual(responsePayload);
  });

  it("submitAnswer falls back to a friendly message on non-axios errors", async () => {
    mockIsAxiosError.mockReturnValue(false);
    mockPost.mockRejectedValueOnce(new Error("Boom"));

    await expect(submitAnswer(999, "anything")).rejects.toThrow("Unable to submit answer.");
  });

  it("endpoint URL constants are exported", () => {
    expect(QUESTION_SETS_ENDPOINT).toContain("/question-sets");
    expect(QUESTIONS_ENDPOINT).toContain("/questions");
    expect(CHEAT_SHEET_ENDPOINT).toContain("/cheat-sheet");
    expect(getAnswerEndpoint(1)).toContain("/answer/1");
  });
});
