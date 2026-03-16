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
  { id: "programming", label: "Programming" },
  { id: "music-theory", label: "Music Theory" },
  { id: "charlotte", label: "Charlotte" },
]);

function App() {
  // Initialize from localStorage to avoid a flicker on first render.
  const [isLightTheme, setIsLightTheme] = useState(() => {
    const storedTheme = localStorage.getItem("quiz-theme");
    return storedTheme === "light";
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const storedCategory = localStorage.getItem("quiz-category");
    return storedCategory || "programming";
  });

  // Persist theme changes so refreshes keep the same look and feel.
  useEffect(() => {
    localStorage.setItem("quiz-theme", isLightTheme ? "light" : "dark");
  }, [isLightTheme]);

  useEffect(() => {
    localStorage.setItem("quiz-category", selectedCategory);
  }, [selectedCategory]);

  const pageClasses = isLightTheme
    ? "bg-[#eff3ff] text-slate-900"
    : "bg-[#25314a] text-slate-100";

  const headingClasses = isLightTheme ? "text-[#243252]" : "text-white";
  const subtitleClasses = isLightTheme ? "text-slate-600" : "text-slate-200";
  const toggleLabelClasses = "text-[10px] font-semibold uppercase tracking-[0.14em]";

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

      <section className="relative mx-auto flex h-full w-full max-w-300 flex-col px-4 py-2 sm:px-6 sm:py-5">
        <div className="mx-auto mb-2 flex w-full max-w-180 items-center justify-between gap-4 sm:mb-4">
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
                <h1 className={`truncate text-xl font-bold tracking-tight sm:text-[1.75rem] font-['Space_Grotesk'] ${headingClasses}`}>
                  Beat the Backlog Quiz
                </h1>
                <p className={`mt-0.5 hidden text-sm leading-relaxed sm:block sm:text-base ${subtitleClasses}`}>
                  Practical programming and music theory quizzes, one focused round at a time.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {QUIZ_CATEGORIES.map((category) => {
                    const isActiveCategory = selectedCategory === category.id;
                    const categoryButtonTone = isActiveCategory
                      ? (isLightTheme
                          ? "border-[#a98bff] bg-[#ece3ff] text-[#463391]"
                          : "border-[#aa92f5] bg-[#7358c8]/40 text-[#e8ddff]")
                      : (isLightTheme
                          ? "border-[#c7d5f2] bg-white/90 text-[#4c5978] hover:bg-[#eef3ff]"
                          : "border-[#6e7da0] bg-[#334261]/90 text-slate-200 hover:bg-[#3b4c70]");

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${categoryButtonTone}`}
                        aria-pressed={isActiveCategory}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

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
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
