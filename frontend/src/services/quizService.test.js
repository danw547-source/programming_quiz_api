/**
 * Unit tests for the quizService data layer.
 *
 * Questions are now bundled from the local JSON file, so all functions are
 * exercised against real seed data — no HTTP mocking required.
 */
import { describe, expect, it } from "vitest";

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
  it("getQuestions returns questions without answer or explanation", async () => {
    const questions = await getQuestions();
    expect(questions.length).toBeGreaterThan(0);
    const q = questions[0];
    expect(q).toHaveProperty("id");
    expect(q).toHaveProperty("question_set");
    expect(q).toHaveProperty("prompt");
    expect(q).toHaveProperty("options");
    expect(q).not.toHaveProperty("answer");
    expect(q).not.toHaveProperty("explanation");
  });

  it("getQuestions filters by question_set", async () => {
    const all = await getQuestions();
    const firstSet = all[0].question_set;
    const filtered = await getQuestions(firstSet);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((q) => q.question_set === firstSet)).toBe(true);
  });

  it("getQuestions filter is case-insensitive", async () => {
    const all = await getQuestions();
    const firstSet = all[0].question_set;
    const filtered = await getQuestions(firstSet.toUpperCase());
    expect(filtered.length).toBeGreaterThan(0);
  });

  it("getQuestions returns empty array for unknown set", async () => {
    const result = await getQuestions("__nonexistent__");
    expect(result).toEqual([]);
  });

  it("getQuestionSets returns a non-empty list of unique set names", async () => {
    const sets = await getQuestionSets();
    expect(sets.length).toBeGreaterThan(0);
    expect(new Set(sets).size).toBe(sets.length);
  });

  it("getCheatSheet returns entries with answer and explanation", async () => {
    const [firstSet] = await getQuestionSets();
    const cheatSheet = await getCheatSheet(firstSet);
    expect(cheatSheet.entries.length).toBeGreaterThan(0);
    const entry = cheatSheet.entries[0];
    expect(entry).toHaveProperty("id");
    expect(entry).toHaveProperty("prompt");
    expect(entry).toHaveProperty("answer");
    expect(entry).toHaveProperty("explanation");
  });

  it("getCheatSheet throws for an unknown question set", async () => {
    await expect(getCheatSheet("__nonexistent__")).rejects.toThrow();
  });

  it("submitAnswer returns correct:true for the right answer", async () => {
    const [firstSet] = await getQuestionSets();
    const [question] = await getQuestions(firstSet);
    const { entries } = await getCheatSheet(firstSet);
    const { answer } = entries.find((e) => e.id === question.id);

    const result = await submitAnswer(question.id, answer);
    expect(result.correct).toBe(true);
    expect(result.correct_answer).toBe(answer);
    expect(result).toHaveProperty("explanation");
  });

  it("submitAnswer returns correct:false for a wrong answer", async () => {
    const [firstSet] = await getQuestionSets();
    const [question] = await getQuestions(firstSet);
    const { entries } = await getCheatSheet(firstSet);
    const { answer } = entries.find((e) => e.id === question.id);
    const wrong = question.options.find((o) => o !== answer);

    const result = await submitAnswer(question.id, wrong);
    expect(result.correct).toBe(false);
  });

  it("submitAnswer throws for an unknown question ID", async () => {
    await expect(submitAnswer(-999, "anything")).rejects.toThrow();
  });

  it("endpoint URL constants are exported", () => {
    expect(QUESTION_SETS_ENDPOINT).toContain("/question-sets");
    expect(QUESTIONS_ENDPOINT).toContain("/questions");
    expect(CHEAT_SHEET_ENDPOINT).toContain("/cheat-sheet");
    expect(getAnswerEndpoint(1)).toContain("/answer/1");
  });
});
