import axios from "axios";

const normalizeApiUrl = (url) => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
);

export const QUESTION_SETS_ENDPOINT = `${API_BASE_URL}/question-sets`;
export const QUESTIONS_ENDPOINT = `${API_BASE_URL}/questions`;
export const CHEAT_SHEET_ENDPOINT = `${API_BASE_URL}/cheat-sheet`;
export const getAnswerEndpoint = (questionId) => `${API_BASE_URL}/answer/${questionId}`;

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
  try {
    const response = await apiClient.get("/questions", {
      params: questionSet ? { question_set: questionSet } : undefined,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load questions."));
  }
};

export const getQuestionSets = async () => {
  try {
    const response = await apiClient.get("/question-sets");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load question sets."));
  }
};

export const getCheatSheet = async (questionSet) => {
  const normalizedQuestionSet = questionSet?.trim();
  if (!normalizedQuestionSet) {
    throw new Error("Question set is required.");
  }

  try {
    const response = await apiClient.get("/cheat-sheet", {
      params: { question_set: normalizedQuestionSet },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load cheat sheet."));
  }
};

export const submitAnswer = async (questionId, answer) => {
  try {
    const response = await apiClient.post(`/answer/${questionId}`, { answer });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to submit answer."));
  }
};
