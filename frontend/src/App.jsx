/**
 * App.jsx — root component and layout shell.
 *
 * Owns the two pieces of UI-level state that need to survive category or
 * question-set changes: theme preference and active category.  Both are
 * persisted to localStorage so the user's last choices are restored on
 * the next visit without a full round-trip to the server.
 *
 * Everything else (question data, quiz flow state) lives inside Quiz.jsx.
 */
import { useEffect, useState } from "react";
import Quiz from "./components/Quiz";

const QUIZ_CATEGORIES = Object.freeze([
  {
    id: "programming",
    label: "Programming",
    group: "core",
    description: "Software engineering principles, APIs, and architecture.",
  },
  {
    id: "music-theory",
    label: "Music Theory",
    group: "core",
    description: "From fundamentals to advanced harmony and analysis.",
  },
  {
    id: "tech-support",
    label: "Tech Support",
    group: "specialist",
    description: "Operating systems, productivity tools, hardware, and networking.",
  },
  {
    id: "fitness",
    label: "Fitness",
    group: "specialist",
    description: "Fitness instructing concepts across levels 1 to 3.",
  },
  {
    id: "charlotte",
    label: "Charlotte",
    group: "lifestyle",
    description: "Lifestyle topics like finance, cooking, and equinology.",
  },
]);

const PINNED_CATEGORY_IDS = Object.freeze(["programming", "music-theory", "tech-support"]);

const CATEGORY_GROUPS = Object.freeze([
  { id: "core", label: "Core Categories" },
  { id: "specialist", label: "Specialized Tracks" },
  { id: "lifestyle", label: "Lifestyle Tracks" },
]);

const isKnownCategory = (categoryId) => QUIZ_CATEGORIES.some((category) => category.id === categoryId);

const getCategoryById = (categoryId) => QUIZ_CATEGORIES.find((category) => category.id === categoryId);

function App() {
  // Initialize from localStorage to avoid a flicker on first render.
  const [isLightTheme, setIsLightTheme] = useState(() => {
    const storedTheme = localStorage.getItem("quiz-theme");
    return storedTheme === "light";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const storedCategory = localStorage.getItem("quiz-category");
    return isKnownCategory(storedCategory) ? storedCategory : "programming";
  });
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isAiQuiz, setIsAiQuiz] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [recentCategoryIds, setRecentCategoryIds] = useState(() => {
    const storedRecentCategories = localStorage.getItem("quiz-recent-categories");

    if (!storedRecentCategories) {
      return [];
    }

    try {
      const parsed = JSON.parse(storedRecentCategories);

      if (!Array.isArray(parsed)) {
        return [];
      }

      const normalizedIds = parsed.filter((categoryId) => isKnownCategory(categoryId)).slice(0, 4);
      if (normalizedIds.includes(selectedCategory)) {
        return normalizedIds;
      }

      return [selectedCategory, ...normalizedIds].slice(0, 4);
    } catch {
      return [];
    }
  });

  // Persist theme changes so refreshes keep the same look and feel.
  useEffect(() => {
    localStorage.setItem("quiz-theme", isLightTheme ? "light" : "dark");
  }, [isLightTheme]);

  useEffect(() => {
    localStorage.setItem("quiz-category", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("quiz-recent-categories", JSON.stringify(recentCategoryIds));
  }, [recentCategoryIds]);

  useEffect(() => {
    if (!isCategoryPickerOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsCategoryPickerOpen(false);
        setCategoryQuery("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isCategoryPickerOpen]);

  const pageClasses = isLightTheme
    ? "bg-[#eff3ff] text-slate-900"
    : "bg-[#25314a] text-slate-100";

  const headingClasses = isLightTheme ? "text-[#243252]" : "text-white";
  const subtitleClasses = isLightTheme ? "text-slate-600" : "text-slate-200";
  const toggleLabelClasses = "text-[10px] font-semibold uppercase tracking-[0.14em]";

  const chipTone = (isActive) => {
    if (isActive) {
      return isLightTheme
        ? "border-[#a98bff] bg-[#ece3ff] text-[#463391]"
        : "border-[#aa92f5] bg-[#7358c8]/40 text-[#e8ddff]";
    }

    return isLightTheme
      ? "border-[#c7d5f2] bg-white/90 text-[#4c5978] hover:bg-[#eef3ff]"
      : "border-[#6e7da0] bg-[#334261]/90 text-slate-200 hover:bg-[#3b4c70]";
  };

  const pickerPanelTone = isLightTheme
    ? "border-[#cad6f3] bg-[#f8faff]/98"
    : "border-[#57698f] bg-[#2b3856]/96";

  const pickerMutedTextTone = isLightTheme ? "text-slate-500" : "text-slate-300";
  const pickerSearchTone = isLightTheme
    ? "border-[#c7d5f2] bg-white text-[#334060] placeholder:text-slate-400"
    : "border-[#5f7093] bg-[#2f3d5f] text-slate-100 placeholder:text-slate-400";
  const pickerRowTone = (isActive) => {
    if (isActive) {
      return isLightTheme
        ? "border-[#a98bff] bg-[#ece3ff]"
        : "border-[#aa92f5] bg-[#5f4fa7]/40";
    }

    return isLightTheme
      ? "border-[#d3dff8] bg-white/95 hover:bg-[#eef3ff]"
      : "border-[#5a6c92] bg-[#334261] hover:bg-[#3a4b71]";
  };

  const selectedCategoryMeta = getCategoryById(selectedCategory) ?? QUIZ_CATEGORIES[0];
  const pinnedCategories = QUIZ_CATEGORIES.filter((category) => PINNED_CATEGORY_IDS.includes(category.id));
  const isSelectedPinned = pinnedCategories.some((category) => category.id === selectedCategory);

  const normalizedQuery = categoryQuery.trim().toLowerCase();
  const filteredCategories = QUIZ_CATEGORIES.filter((category) => (
    !normalizedQuery || category.label.toLowerCase().includes(normalizedQuery)
  ));

  const recentCategories = recentCategoryIds
    .map((categoryId) => getCategoryById(categoryId))
    .filter(Boolean)
    .filter((category) => !normalizedQuery || category.label.toLowerCase().includes(normalizedQuery));

  const groupedCategories = CATEGORY_GROUPS
    .map((group) => ({
      ...group,
      categories: filteredCategories.filter((category) => category.group === group.id),
    }))
    .filter((group) => group.categories.length > 0);

  const closeCategoryPicker = () => {
    setIsCategoryPickerOpen(false);
    setCategoryQuery("");
  };

  const rememberCategory = (categoryId) => {
    setRecentCategoryIds((previousIds) => (
      [categoryId, ...previousIds.filter((savedCategoryId) => savedCategoryId !== categoryId)].slice(0, 4)
    ));
  };

  const selectCategory = (categoryId, shouldClosePicker = true) => {
    setSelectedCategory(categoryId);
    rememberCategory(categoryId);

    if (shouldClosePicker) {
      closeCategoryPicker();
    }
  };

  return (
    <main className={`relative h-screen overflow-hidden transition-colors duration-300 ${pageClasses}`}>
      {/* Decorative background layers that reinforce the active theme. */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -left-24 top-10 h-96 w-96 rounded-full blur-3xl ${
            isLightTheme ? "bg-[#d6e1ff]" : "bg-[#1f2a41]"
          }`}
        />
        <div
          className={`absolute -right-12 top-1/4 h-80 w-80 rounded-full blur-3xl ${
            isLightTheme ? "bg-[#e4ecff]" : "bg-[#3a4665]/80"
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
            isLightTheme ? "bg-[#8f46ff]/15" : "bg-[#6f35d3]/20"
          }`}
        />
      </div>

      <section className="relative mx-auto flex h-full w-full max-w-300 flex-col px-3 py-1.5 sm:px-6 sm:py-4">
        <div className="mx-auto mb-1 flex w-full max-w-180 items-center justify-between gap-3 sm:mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black uppercase tracking-[0.18em] sm:h-11 sm:w-11 ${
                  isLightTheme
                    ? "bg-white/90 text-[#5d44d2] shadow-lg shadow-[#d3dcf8]/60"
                    : "bg-[#32405e]/90 text-[#d9d2ff] shadow-lg shadow-[#141d2f]/50"
                }`}
              >
                BTB
              </div>
              <div className="min-w-0">
                <h1 className={`truncate text-lg font-bold tracking-tight sm:text-[1.75rem] font-['Space_Grotesk'] ${headingClasses}`}>
                  Beat the Backlog Quiz
                </h1>
                <p className={`mt-0.5 hidden text-sm leading-relaxed sm:block sm:text-base ${subtitleClasses}`}>
                  Practical multi-domain quizzes, one focused round at a time.
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
                  {pinnedCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => selectCategory(category.id, false)}
                      className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] transition sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em] ${chipTone(selectedCategory === category.id)}`}
                      aria-pressed={selectedCategory === category.id}
                    >
                      {category.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(true)}
                    aria-expanded={isCategoryPickerOpen}
                    aria-controls="category-picker"
                    className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] transition sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em] ${chipTone(false)}`}
                  >
                    Categories
                  </button>
                  {!isSelectedPinned && (
                    <span className={`rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.12em] ${chipTone(true)}`}>
                      Active: {selectedCategoryMeta.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAiQuiz((prev) => !prev)}
            aria-pressed={isAiQuiz}
            aria-label={`Switch to ${isAiQuiz ? "standard" : "AI"} quiz mode`}
            className={`relative z-20 flex shrink-0 items-center gap-3 rounded-full border px-3 py-2 backdrop-blur transition ${
              isAiQuiz
                ? "border-[#55bfff] bg-[#e8f7ff]/90 text-[#0a4f70]"
                : "border-[#a98bff] bg-[#f4ebff]/85 text-[#3e2b7f]"
            }`}
          >
            <span className={`text-xs font-semibold uppercase tracking-[0.14em]`}>AI Quiz</span>
            <span className={`text-xs opacity-70`}>{isAiQuiz ? "Enabled" : "Disabled"}</span>
          </button>

          <button
            type="button"
            // Toggle between dark and light mode for readability preference.
            onClick={() => setIsLightTheme((prev) => !prev)}
            aria-pressed={isLightTheme}
            aria-label={`Switch to ${isLightTheme ? "dark" : "light"} theme`}
            className={`relative z-20 flex shrink-0 items-center gap-3 rounded-full border px-3 py-2 backdrop-blur transition ${
              isLightTheme
                ? "border-[#b9c8ee] bg-white/85 text-[#334060]"
                : "border-[#6a7694] bg-[#3a4664]/85 text-slate-200"
            }`}
          >
            <span className={`hidden sm:inline ${toggleLabelClasses} ${isLightTheme ? "opacity-100" : "opacity-40"}`}>Light</span>
            <span
              className="relative h-6 w-12 rounded-full bg-linear-to-r from-[#8f46ff] to-[#b260ff] p-1 transition"
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                  isLightTheme ? "left-1" : "left-7"
                }`}
              />
            </span>
            <span className={`hidden sm:inline ${toggleLabelClasses} ${!isLightTheme ? "opacity-100" : "opacity-40"}`}>Dark</span>
          </button>
        </div>

        <div className="app-enter min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-180 pb-2">
            <Quiz
              isLightTheme={isLightTheme}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              mode={isAiQuiz ? "ai" : "standard"}
            />
          </div>
        </div>
      </section>

      {isCategoryPickerOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/55 px-3 pb-3 pt-14 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-picker-title"
        >
          <button
            type="button"
            className="absolute inset-0"
            onClick={closeCategoryPicker}
            aria-label="Close category picker"
          />

          <div
            id="category-picker"
            className={`relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl ${pickerPanelTone}`}
          >
            <div className={`border-b px-4 pb-3 pt-4 sm:px-6 ${isLightTheme ? "border-[#d7e1f8]" : "border-[#5d6f93]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="category-picker-title" className={`text-lg font-bold tracking-tight sm:text-xl ${headingClasses}`}>
                    Choose Category
                  </h2>
                  <p className={`mt-1 text-xs sm:text-sm ${pickerMutedTextTone}`}>
                    Browse everything by section. Search is optional.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCategoryPicker}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${chipTone(false)}`}
                >
                  Close
                </button>
              </div>

              <div className="mt-3">
                <label htmlFor="category-query" className={`sr-only ${pickerMutedTextTone}`}>
                  Search categories
                </label>
                <input
                  id="category-query"
                  type="text"
                  value={categoryQuery}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                  placeholder="Show all categories or filter by name"
                  className={`w-full rounded-2xl border px-3 py-2 text-sm outline-hidden transition focus:border-[#9d84ff] focus:ring-2 focus:ring-[#a990ff]/35 ${pickerSearchTone}`}
                />
              </div>
            </div>

            <div className="max-h-[68vh] overflow-y-auto px-4 py-4 sm:px-6">
              {!normalizedQuery && recentCategories.length > 1 && (
                <section className="mb-5">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${pickerMutedTextTone}`}>
                    Recent
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {recentCategories.map((category) => {
                      const isActiveCategory = selectedCategory === category.id;
                      return (
                        <button
                          key={`recent-${category.id}`}
                          type="button"
                          onClick={() => selectCategory(category.id)}
                          className={`rounded-2xl border px-3 py-3 text-left transition ${pickerRowTone(isActiveCategory)}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-semibold ${headingClasses}`}>{category.label}</p>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${chipTone(isActiveCategory)}`}>
                              {isActiveCategory ? "Active" : "Recent"}
                            </span>
                          </div>
                          <p className={`mt-1 text-xs leading-relaxed ${pickerMutedTextTone}`}>
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {groupedCategories.map((group) => (
                <section key={group.id} className="mb-5 last:mb-0">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${pickerMutedTextTone}`}>
                    {group.label}
                  </p>

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {group.categories.map((category) => {
                      const isActiveCategory = selectedCategory === category.id;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => selectCategory(category.id)}
                          className={`rounded-2xl border px-3 py-3 text-left transition ${pickerRowTone(isActiveCategory)}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-semibold ${headingClasses}`}>{category.label}</p>
                            {isActiveCategory && (
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${chipTone(true)}`}>
                                Active
                              </span>
                            )}
                          </div>
                          <p className={`mt-1 text-xs leading-relaxed ${pickerMutedTextTone}`}>
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}

              {groupedCategories.length === 0 && (
                <p className={`rounded-2xl border px-3 py-4 text-sm ${pickerMutedTextTone} ${isLightTheme ? "border-[#d3dff8] bg-white/90" : "border-[#5a6c92] bg-[#334261]"}`}>
                  No categories match your filter. Clear the search to browse everything.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
