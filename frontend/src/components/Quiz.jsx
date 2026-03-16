import { useCallback, useEffect, useState } from "react";
import {
  getAnswerEndpoint,
  getQuestions,
  QUESTIONS_ENDPOINT,
  submitAnswer,
} from "../services/quizService";

const OPTION_INDEX_BY_KEY = Object.freeze({ a: 0, b: 1, c: 2, d: 3 });

const getRequestFailureLabels = (err) => {
  const status = err?.response?.status;
  return {
    statusLabel: status ? ` (HTTP ${status})` : "",
    timeoutLabel: err?.code === "ECONNABORTED" ? " Request timed out." : "",
  };
};

export default function Quiz({ isLightTheme }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);

  const surfaceCardClasses = isLightTheme
    ? "border-[#c9d7f4] bg-white/90"
    : "border-white/10 bg-[#2b3651]/80";

  const neutralCardClasses = isLightTheme
    ? "border-[#c9d7f4] bg-white/90"
    : "border-[#556483] bg-[#2e3a57]/85";

  const neutralTextClasses = isLightTheme ? "text-[#334060]" : "text-slate-200";

  const summaryTileClasses = isLightTheme
    ? "rounded-2xl border border-[#d8e2fb] bg-[#f5f8ff] px-4 py-3 text-[#334060]"
    : "rounded-2xl border border-[#617192] bg-[#394866] px-4 py-3 text-slate-100";

  const summaryMetaTextClasses = isLightTheme ? "text-slate-500" : "text-slate-300";

  const accentTextClasses = isLightTheme ? "text-[#5d44d2]" : "text-[#d9d2ff]";
  const headingClasses = isLightTheme ? "text-[#243252]" : "text-white";
  const metaTextClasses = isLightTheme ? "text-slate-500" : "text-slate-400";

  const clearQuestionState = useCallback(() => {
    setSelectedAnswer("");
    setResult(null);
    setError("");
  }, []);

  // Fetch the full question set once and keep it in component state.
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (err) {
      const { statusLabel, timeoutLabel } = getRequestFailureLabels(err);
      setError(
        `Unable to load quiz questions from ${QUESTIONS_ENDPOINT}${statusLabel}.${timeoutLabel} Make sure the API server is running.`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const totalQuestions = questions.length;
  // Quiz is complete after the user advances past the last question index.
  const isFinished = totalQuestions > 0 && currentIndex >= totalQuestions;
  const question = questions[currentIndex];

  const handleSubmit = useCallback(async () => {
    // Prevent duplicate submissions or empty answer submits.
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
    } catch (err) {
      const { statusLabel, timeoutLabel } = getRequestFailureLabels(err);
      setError(
        `Your answer could not be submitted to ${getAnswerEndpoint(question.id)}${statusLabel}.${timeoutLabel} Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [question, result, selectedAnswer]);

  const nextQuestion = useCallback(() => {
    // Reset per-question state before moving forward.
    clearQuestionState();
    setCurrentIndex((prev) => prev + 1);
  }, [clearQuestionState]);

  const restartQuiz = useCallback(() => {
    // Full reset lets the user replay without reloading the page.
    setCurrentIndex(0);
    clearQuestionState();
    setScore(0);
  }, [clearQuestionState]);

  useEffect(() => {
    if (!question || isFinished) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName;
        if (target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
          return;
        }
      }

      const pressedKey = event.key.toLowerCase();
      const optionIndex = OPTION_INDEX_BY_KEY[pressedKey];
      const isArrowNavigationKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key);

      if (!result && optionIndex !== undefined && question.options[optionIndex]) {
        event.preventDefault();
        setSelectedAnswer(question.options[optionIndex]);
        return;
      }

      if (!result && isArrowNavigationKey && question.options.length) {
        event.preventDefault();

        const currentOptionIndex = question.options.findIndex((option) => option === selectedAnswer);
        const isBackwardKey = event.key === "ArrowUp" || event.key === "ArrowLeft";
        const defaultIndex = isBackwardKey ? question.options.length - 1 : 0;
        const nextOptionIndex = currentOptionIndex === -1
          ? defaultIndex
          : isBackwardKey
            ? (currentOptionIndex - 1 + question.options.length) % question.options.length
            : (currentOptionIndex + 1) % question.options.length;

        setSelectedAnswer(question.options[nextOptionIndex]);
        return;
      }

      if (event.key === "Enter") {
        if (result) {
          event.preventDefault();
          nextQuestion();
          return;
        }

        if (selectedAnswer && !isSubmitting) {
          event.preventDefault();
          void handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmit, isFinished, isSubmitting, nextQuestion, question, result, selectedAnswer]);

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border p-5 ${neutralCardClasses}`}
      >
        <p className={`text-sm font-medium ${neutralTextClasses}`}>
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
      <div
        className={`rounded-2xl border p-5 ${
          isLightTheme
            ? "border-rose-300 bg-rose-50 text-rose-800"
            : "border-rose-400/40 bg-rose-500/10 text-rose-100"
        }`}
      >
        <p className="text-sm">{error}</p>
        <button
          onClick={() => void loadQuestions()}
          className={`mt-4 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            isLightTheme
              ? "border-rose-300 text-rose-800 hover:bg-rose-100"
              : "border-rose-200/50 hover:bg-rose-200/20"
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div
        className={`rounded-2xl border p-5 ${neutralCardClasses} ${neutralTextClasses}`}
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
        className={`mx-auto w-full max-w-180 rounded-2xl border p-4 shadow-[0_20px_40px_rgba(2,6,23,0.28),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-8 ${surfaceCardClasses}`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentTextClasses}`}
        >
          Quiz Complete
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-6">
          <div>
            <h2
              className={`text-2xl font-bold font-['Space_Grotesk'] sm:text-3xl ${headingClasses}`}
            >
              You scored {score} / {totalQuestions}
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${resultTone}`}>
              Final accuracy: {percentage}% across the full round.
            </p>
          </div>

        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Correct Answers", value: score },
            { label: "Questions Played", value: totalQuestions },
          ].map((item) => (
            <div key={item.label} className={summaryTileClasses}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${summaryMetaTextClasses}`}>
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold font-['Space_Grotesk']">{item.value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={restartQuiz}
          className="mt-6 rounded-xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          Play again
        </button>
      </div>
    );
  }

  const dividerTone = isLightTheme ? "border-[#d6e0f6]/90" : "border-[#4c5e83]/70";
  const activeQuestionNumber = currentIndex + 1;
  const submitButtonLabel = isSubmitting
    ? "Submitting..."
    : selectedAnswer
      ? "Submit Answer ->"
      : "Select an answer to continue";

  return (
    <div
      className={`flex min-h-0 w-full flex-col rounded-2xl border p-3 shadow-[0_20px_40px_rgba(2,6,23,0.28),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-5 ${surfaceCardClasses}`}
    >
      <div className="mx-auto min-h-0 flex w-full flex-1 flex-col">
        <section className={`border-b pb-3 ${dividerTone}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div
              className={`inline-flex max-w-fit items-center gap-3 rounded-2xl border px-3.5 py-3 sm:px-4 ${
                isLightTheme
                  ? "border-[#d7e1f9] bg-[#f7faff] text-[#334060]"
                  : "border-[#617192] bg-[#394866] text-slate-100"
              }`}
            >
              <div
                className={`grid h-11 w-11 place-items-center rounded-xl text-base font-black ${
                  isLightTheme
                    ? "bg-[#dff7e8] text-[#1b6c44]"
                    : "bg-[#c2f4d8] text-[#1b6c44]"
                }`}
              >
                S
              </div>
              <div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isLightTheme ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  Topic
                </p>
                <p
                  className={`text-lg font-semibold leading-none font-['Space_Grotesk'] sm:text-xl ${headingClasses}`}
                >
                  SOLID Principle
                </p>
              </div>
            </div>

            <div className="w-full sm:max-w-xs sm:text-right">
              <div className="flex items-center justify-between sm:justify-end">
                <p className={`text-sm ${metaTextClasses}`}>
                  Score: {score} / {totalQuestions}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap justify-start gap-1.5 sm:justify-end">
                {Array.from({ length: totalQuestions }).map((_, dotIndex) => {
                  const isDone = dotIndex < currentIndex;
                  const isCurrent = dotIndex === currentIndex;
                  const dotTone = isDone
                    ? "bg-[#8f46ff]"
                    : isCurrent
                      ? (isLightTheme
                          ? "bg-[#b260ff] ring-2 ring-[#d8c5ff]"
                          : "bg-[#b260ff] ring-2 ring-[#8a63da]")
                      : (isLightTheme ? "bg-[#d5def2]" : "bg-[#4e5f84]");

                  return (
                    <span
                      key={`progress-dot-${dotIndex + 1}`}
                      className={`h-2.5 w-2.5 rounded-full transition-all ${dotTone}`}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>

              <p className={`mt-1.5 text-sm font-semibold uppercase tracking-widest ${accentTextClasses}`}>
                QUESTION {activeQuestionNumber} OF {totalQuestions}
              </p>
            </div>
          </div>
        </section>

        <section key={`question-content-${question.id}`} className={`question-enter border-b py-3 ${dividerTone}`}>
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${accentTextClasses}`}
          >
            Question
          </p>
          <h2
            className={`mt-2 text-[1.15rem] font-bold leading-[1.25] sm:text-[1.4rem] lg:text-[1.5rem] font-['Space_Grotesk'] ${headingClasses}`}
          >
            {question.prompt}
          </h2>
          <p className={`mt-3 text-sm leading-relaxed ${metaTextClasses}`}>
            Choose the best answer.
          </p>
          <p className={`mt-2 hidden text-sm sm:block ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
            Keyboard: Press A-D or use arrow keys to choose. Press Enter to submit or continue.
          </p>
        </section>

        <section key={question.id} className="mx-auto w-full max-w-176 space-y-3 pt-3">
          {question.options.map((opt, index) => {
            const isSelected = selectedAnswer === opt;
            const isSelectedResult = result && isSelected;
            const isCorrectAnswer = result && opt === result.correct_answer;
            const emeraldTone = isLightTheme
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-emerald-300/70 bg-emerald-400/15 text-emerald-100";
            const optionTone = isSelectedResult
              ? result.correct
                ? emeraldTone
                : (isLightTheme
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : "border-rose-300/70 bg-rose-400/15 text-rose-100")
              : isCorrectAnswer
                ? emeraldTone
              : isSelected
                ? (isLightTheme
                    ? "border-[#7c5cff] bg-[rgba(124,92,255,0.12)] text-[#2d1d63] shadow-[0_0_0_2px_rgba(124,92,255,0.35)]"
                    : "border-[#a78bfa] bg-[rgba(124,92,255,0.2)] text-white shadow-[0_0_0_2px_rgba(124,92,255,0.4)]")
                : (isLightTheme
                    ? "border-[#c2d2ef] bg-[#ecf2ff] text-[#34425f]"
                    : "border-white/10 bg-white/[0.02] text-slate-100");
            const optionBadgeTone = isSelected && !result
              ? (isLightTheme
                  ? "border-[#7c5cff] bg-[#7c5cff] text-white"
                  : "border-[#c4b5fd] bg-[#7c5cff] text-white")
              : isCorrectAnswer
                ? "border-emerald-400 bg-emerald-400 text-white"
                : result && isSelected && !result.correct
                  ? "border-rose-400 bg-rose-400 text-white"
                  : (isLightTheme
                      ? "border-[#b8c7e8] bg-white text-[#4a5672]"
                      : "border-current/40 bg-white/85 text-[#4a5672]");

            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(result)}
                onClick={() => setSelectedAnswer(opt)}
                aria-keyshortcuts={String.fromCharCode(65 + index)}
                style={{ animationDelay: `${index * 75}ms` }}
                className={`option-enter relative flex w-full transform-gpu items-center gap-3 overflow-hidden rounded-2xl border px-4.5 py-3 text-left text-sm font-medium transition-all duration-120 ease-out sm:gap-4 sm:px-5 ${optionTone} ${
                  result
                    ? "cursor-default"
                    : isLightTheme
                      ? "hover:-translate-y-px hover:border-[#7c5cff]/45 hover:bg-[#f3eeff]"
                      : "hover:-translate-y-px hover:border-white/15 hover:bg-white/5"
                } ${isSelected && !result ? "scale-[1.02]" : ""}`}
              >
                {isSelected && !result && (
                  <span className={`absolute inset-y-3 left-2 w-1 rounded-full ${isLightTheme ? "bg-[#7c5cff]" : "bg-[#a78bfa]"}`} />
                )}
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors duration-200 ${optionBadgeTone}`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-base leading-snug">{opt}</span>
                {isSelected && !result && (
                  <span className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    isLightTheme
                      ? "border-[#7c5cff] bg-[#7c5cff] text-white"
                      : "border-[#c4b5fd] bg-[#7c5cff] text-white"
                  }`}>
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </span>
                )}
                {result && opt === result.correct_answer && (
                  <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-emerald-400 text-emerald-400 sm:h-6 sm:w-6">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </span>
                )}
                {result && isSelected && !result.correct && (
                  <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-rose-400 text-rose-400 sm:h-6 sm:w-6">
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
              aria-keyshortcuts="Enter"
              className="mt-5 w-full rounded-2xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-base"
            >
              {submitButtonLabel}
            </button>
          ) : (
            <div
              className={`mt-3 rounded-xl border px-3 py-3 text-sm sm:mt-4 sm:rounded-2xl sm:px-4 ${
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
                className={`mt-3 rounded-lg border border-current/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition sm:text-xs ${
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
