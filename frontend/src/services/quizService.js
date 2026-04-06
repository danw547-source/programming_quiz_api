import axios from "axios";
import localQuestions from "../data/questions.json";

const normalizeApiUrl = (url) => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
);

export const QUESTION_SETS_ENDPOINT = `${API_BASE_URL}/question-sets`;
export const QUESTIONS_ENDPOINT = `${API_BASE_URL}/questions`;
export const CHEAT_SHEET_ENDPOINT = `${API_BASE_URL}/cheat-sheet`;
export const getAnswerEndpoint = (questionId) => `${API_BASE_URL}/answer/${questionId}`;

export const AI_QUESTION_SETS_ENDPOINT = `${API_BASE_URL}/ai/question-sets`;
export const AI_QUESTIONS_ENDPOINT = `${API_BASE_URL}/ai/questions`;
export const AI_CHEAT_SHEET_ENDPOINT = `${API_BASE_URL}/ai/cheat-sheet`;
export const getAiAnswerEndpoint = (questionId) => `${API_BASE_URL}/ai/answer/${questionId}`;

// Increased from 10s to 30s to allow for cold start initialization on first load.
// Subsequently, with HTTP caching and compression, loads should be <1s per spec.
const DEFAULT_TIMEOUT_MS = 30_000;
const parsedTimeoutMs = Number.parseInt(
  import.meta.env.VITE_API_TIMEOUT_MS ?? `${DEFAULT_TIMEOUT_MS}`,
  10,
);
const API_TIMEOUT_MS = Number.isFinite(parsedTimeoutMs) && parsedTimeoutMs > 0
  ? parsedTimeoutMs
  : DEFAULT_TIMEOUT_MS;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

const normalizeQuestionSet = (questionSet) => questionSet?.trim().toLowerCase();

const sortedQuestionSets = Array.from(
  new Set(localQuestions.map((question) => question.question_set)),
).sort((a, b) => a.localeCompare(b));

const getErrorMessage = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  return fallbackMessage;
};

export const getQuestions = async (questionSet) => {
  const normalizedSet = normalizeQuestionSet(questionSet);
  if (!normalizedSet) {
    return localQuestions.map(({ answer, explanation, ...question }) => question);
  }

  return localQuestions
    .filter((question) => question.question_set === normalizedSet)
    .map(({ answer, explanation, ...question }) => question);
};

export const getQuestionSets = async () => {
  return sortedQuestionSets;
};

export const getCheatSheet = async (questionSet) => {
  const normalizedQuestionSet = questionSet?.trim();
  if (!normalizedQuestionSet) {
    throw new Error("Question set is required.");
  }

  const normalizedSet = normalizeQuestionSet(normalizedQuestionSet);
  const entries = localQuestions
    .filter((question) => question.question_set === normalizedSet)
    .map(({ id, prompt, answer, explanation }) => ({
      id,
      prompt,
      answer,
      explanation,
    }));

  if (!entries.length) {
    throw new Error("Question set not found");
  }

  return {
    question_set: normalizedSet,
    total_questions: entries.length,
    entries,
  };
};

export const submitAnswer = async (questionId, answer) => {
  const question = localQuestions.find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  const normalizedUserAnswer = answer?.trim().toLowerCase() ?? "";
  const normalizedCorrectAnswer = question.answer?.trim().toLowerCase() ?? "";

  return {
    correct: normalizedUserAnswer === normalizedCorrectAnswer,
    correct_answer: question.answer,
    explanation: question.explanation,
  };
};

export const getAiQuestionSets = async () => {
  try {
    const response = await apiClient.get("/ai/question-sets");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load AI question sets."));
  }
};

export const getAiQuestions = async (questionSet) => {
  try {
    const response = await apiClient.get("/ai/questions", {
      params: questionSet ? { question_set: questionSet } : undefined,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load AI questions."));
  }
};

export const getAiCheatSheet = async (questionSet) => {
  const normalizedQuestionSet = questionSet?.trim();
  if (!normalizedQuestionSet) {
    throw new Error("Question set is required.");
  }

  try {
    const response = await apiClient.get("/ai/cheat-sheet", {
      params: { question_set: normalizedQuestionSet },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load AI cheat sheet."));
  }
};

export const submitAiAnswer = async (questionId, answer) => {
  try {
    const response = await apiClient.post(`/ai/answer/${questionId}`, { answer });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to submit AI answer."));
  }
};

export const getAiHint = async (questionId) => {
  try {
    const response = await apiClient.get(`/ai/hint/${questionId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load hint."));
  }
};
