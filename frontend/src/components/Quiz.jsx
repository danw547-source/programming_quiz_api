/**
 * Quiz.jsx — main quiz component.
 *
 * Manages the full quiz lifecycle in a single component:
 *   • Fetching question sets and questions from the API.
 *   • Presenting one question at a time with keyboard and click navigation.
 *   • Submitting answers and displaying correctness feedback.
 *   • Tracking incorrect answers so the user can retry missed questions.
 *   • Showing a cheat sheet entry for the current question on demand.
 *
 * State is kept here rather than a global store because this is the only
 * place that cares about it, and the component unmounts cleanly when the
 * user navigates away.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCheatSheet,
  getQuestionSets,
  getQuestions,
  submitAnswer,
  getAiQuestionSets,
  getAiQuestions,
  getAiCheatSheet,
  submitAiAnswer,
  getAiHint,
} from "../services/quizService";

const OPTION_INDEX_BY_KEY = Object.freeze({ a: 0, b: 1, c: 2, d: 3 });

function shuffleArray(array) {
  // Fisher-Yates (Durstenfeld) in-place shuffle — O(n), unbiased.
  // A new array is returned so the original `allQuestions` order is preserved
  // for retry rounds that need to look up questions by ID.
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const QUESTION_SET_DISPLAY_METADATA = Object.freeze({
  solid: { label: "SOLID", badge: "S", category: "programming" },
  "solid principles": { label: "SOLID", badge: "S", category: "programming" },
  "mvc model view controller beginner": { label: "MVC Beginner", badge: "MVC", category: "programming" },
  "mvc model view controller intermediate": { label: "MVC Intermediate", badge: "MVC", category: "programming" },
  "mvc model view controller expert": { label: "MVC Expert", badge: "MVC", category: "programming" },
  "python beginner": { label: "Python Beginner", badge: "PY", category: "programming" },
  "python intermediate": { label: "Python Intermediate", badge: "PY", category: "programming" },
  "python expert": { label: "Python Expert", badge: "PY", category: "programming" },
  "restful api": { label: "REST API", badge: "API", category: "programming" },
  "sql beginner": { label: "SQL Beginner", badge: "SQL", category: "programming" },
  "sql intermediate": { label: "SQL Intermediate", badge: "SQL", category: "programming" },
  "sql expert": { label: "SQL Expert", badge: "SQL", category: "programming" },
  "music theory beginner": { label: "Music Theory Beginner", badge: "MT", category: "music-theory" },
  "music theory intermediate": { label: "Music Theory Intermediate", badge: "MT", category: "music-theory" },
  "music theory expert": { label: "Music Theory Expert", badge: "MT", category: "music-theory" },
  "ear training fundamentals beginner": { label: "Ear Training Beginner", badge: "ET", category: "music-theory" },
  "rhythm and meter mastery beginner": { label: "Rhythm and Meter", badge: "RM", category: "music-theory" },
  "functional harmony foundations intermediate": { label: "Functional Harmony", badge: "FH", category: "music-theory" },
  "melody and phrase construction intermediate": { label: "Melody and Phrase", badge: "MP", category: "music-theory" },
  "sight reading and notation fluency intermediate": { label: "Sight Reading", badge: "SR", category: "music-theory" },
  "circle of fifths and modulation intermediate": { label: "Circle and Modulation", badge: "CM", category: "music-theory" },
  "counterpoint and voice leading advanced": { label: "Counterpoint and Voice Leading", badge: "CV", category: "music-theory" },
  "form and analysis advanced": { label: "Form and Analysis", badge: "FA", category: "music-theory" },
  "jazz harmony and improvisation language advanced": { label: "Jazz Harmony and Improvisation", badge: "JZ", category: "music-theory" },
  "guitar comping and rhythm styles advanced": { label: "Guitar Comping and Rhythm", badge: "GC", category: "music-theory" },
  "scales beginner": { label: "Scales Beginner", badge: "SC", category: "music-theory" },
  "scales intermediate": { label: "Scales Intermediate", badge: "SC", category: "music-theory" },
  "scales expert": { label: "Scales Expert", badge: "SC", category: "music-theory" },
  "keyboard music theory beginner": { label: "Keyboard Theory Beginner", badge: "KB", category: "music-theory" },
  "gear4music": { label: "Gear4Music", badge: "G4M", category: "programming" },
  "g4m project workflow": { label: "G4M Project Workflow", badge: "G4M", category: "programming" },
  "aiquiz": { label: "AI Quiz", badge: "AI", category: "ai" },
  "keyboard music theory intermediate": { label: "Keyboard Theory Intermediate", badge: "KB", category: "music-theory" },
  "keyboard music theory expert": { label: "Keyboard Theory Expert", badge: "KB", category: "music-theory" },
  "guitar based music theory beginner": { label: "Guitar Theory Beginner", badge: "GT", category: "music-theory" },
  "guitar based music theory intermediate": { label: "Guitar Theory Intermediate", badge: "GT", category: "music-theory" },
  "guitar based music theory expert": { label: "Guitar Theory Expert", badge: "GT", category: "music-theory" },
  "finance general": { label: "Finance", badge: "FIN", category: "charlotte" },
  "home cooking general": { label: "Home Cooking", badge: "HC", category: "charlotte" },
  "equinology general": { label: "Equinology", badge: "EQ", category: "charlotte" },
  "windows os": { label: "Windows OS", badge: "WIN", category: "tech-support" },
  "software and productivity": { label: "Software & Productivity", badge: "M365", category: "tech-support" },
  "hardware": { label: "Hardware", badge: "HW", category: "tech-support" },
  "networking": { label: "Networking", badge: "NET", category: "tech-support" },
  "office 365": { label: "Office 365", badge: "O365", category: "tech-support" },
  "google workspace": { label: "Google Workspace", badge: "GWS", category: "tech-support" },
  "fitness instructing level 1": { label: "Fitness Level 1", badge: "F1", category: "fitness" },
  "fitness instructing level 2": { label: "Fitness Level 2", badge: "F2", category: "fitness" },
  "fitness instructing level 3": { label: "Fitness Level 3", badge: "F3", category: "fitness" },
  "music theory grade 1": { label: "Music Theory Grade 1", badge: "G1", category: "music-theory" },
  "music theory grade 2": { label: "Music Theory Grade 2", badge: "G2", category: "music-theory" },
  "music theory grade 3": { label: "Music Theory Grade 3", badge: "G3", category: "music-theory" },
  "music theory grade 4": { label: "Music Theory Grade 4", badge: "G4", category: "music-theory" },
  "music theory grade 5": { label: "Music Theory Grade 5", badge: "G5", category: "music-theory" },
  "music theory grade 6": { label: "Music Theory Grade 6", badge: "G6", category: "music-theory" },
  "music theory grade 7": { label: "Music Theory Grade 7", badge: "G7", category: "music-theory" },
  "music theory grade 8": { label: "Music Theory Grade 8", badge: "G8", category: "music-theory" },
});

const formatQuestionSetLabel = (questionSet) => {
  if (!questionSet) {
    return "General";
  }

  return questionSet
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
};

const getQuestionSetDisplay = (questionSet) => {
  const normalized = questionSet?.trim().toLowerCase() ?? "";
  const mapped = QUESTION_SET_DISPLAY_METADATA[normalized];

  if (mapped) {
    return mapped;
  }

  // Fallback for question sets added to the database that don't yet have a
  // display entry: title-case the set name and derive a badge from initials.
  const fallbackLabel = formatQuestionSetLabel(questionSet);
  return {
    label: fallbackLabel,
    badge: fallbackLabel
      .split(" ")
      .filter(Boolean)
      .map((token) => token[0])
      .join("")
      .slice(0, 3)
      .toUpperCase(),
  };
};

const getQuestionSetCategory = (questionSet) => {
  const normalized = questionSet?.trim().toLowerCase() ?? "";
  // Default to "programming" so new sets without metadata are grouped with
  // the existing programming sets rather than disappearing from the UI.
  return QUESTION_SET_DISPLAY_METADATA[normalized]?.category ?? "programming";
};

const getQuestionSetsForCategory = (questionSets, selectedCategory) => questionSets.filter(
  (questionSet) => getQuestionSetCategory(questionSet) === selectedCategory,
);

const getCategoryLabel = (category) => {
  if (category === "music-theory") {
    return "Music Theory";
  }

  if (category === "charlotte") {
    return "Charlotte";
  }

  if (category === "tech-support") {
    return "Tech Support";
  }

  if (category === "fitness") {
    return "Fitness";
  }

  if (category === "aiquiz" || category === "ai") {
    return "AI";
  }

  return "Programming";
};

const getAlternateCategory = (selectedCategory) => {
  if (selectedCategory === "music-theory") {
    return "charlotte";
  }

  if (selectedCategory === "charlotte") {
    return "tech-support";
  }

  if (selectedCategory === "tech-support") {
    return "fitness";
  }

  if (selectedCategory === "fitness") {
    return "programming";
  }

  return "music-theory";
};

const getPerformanceFeedback = (percentage) => {
  if (percentage === 100) {
    return {
      label: "Perfect",
      detail: "Outstanding round. You nailed every question.",
    };
  }

  if (percentage >= 85) {
    return {
      label: "Excellent",
      detail: "Strong understanding across this set.",
    };
  }

  if (percentage >= 70) {
    return {
      label: "Good try",
      detail: "Solid work. A quick review will sharpen the gaps.",
    };
  }

  if (percentage >= 50) {
    return {
      label: "Keep practicing",
      detail: "You are building momentum. Review missed concepts and run it again.",
    };
  }

  return {
    label: "Needs work",
    detail: "Brush up a little and then take another pass.",
  };
};



export default function Quiz({ isLightTheme, selectedCategory = "programming", onCategoryChange, mode = "standard" }) {
  const isAiMode = mode === "ai";
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState("");
  const [isQuestionSetPickerOpen, setIsQuestionSetPickerOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isCheatSheetLoading, setIsCheatSheetLoading] = useState(false);
  const [cheatSheetEntries, setCheatSheetEntries] = useState([]);
  const [cheatSheetQuestionSet, setCheatSheetQuestionSet] = useState("");
  const [cheatSheetError, setCheatSheetError] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintError, setHintError] = useState("");
  const [hintText, setHintText] = useState("");
  const [isRetryRound, setIsRetryRound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const aiAnswerInputRef = useRef(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);
  const selectedCategoryLabel = getCategoryLabel(selectedCategory);
  const alternateCategory = getAlternateCategory(selectedCategory);
  const alternateCategoryLabel = getCategoryLabel(alternateCategory);
  const categoryQuestionSets = getQuestionSetsForCategory(questionSets, selectedCategory);
  const alternateCategorySets = getQuestionSetsForCategory(questionSets, alternateCategory);

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
    setHintError("");
    setHintText("");
  }, []);

  const resetRoundState = useCallback(() => {
    setCurrentIndex(0);
    clearQuestionState();
    setScore(0);
    setIncorrectAnswers([]);
  }, [clearQuestionState]);

  const loadQuestions = useCallback(async (questionSet) => {
    setIsLoading(true);
    setError("");

    try {
      const data = isAiMode ? await getAiQuestions(questionSet) : await getQuestions(questionSet);
      setAllQuestions(data);
      setQuestions(shuffleArray(data));
      setIsRetryRound(false);
    } catch (err) {
      setError(`Unable to load questions. ${err?.message ?? "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  }, [isAiMode]);

  const loadQuestionSets = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      if (isAiMode) {
        const sets = await getAiQuestionSets();
        setQuestionSets(sets);

        const currentSet = selectedQuestionSet && sets.includes(selectedQuestionSet)
          ? selectedQuestionSet
          : undefined;
        const categorySets = isAiMode ? sets : getQuestionSetsForCategory(sets, selectedCategory);
        const initialSet = currentSet || categorySets[0] || sets[0] || "";

        setSelectedQuestionSet(initialSet);

        const data = initialSet ? await getAiQuestions(initialSet) : [];
        setAllQuestions(data);
        setQuestions(shuffleArray(data));
        setIsRetryRound(false);
        return;
      }

      // Fetch question sets and all questions in parallel to reduce total request time.
      // getQuestionSets completes quickly; getQuestions may take longer.
      // By starting both immediately, we overlap the latency instead of sequencing them.
      const [sets, allQuestionData] = await Promise.all([
        getQuestionSets(),
        getQuestions(undefined), // Fetch all questions upfront
      ]);

      setQuestionSets(sets);

      const filteredSets = getQuestionSetsForCategory(sets, selectedCategory);
      const initialSet = filteredSets[0] ?? sets[0] ?? "";
      setSelectedQuestionSet(initialSet);

      // Filter the already-fetched questions to the selected set
      const data = initialSet
        ? allQuestionData.filter((q) => q.question_set === initialSet)
        : allQuestionData;

      setAllQuestions(data);
      setQuestions(shuffleArray(data));
      setIsRetryRound(false);
    } catch (err) {
      setError(`Unable to load question sets. ${err?.message ?? "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  }, [isAiMode, selectedCategory]);

  useEffect(() => {
    void loadQuestionSets();
  }, [loadQuestionSets]);

  useEffect(() => {
if (!questionSets.length) {
      return;
    }

    const filteredSets = getQuestionSetsForCategory(questionSets, selectedCategory);
    const nextSet = filteredSets[0] ?? "";

    // If the active category has no sets, clear all quiz state and bail early
    // so the "no sets" empty state is rendered.
    if (!filteredSets.length) {
      setIsQuestionSetPickerOpen(false);
      setIsCheatSheetOpen(false);
      setCheatSheetEntries([]);
      setCheatSheetQuestionSet("");
      setCheatSheetError("");
      setSelectedQuestionSet("");
      setAllQuestions([]);
      setQuestions([]);
      setIsRetryRound(false);
      resetRoundState();
      return;
    }

    // If the currently selected set already belongs to the new category, do
    // nothing — the user switched categories and then switched back.
    if (filteredSets.includes(selectedQuestionSet)) {
      return;
    }

    setIsQuestionSetPickerOpen(false);
    setIsCheatSheetOpen(false);
    setCheatSheetEntries([]);
    setCheatSheetQuestionSet("");
    setCheatSheetError("");
    setSelectedQuestionSet(nextSet);
    resetRoundState();
    void loadQuestions(nextSet || undefined);
  }, [loadQuestions, questionSets, resetRoundState, selectedCategory, selectedQuestionSet]);

  const totalQuestions = questions.length;
  // Quiz is complete after the user advances past the last question index.
  const isFinished = totalQuestions > 0 && currentIndex >= totalQuestions;
  const question = questions[currentIndex];

  useEffect(() => {
    if (!isAiMode || !aiAnswerInputRef.current) {
      return;
    }

    aiAnswerInputRef.current.focus();
  }, [isAiMode, question]);

  const handleSubmit = useCallback(async () => {
    // Prevent duplicate submissions or empty answer submits.
    if (!question || !selectedAnswer || result) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = isAiMode
        ? await submitAiAnswer(question.id, selectedAnswer)
        : await submitAnswer(question.id, selectedAnswer);
      setResult(response);

      setIncorrectAnswers((previousAnswers) => {
        if (response.correct || previousAnswers.some((answer) => answer.id === question.id)) {
          return previousAnswers;
        }

        return [
          ...previousAnswers,
          {
            id: question.id,
            prompt: question.prompt,
            selectedAnswer,
            correctAnswer: response.correct_answer,
            explanation: response.explanation,
          },
        ];
      });

      if (response.correct) {
        setScore((prev) => prev + 1);
      }
    } catch (err) {
      setError(`Unable to submit answer. ${err?.message ?? "Please try again."}`);
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
    if (isRetryRound) {
      // In retry mode "play again" means going back to the full set so the
      // user doesn't stay locked in the retry subset indefinitely.
      setQuestions(shuffleArray(allQuestions));
      setIsRetryRound(false);
    } else {
      // Reshuffle so replaying the same set presents questions in a new order.
      setQuestions((prev) => shuffleArray(prev));
    }

    resetRoundState();
  }, [allQuestions, isRetryRound, resetRoundState]);

  const startRetryRound = useCallback(() => {
    // Build the retry question list by looking up full question objects (which
    // include options) by the IDs stored in incorrectAnswers.  Looking up from
    // allQuestions preserves the original question data rather than
    // reconstructing it from the incomplete incorrectAnswers shape.
    const questionById = new Map(allQuestions.map((item) => [item.id, item]));
    const retryQuestions = incorrectAnswers
      .map((item) => questionById.get(item.id))
      .filter(Boolean);

    if (!retryQuestions.length) {
      return;
    }

    setQuestions(shuffleArray(retryQuestions));
    setIsRetryRound(true);
    resetRoundState();
  }, [allQuestions, incorrectAnswers, resetRoundState]);

  const openQuestionSetPicker = useCallback(() => {
    setIsCheatSheetOpen(false);
    setCheatSheetError("");
    setIsQuestionSetPickerOpen(true);
  }, []);

  const closeQuestionSetPicker = useCallback(() => {
    setIsQuestionSetPickerOpen(false);
  }, []);

  const closeCheatSheet = useCallback(() => {
    setIsCheatSheetOpen(false);
    setCheatSheetError("");
  }, []);

  const openCheatSheet = useCallback(async () => {
    if (!selectedQuestionSet) {
      return;
    }

    // Capture the set name before any async gaps so a concurrent set change
    // during the fetch doesn't cause the wrong entries to be displayed.
    const selectedSet = selectedQuestionSet;

    setIsQuestionSetPickerOpen(false);
    setIsCheatSheetOpen(true);
    setIsCheatSheetLoading(true);
    setCheatSheetError("");

    try {
      const response = isAiMode
        ? await getAiCheatSheet(selectedSet)
        : await getCheatSheet(selectedSet);
      const entryById = new Map(response.entries.map((entry) => [entry.id, entry]));
      const currentQuestion = questions[currentIndex];
      const currentEntry = currentQuestion ? entryById.get(currentQuestion.id) : undefined;

      // Show only the entry for the current question rather than the whole set,
      // so the cheat sheet doesn't spoil upcoming questions.
      setCheatSheetQuestionSet(response.question_set);
      setCheatSheetEntries(currentEntry ? [currentEntry] : []);
    } catch (err) {
      setCheatSheetEntries([]);
      setCheatSheetError(`Unable to load cheat sheet. ${err?.message ?? "Please try again."}`);
    } finally {
      setIsCheatSheetLoading(false);
    }
  }, [currentIndex, questions, selectedQuestionSet]);

  const getHint = useCallback(async () => {
    if (!question || result) {
      return;
    }

    setHintError("");
    setIsHintLoading(true);

    try {
      const hintResponse = await getAiHint(question.id);
      const hint = hintResponse.partial_answer;
      
      // Set the hint as placeholder text in the answer input
      setHintText(hint);
      
      // Automatically focus the input so user can immediately start typing
      if (aiAnswerInputRef.current) {
        aiAnswerInputRef.current.focus();
      }
    } catch (err) {
      setHintError(`Unable to load hint. ${err?.message ?? "Please try again."}`);
    } finally {
      setIsHintLoading(false);
    }
  }, [question, result]);

  const handleQuestionSetChange = useCallback(async (nextSet) => {
    if (nextSet === selectedQuestionSet) {
      return;
    }

    setIsCheatSheetOpen(false);
    setCheatSheetEntries([]);
    setCheatSheetQuestionSet("");
    setCheatSheetError("");
    setSelectedQuestionSet(nextSet);
    resetRoundState();
    await loadQuestions(nextSet || undefined);
  }, [loadQuestions, resetRoundState, selectedQuestionSet]);

  const handleQuestionSetPick = useCallback((nextSet) => {
    closeQuestionSetPicker();
    void handleQuestionSetChange(nextSet);
  }, [closeQuestionSetPicker, handleQuestionSetChange]);

  useEffect(() => {
    if (!isQuestionSetPickerOpen && !isCheatSheetOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();

      if (isCheatSheetOpen) {
        closeCheatSheet();
        return;
      }

      closeQuestionSetPicker();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeCheatSheet, closeQuestionSetPicker, isCheatSheetOpen, isQuestionSetPickerOpen]);

  useEffect(() => {
    if (!question || isFinished) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      // Don't hijack shortcuts while a dialog is open — those have their own
      // Escape handler registered by the dialog effect above.
      if (isQuestionSetPickerOpen || isCheatSheetOpen) {
        return;
      }

      // Ignore modified keys (browser shortcuts) and events already consumed.
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tagName = target.tagName;
        // Don't intercept keystrokes when focus is inside an editable element.
        if (target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
          return;
        }
      }

      const pressedKey = event.key.toLowerCase();
      const optionIndex = OPTION_INDEX_BY_KEY[pressedKey];
      const isArrowNavigationKey = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key);

      // A–D selects the matching option by index.
      if (!result && optionIndex !== undefined && question.options[optionIndex]) {
        event.preventDefault();
        setSelectedAnswer(question.options[optionIndex]);
        return;
      }

      // Arrow keys cycle through options; wraps around at both ends.
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
  }, [handleSubmit, isCheatSheetOpen, isFinished, isQuestionSetPickerOpen, isSubmitting, nextQuestion, question, result, selectedAnswer]);

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
          onClick={() => void (categoryQuestionSets.length && selectedQuestionSet ? loadQuestions(selectedQuestionSet || undefined) : loadQuestionSets())}
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
    const hasAlternativeCategory = !isAiMode && alternateCategorySets.length > 0;

    return (
      <div
        className={`rounded-2xl border p-5 ${neutralCardClasses} ${neutralTextClasses}`}
      >
        <p className="text-base font-semibold">No {isAiMode ? "AI quiz" : selectedCategoryLabel} sets are available right now.</p>

        {hasAlternativeCategory && typeof onCategoryChange === "function" ? (
          <>
            <p className={`mt-2 text-sm ${metaTextClasses}`}>
              {alternateCategoryLabel} currently has {alternateCategorySets.length} available set{alternateCategorySets.length === 1 ? "" : "s"}.
            </p>
            <button
              type="button"
              onClick={() => onCategoryChange(alternateCategory)}
              className="mt-4 rounded-xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Switch to {alternateCategoryLabel}
            </button>
          </>
        ) : (
          <p className={`mt-2 text-sm ${metaTextClasses}`}>
            Check back soon for more question sets in this category.
          </p>
        )}
      </div>
    );
  }

  const activeQuestionSetDisplay = getQuestionSetDisplay(selectedQuestionSet);
  const activeQuestionSetLabel = activeQuestionSetDisplay.label;
  const activeQuestionSetBadge = activeQuestionSetDisplay.badge;
  const cheatSheetSetDisplay = getQuestionSetDisplay(cheatSheetQuestionSet || selectedQuestionSet);

  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const wrongCount = incorrectAnswers.length;
    const performance = getPerformanceFeedback(percentage);
    const restartButtonLabel = isRetryRound ? "Play full set again" : "Play again";
    const resultTone = percentage >= 85
      ? (isLightTheme ? "text-emerald-700" : "text-emerald-200")
      : percentage >= 70
        ? (isLightTheme ? "text-violet-700" : "text-violet-200")
        : percentage >= 50
          ? (isLightTheme ? "text-amber-700" : "text-amber-200")
          : (isLightTheme ? "text-rose-700" : "text-rose-200");
    const reviewHintClasses = isLightTheme ? "text-slate-600" : "text-slate-200";

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
            <p className={`mt-2 text-base font-semibold uppercase tracking-[0.14em] ${resultTone}`}>
              {performance.label}
            </p>
            <p className={`mt-2 text-sm leading-relaxed ${resultTone}`}>
              Final accuracy: {percentage}% across the full round.
            </p>
            <p className={`mt-1 text-sm leading-relaxed ${reviewHintClasses}`}>
              {performance.detail}
            </p>
          </div>

        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Correct Answers", value: score },
            { label: "Questions Played", value: totalQuestions },
            { label: "Needs Review", value: wrongCount },
            { label: "Question Set", value: activeQuestionSetLabel },
          ].map((item) => (
            <div key={item.label} className={summaryTileClasses}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${summaryMetaTextClasses}`}>
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold font-['Space_Grotesk']">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-140 flex-wrap items-center justify-center gap-3">
          {!isRetryRound && wrongCount > 0 && (
            <button
              onClick={startRetryRound}
              className={`w-full rounded-xl border px-5 py-3 text-sm font-semibold transition sm:w-58 ${
                isLightTheme
                  ? "border-[#bca8ff] bg-[#efe8ff] text-[#4f3a9e] hover:bg-[#e5dbff]"
                  : "border-[#8f73df] bg-[#6e53bc]/30 text-[#e5dcff] hover:bg-[#7a5ccf]/35"
              }`}
            >
              Retry missed questions
            </button>
          )}

          <button
            onClick={restartQuiz}
            className="w-full rounded-xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 sm:w-58"
          >
            {restartButtonLabel}
          </button>
        </div>
      </div>
    );
  }

  const dividerTone = isLightTheme ? "border-[#d6e0f6]/90" : "border-[#4c5e83]/70";
  const activeQuestionNumber = currentIndex + 1;
  const submitButtonLabel = isSubmitting
    ? "Submitting..."
    : selectedAnswer
      ? "Submit Answer ->"
      : isAiMode
        ? "Type an answer to continue"
        : "Select an answer to continue";

  return (
    <div
      className={`flex min-h-0 w-full flex-col rounded-2xl border p-2 shadow-[0_20px_40px_rgba(2,6,23,0.28),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-4 ${surfaceCardClasses}`}
    >
      <div className="mx-auto min-h-0 flex w-full flex-1 flex-col">
        <section className={`border-b pb-1 sm:pb-2.5 ${dividerTone}`}>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
            <div
              className={`flex w-full max-w-120 items-center gap-1.5 rounded-2xl border px-2 py-1 sm:gap-2.5 sm:px-3.5 sm:py-2.5 ${
                isLightTheme
                  ? "border-[#d7e1f9] bg-[#f7faff] text-[#334060]"
                  : "border-[#617192] bg-[#394866] text-slate-100"
              }`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg sm:h-10 sm:w-10 text-[10px] font-black tracking-[0.06em] ${
                  isLightTheme
                    ? "bg-[#dff7e8] text-[#1b6c44]"
                    : "bg-[#c2f4d8] text-[#1b6c44]"
                }`}
              >
                {activeQuestionSetBadge || "GEN"}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    isLightTheme ? "text-slate-500" : "text-slate-300"
                  }`}
                >
                  Topic
                </p>
                <p
                  className={`mt-0.5 truncate text-sm font-semibold leading-none font-['Space_Grotesk'] sm:text-lg ${headingClasses}`}
                >
                  {activeQuestionSetLabel}
                </p>
                <div className="mt-1 sm:mt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={openQuestionSetPicker}
                      disabled={!categoryQuestionSets.length || isLoading || isSubmitting}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                        isLightTheme
                          ? "border-[#bfd0f4] bg-white text-[#334060] hover:bg-[#edf3ff]"
                          : "border-[#7586aa] bg-[#334261] text-slate-100 hover:bg-[#3a4a6d]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                      aria-haspopup="dialog"
                      aria-expanded={isQuestionSetPickerOpen}
                    >
                      Change Set
                      <span aria-hidden="true" className="text-[10px]">▾</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void openCheatSheet();
                      }}
                      disabled={!selectedQuestionSet || isLoading || isSubmitting}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                        isLightTheme
                          ? "border-[#d8b8ff] bg-[#f7efff] text-[#5c2f94] hover:bg-[#f0e3ff]"
                          : "border-[#9e7cde] bg-[#6f53c0]/25 text-[#eadfff] hover:bg-[#7a5dd0]/30"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                      aria-haspopup="dialog"
                      aria-expanded={isCheatSheetOpen}
                    >
                      Cheat Sheet
                    </button>

                    {isAiMode && (
                      <button
                        type="button"
                        onClick={() => {
                          void getHint();
                        }}
                        disabled={!question || Boolean(result) || isHintLoading || isSubmitting}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                          isLightTheme
                            ? "border-[#b8d4ff] bg-[#eef5ff] text-[#2d5aa3] hover:bg-[#e5edff]"
                            : "border-[#7b9dd9] bg-[#4a6fa1]/25 text-[#c5e0ff] hover:bg-[#5577b8]/30"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isHintLoading ? "Loading..." : "Hint"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full sm:max-w-xs sm:text-right">
              <div className="flex items-center justify-between sm:justify-end">
                <p className={`text-sm ${metaTextClasses}`}>
                  Score: {score} / {totalQuestions}
                </p>
                {/* Compact Q counter shown only on mobile in place of the dot row */}
                <p className={`text-xs font-semibold uppercase tracking-widest sm:hidden ${accentTextClasses}`}>
                  Q {activeQuestionNumber}/{totalQuestions}
                </p>
              </div>

              <div className="hidden sm:mt-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-1.5">
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

              <p className={`mt-1.5 hidden text-sm font-semibold uppercase tracking-widest sm:block ${accentTextClasses}`}>
                QUESTION {activeQuestionNumber} OF {totalQuestions}
              </p>
            </div>
          </div>
        </section>

        <section key={`question-content-${question.id}`} className={`question-enter border-b py-1 sm:py-2.5 ${dividerTone}`}>
          <h2
            className={`mt-0.5 text-[1.1rem] font-bold leading-tight sm:mt-1.5 sm:text-[1.35rem] lg:text-[1.5rem] font-['Space_Grotesk'] ${headingClasses}`}
          >
            {question.prompt}
          </h2>
          {!isAiMode && (
            <p className={`mt-1 hidden text-xs sm:block sm:text-sm ${isLightTheme ? "text-slate-400" : "text-slate-500"}`}>
              Keyboard: Press A-D or use arrow keys to choose. Press Enter to submit or continue.
            </p>
          )}
        </section>

        <section key={question.id} className="mx-auto w-full max-w-176 space-y-1.5 pt-1 sm:space-y-3 sm:pt-2.5">
          {isAiMode ? (
            <div>
              <label className="sr-only" htmlFor="ai-user-answer">
                Type your answer
              </label>
              <input
                ref={aiAnswerInputRef}
                id="ai-user-answer"
                type="text"
                autoComplete="off"
                autoCapitalize="off"
                value={selectedAnswer}
                onChange={(event) => setSelectedAnswer(event.target.value)}
                disabled={Boolean(result)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && selectedAnswer && !isSubmitting && !result) {
                    void handleSubmit();
                  }
                }}
                placeholder={hintText || "Type your answer here"}
                className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#8f46ff]"
              />
              <p className="mt-2 text-xs text-slate-400">
                AI evaluation allows flexible, real-language answers.
              </p>
            </div>
          ) : question.options.map((opt, index) => {
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
              className="mt-2 w-full rounded-2xl bg-linear-to-r from-[#8f46ff] to-[#b260ff] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-4 sm:py-3.5 sm:text-base"
            >
              {submitButtonLabel}
            </button>
          ) : (
            <div
              className={`mt-2 rounded-xl border px-3 py-2.5 text-sm sm:mt-3 sm:rounded-2xl sm:px-4 sm:py-3 ${
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

      {isQuestionSetPickerOpen && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4"
          onClick={closeQuestionSetPicker}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-set-picker-title"
            className={`w-full max-w-lg rounded-2xl border shadow-[0_20px_50px_rgba(2,6,23,0.35)] ${
              isLightTheme
                ? "border-[#c9d7f4] bg-[#f7faff] text-[#334060]"
                : "border-[#617192] bg-[#2f3b59] text-slate-100"
            }`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={`flex items-center justify-between border-b px-4 py-3 ${dividerTone}`}>
              <p id="question-set-picker-title" className="text-sm font-semibold uppercase tracking-[0.12em]">
                Choose Question Set
              </p>
              <button
                type="button"
                onClick={closeQuestionSetPicker}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  isLightTheme
                    ? "border-[#bfd0f4] hover:bg-[#edf3ff]"
                    : "border-[#7586aa] hover:bg-[#3a4a6d]"
                }`}
              >
                Close
              </button>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto p-4">
              {categoryQuestionSets.map((setName) => {
                const setDisplay = getQuestionSetDisplay(setName);
                const isActiveSet = setName === selectedQuestionSet;

                return (
                  <button
                    key={setName}
                    type="button"
                    onClick={() => {
                      handleQuestionSetPick(setName);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                      isActiveSet
                        ? (isLightTheme
                            ? "border-[#8f46ff] bg-[#f2eaff] text-[#3a2a72]"
                            : "border-[#b260ff] bg-[#7b52cb]/25 text-[#eadfff]")
                        : (isLightTheme
                            ? "border-[#c7d6f3] bg-white hover:bg-[#edf3ff]"
                            : "border-[#607297] bg-[#3a496a] hover:bg-[#44557a]")
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-black tracking-[0.08em] ${
                        isLightTheme
                          ? "bg-[#dff7e8] text-[#1b6c44]"
                          : "bg-[#c2f4d8] text-[#1b6c44]"
                      }`}
                    >
                      {setDisplay.badge || "GEN"}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{setDisplay.label}</span>
                    {isActiveSet && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isCheatSheetOpen && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-slate-950/45 p-4"
          onClick={closeCheatSheet}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cheat-sheet-dialog-title"
            className={`w-full max-w-3xl rounded-2xl border shadow-[0_20px_50px_rgba(2,6,23,0.35)] ${
              isLightTheme
                ? "border-[#c9d7f4] bg-[#f7faff] text-[#334060]"
                : "border-[#617192] bg-[#2f3b59] text-slate-100"
            }`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={`flex items-center justify-between border-b px-4 py-3 ${dividerTone}`}>
              <div>
                <p id="cheat-sheet-dialog-title" className="text-sm font-semibold uppercase tracking-[0.12em]">
                  {cheatSheetSetDisplay.label} Cheat Sheet
                </p>
                <p className={`mt-1 text-xs ${metaTextClasses}`}>
                  Answer and explanation for question {currentIndex + 1} of {questions.length}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCheatSheet}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                  isLightTheme
                    ? "border-[#bfd0f4] hover:bg-[#edf3ff]"
                    : "border-[#7586aa] hover:bg-[#3a4a6d]"
                }`}
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
              {isCheatSheetLoading ? (
                <div className={`rounded-xl border p-4 text-sm ${neutralCardClasses} ${neutralTextClasses}`}>
                  Loading cheat sheet...
                </div>
              ) : cheatSheetError ? (
                <div
                  className={`rounded-xl border p-4 text-sm ${
                    isLightTheme
                      ? "border-rose-300 bg-rose-50 text-rose-800"
                      : "border-rose-400/40 bg-rose-500/10 text-rose-100"
                  }`}
                >
                  <p>{cheatSheetError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void openCheatSheet();
                    }}
                    className={`mt-3 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                      isLightTheme
                        ? "border-rose-300 text-rose-800 hover:bg-rose-100"
                        : "border-rose-300/50 hover:bg-rose-200/20"
                    }`}
                  >
                    Retry
                  </button>
                </div>
              ) : !cheatSheetEntries.length ? (
                <div className={`rounded-xl border p-4 text-sm ${neutralCardClasses} ${neutralTextClasses}`}>
                  No answer was found for the current question.
                </div>
              ) : (
                cheatSheetEntries.map((entry) => (
                  <article
                    key={`cheat-sheet-entry-${entry.id}`}
                    className={`rounded-xl border p-4 ${
                      isLightTheme
                        ? "border-[#d3e0fa] bg-white"
                        : "border-[#5e7094] bg-[#384865]"
                    }`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${accentTextClasses}`}>
                      Question {currentIndex + 1}
                    </p>
                    <h3 className={`mt-1 text-sm font-semibold leading-relaxed ${headingClasses}`}>
                      {entry.prompt}
                    </h3>
                    <p className={`mt-2 text-sm font-semibold ${isLightTheme ? "text-emerald-700" : "text-emerald-200"}`}>
                      Answer: {entry.answer}
                    </p>
                    <p className={`mt-2 text-sm leading-relaxed ${isLightTheme ? "text-slate-600" : "text-slate-300"}`}>
                      {entry.explanation}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
