import axios from "axios";

// The API URL can be overridden by setting VITE_API_URL in a .env file in the frontend folder.
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export const getQuestions = async () => {
  const res = await axios.get(`${API_URL}/questions`);
  return res.data;
};

export const submitAnswer = async (questionId, answer) => {
  // The answer is sent as a JSON body rather than a query parameter.
  const res = await axios.post(`${API_URL}/answer/${questionId}`, { answer });
  return res.data;
};
