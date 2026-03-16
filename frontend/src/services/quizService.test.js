/**
 * Unit tests for the quizService API client.
 *
 * axios is mocked at the module level so no real HTTP requests are made.
 * vi.hoisted() is required because vi.mock() calls are hoisted to the top of
 * the file by Vitest, so any variables they reference must also be hoisted —
 * a regular `const` defined before the mock call would not yet be in scope.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
    })),
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

describe("quizService", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it("fetches questions with question_set filter when provided", async () => {
    const expected = [{ id: 1 }];
    mockGet.mockResolvedValueOnce({ data: expected });

    const result = await getQuestions("solid principles");

    expect(mockGet).toHaveBeenCalledWith(QUESTIONS_ENDPOINT, {
      params: { question_set: "solid principles" },
    });
    expect(result).toEqual(expected);
  });

  it("fetches all questions when filter is omitted", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    mockGet.mockResolvedValueOnce({ data: expected });

    const result = await getQuestions();

    expect(mockGet).toHaveBeenCalledWith(QUESTIONS_ENDPOINT, {
      params: undefined,
    });
    expect(result).toEqual(expected);
  });

  it("fetches question sets", async () => {
    const expected = ["solid principles", "python beginner"];
    mockGet.mockResolvedValueOnce({ data: expected });

    const result = await getQuestionSets();

    expect(mockGet).toHaveBeenCalledWith(QUESTION_SETS_ENDPOINT);
    expect(result).toEqual(expected);
  });

  it("fetches cheat sheet for a set", async () => {
    const expected = { question_set: "solid principles", entries: [] };
    mockGet.mockResolvedValueOnce({ data: expected });

    const result = await getCheatSheet("solid principles");

    expect(mockGet).toHaveBeenCalledWith(CHEAT_SHEET_ENDPOINT, {
      params: { question_set: "solid principles" },
    });
    expect(result).toEqual(expected);
  });

  it("submits answers as JSON body", async () => {
    const expected = { correct: true };
    mockPost.mockResolvedValueOnce({ data: expected });

    const result = await submitAnswer(42, "A");

    expect(mockPost).toHaveBeenCalledWith(getAnswerEndpoint(42), { answer: "A" });
    expect(result).toEqual(expected);
  });
});
