import { useCallback, useEffect, useState } from "react";
import { getQuestions, submitAnswer } from "../services/quizService";

export default function Quiz({ isLightTheme }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch {
      setError("Unable to load quiz questions. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const totalQuestions = questions.length;
  const isFinished = totalQuestions > 0 && currentIndex >= totalQuestions;
  const question = questions[currentIndex];
  const progressPercent = totalQuestions
    ? Math.round((currentIndex / totalQuestions) * 100)
    : 0;

  const handleSubmit = async () => {
    if (!question || !selectedAnswer || result) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await submitAnswer(question.id, selectedAnswer);
      setResult(response);

      if (response.correct) {
        setScore((prev) => prev + 1);
      }
    } catch {
      setError("Your answer could not be submitted. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer("");
    setResult(null);
    setError("");
    setCurrentIndex((prev) => prev + 1);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer("");
    setResult(null);
    setError("");
    setScore(0);
  };

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border p-5 ${
          isLightTheme
            ? "border-[#c9d7f4] bg-white/90"
            : "border-[#556483] bg-[#2e3a57]/85"
        }`}
      >
        <p className={`text-sm font-medium ${isLightTheme ? "text-[#334060]" : "text-slate-200"}`}>
          Loading questions...
        </p>
        <div className={`mt-3 h-2 overflow-hidden rounded-full ${isLightTheme ? "bg-[#e1e9fb]" : "bg-[#465474]"}`}>
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#a167ff]" />
        </div>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 text-rose-100">
        <p className="text-sm">{error}</p>
        <button
          onClick={() => void loadQuestions()}
          className="mt-4 rounded-lg border border-rose-200/50 px-4 py-2 text-sm font-semibold transition hover:bg-rose-200/20"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div
        className={`rounded-2xl border p-5 ${
          isLightTheme
            ? "border-[#c9d7f4] bg-white/90 text-[#334060]"
            : "border-[#556483] bg-[#2e3a57]/85 text-slate-200"
        }`}
      >
        No questions are available yet.
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const resultTone = percentage >= 70
      ? (isLightTheme ? "text-emerald-700" : "text-emerald-200")
      : (isLightTheme ? "text-amber-700" : "text-amber-200");

    return (
      <div
        className={`rounded-2xl border p-6 ${
          isLightTheme
            ? "border-[#c9d7f4] bg-white/90"
            : "border-[#556483] bg-[#2e3a57]/85"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            isLightTheme ? "text-[#5d44d2]" : "text-[#d9d2ff]"
          }`}
        >
          Quiz Complete
        </p>
        <h2
          className={`mt-2 text-2xl font-bold font-['Space_Grotesk'] ${
            isLightTheme ? "text-[#243252]" : "text-white"
          }`}
        >
          You scored {score} / {totalQuestions}
        </h2>
        <p className={`mt-3 text-sm ${resultTone}`}>Final accuracy: {percentage}%</p>

        <button
          onClick={restartQuiz}
          className="mt-6 rounded-xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          Play again
        </button>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const progressWidth = `${Math.min(progressPercent, 100)}%`;

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-[1.7rem] border p-5 shadow-2xl sm:p-7 ${
        isLightTheme
          ? "border-[#c9d7f4] bg-white/90 shadow-[#d3dcf8]/70"
          : "border-[#556483] bg-[#2d3956]/90 shadow-[#172033]/70"
      }`}
    >
      <div className="mb-4 shrink-0 flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-xl ${
              isLightTheme
                ? "bg-[#dff7e8] text-[#1b6c44]"
                : "bg-[#c2f4d8] text-[#1b6c44]"
            }`}
          >
            <span className="text-lg font-black">S</span>
          </div>
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                isLightTheme ? "text-slate-500" : "text-slate-300"
              }`}
            >
              Topic
            </p>
            <p
              className={`text-2xl font-semibold leading-none font-['Space_Grotesk'] ${
                isLightTheme ? "text-[#243252]" : "text-white"
              }`}
            >
              SOLID
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${ isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
            Question {currentIndex + 1} of {totalQuestions}
          </p>
          <p className={`mt-0.5 text-xs ${ isLightTheme ? "text-slate-500" : "text-slate-400"}`}>
            Score: {score} / {totalQuestions}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
        <section className="flex h-full flex-col lg:pr-4">
          <h2
            className={`text-2xl font-bold leading-tight sm:text-3xl font-['Space_Grotesk'] ${
              isLightTheme ? "text-[#243252]" : "text-white"
            }`}
          >
            {question.prompt}
          </h2>

          <p className={`mt-4 text-sm leading-relaxed ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
            Select one option from the right panel, then submit your answer to continue.
          </p>

          <div className="mt-8 w-full max-w-md lg:mt-auto lg:pt-10">
            <div
              className={`mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] ${
                isLightTheme ? "text-[#5d44d2]" : "text-[#d9d2ff]"
              }`}
            >
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${isLightTheme ? "bg-[#d6e0f8]" : "bg-[#465474]"}`}>
              <div
                className="h-full rounded-full bg-linear-to-r from-[#8f46ff] to-[#b260ff] transition-all duration-500"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </section>

        <section key={question.id} className="space-y-3 overflow-y-auto pt-1 lg:pr-1">
          {question.options.map((opt, index) => {
            const isSelected = selectedAnswer === opt;
            const isSelectedResult = result && isSelected;
            const isCorrectAnswer = result && opt === result.correct_answer;
            const optionTone = isSelectedResult
              ? result.correct
                ? (isLightTheme
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-emerald-300/70 bg-emerald-400/15 text-emerald-100")
                : (isLightTheme
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-rose-300/70 bg-rose-400/15 text-rose-100")
              : isCorrectAnswer
                ? (isLightTheme
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-emerald-300/70 bg-emerald-400/15 text-emerald-100")
              : isSelected
                ? (isLightTheme
                    ? "border-[#8f46ff]/70 bg-[#8f46ff]/12 text-[#35206e]"
                    : "border-[#b88bff] bg-[#8e4ef8]/25 text-white")
                : (isLightTheme
                    ? "border-[#c2d2ef] bg-[#ecf2ff] text-[#34425f]"
                    : "border-[#617192] bg-[#445372]/95 text-slate-100");

            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(result)}
                onClick={() => setSelectedAnswer(opt)}
                style={{ animationDelay: `${index * 75}ms` }}
                className={`option-enter flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${optionTone} ${
                  result
                    ? "cursor-default"
                    : isLightTheme
                      ? "hover:-translate-y-0.5 hover:border-[#8f46ff]/60 hover:bg-[#8f46ff]/10"
                      : "hover:-translate-y-0.5 hover:border-[#b88bff] hover:bg-[#8e4ef8]/20"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-colors duration-200 ${
                    isSelected && !result
                      ? "border-emerald-400 bg-emerald-400 text-white"
                      : isLightTheme
                        ? "border-[#b8c7e8] bg-white text-[#4a5672]"
                        : "border-current/40 bg-white/85 text-[#4a5672]"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-lg leading-relaxed">{opt}</span>
                {result && opt === result.correct_answer && (
                  <span className="ml-auto shrink-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-400 text-emerald-400">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </span>
                )}
                {result && isSelected && !result.correct && (
                  <span className="ml-auto shrink-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-rose-400 text-rose-400">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}

          {!result ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || isSubmitting}
              className="mt-4 w-full rounded-2xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-4 py-2.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </button>
          ) : (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                result.correct
                  ? (isLightTheme
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-emerald-300/50 bg-emerald-500/10 text-emerald-100")
                  : (isLightTheme
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-amber-300/50 bg-amber-500/10 text-amber-100")
              }`}
            >
              <p className="font-semibold uppercase tracking-[0.14em]">
                {result.correct ? "Correct!" : "Not quite"}
              </p>
              <p className="mt-1 leading-relaxed">{result.explanation}</p>
              <button
                onClick={nextQuestion}
                className={`mt-3 rounded-lg border border-current/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  isLightTheme ? "hover:bg-black/5" : "hover:bg-white/10"
                }`}
              >
                {currentIndex + 1 === totalQuestions ? "See final score" : "Next question"}
              </button>
            </div>
          )}

          {error && (
            <p
              className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                isLightTheme
                  ? "border-rose-300/80 bg-rose-50 text-rose-700"
                  : "border-rose-300/40 bg-rose-500/10 text-rose-100"
              }`}
            >
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
