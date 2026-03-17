// Questions are bundled at build time from the local JSON so the app works
// without a running API server and loads instantly.
import allQuestionsData from "../data/questions.json";

// These constants are kept so external tooling and error messages that
// reference them continue to compile if the API server is ever used again.
const normalizeApiUrl = (url) => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
);

export const QUESTION_SETS_ENDPOINT = `${API_BASE_URL}/question-sets`;
export const QUESTIONS_ENDPOINT = `${API_BASE_URL}/questions`;
export const CHEAT_SHEET_ENDPOINT = `${API_BASE_URL}/cheat-sheet`;
export const getAnswerEndpoint = (questionId) => `${API_BASE_URL}/answer/${questionId}`;

const normalize = (s) => s?.trim().toLowerCase() ?? "";

export const getQuestions = async (questionSet) => {
  const filtered = questionSet
    ? allQuestionsData.filter((q) => normalize(q.question_set) === normalize(questionSet))
    : allQuestionsData;
  // Omit answer and explanation so they are not trivially readable in the
  // quiz UI before the user submits — consistent with the former API behaviour.
  return filtered.map(({ id, question_set, prompt, options }) => ({
    id,
    question_set,
    prompt,
    options,
  }));
};

export const getQuestionSets = async () =>
  [...new Set(allQuestionsData.map((q) => q.question_set))];

export const getCheatSheet = async (questionSet) => {
  const questions = allQuestionsData.filter(
    (q) => normalize(q.question_set) === normalize(questionSet),
  );
  if (!questions.length) {
    throw new Error(`Question set not found: ${questionSet}`);
  }
  return {
    question_set: normalize(questionSet),
    total_questions: questions.length,
    entries: questions.map(({ id, prompt, answer, explanation }) => ({
      id,
      prompt,
      answer,
      explanation,
    })),
  };
};

export const submitAnswer = async (questionId, answer) => {
  const question = allQuestionsData.find((q) => q.id === questionId);
  if (!question) {
    throw new Error(`Question not found: ${questionId}`);
  }
  const correct = normalize(question.answer) === normalize(answer);
  return {
    correct,
    correct_answer: question.answer,
    explanation: question.explanation,
  };
};
