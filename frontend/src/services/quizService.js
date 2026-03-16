import axios from "axios";

// The API URL can be overridden by setting VITE_API_URL in a .env file in the frontend folder.
// Remove any trailing slash so endpoint concatenation stays predictable.
const normalizeApiUrl = (url) => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
);

// Timeout keeps the UI from hanging forever when a network request stalls.
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000);
const apiClient = axios.create({ timeout: API_TIMEOUT_MS });

export const QUESTIONS_ENDPOINT = `${API_BASE_URL}/questions`;
export const getAnswerEndpoint = (questionId) => `${API_BASE_URL}/answer/${questionId}`;

export const getQuestions = async () => {
  const res = await apiClient.get(QUESTIONS_ENDPOINT);
  return res.data;
};

export const submitAnswer = async (questionId, answer) => {
  // The answer is sent as a JSON body rather than a query parameter.
  const res = await apiClient.post(getAnswerEndpoint(questionId), { answer });
  return res.data;
};
