import { useEffect, useState } from "react";
import Quiz from "./components/Quiz";

function App() {
  // Initialize from localStorage to avoid a flicker on first render.
  const [isLightTheme, setIsLightTheme] = useState(() => {
    const storedTheme = window.localStorage.getItem("quiz-theme");
    return storedTheme === "light";
  });

  // Persist theme changes so refreshes keep the same look and feel.
  useEffect(() => {
    window.localStorage.setItem("quiz-theme", isLightTheme ? "light" : "dark");
  }, [isLightTheme]);

  const pageClasses = isLightTheme
    ? "bg-[#eff3ff] text-slate-900"
    : "bg-[#25314a] text-slate-100";

  const shellClasses = isLightTheme
    ? "border-[#c9d7f4] bg-white/90 shadow-2xl shadow-[#d3dcf8]/70"
    : "border-[#4e5e7f] bg-[#32405e]/90 shadow-2xl shadow-[#141d2f]/70";

  const headingClasses = isLightTheme ? "text-[#243252]" : "text-white";
  const subtitleClasses = isLightTheme ? "text-slate-600" : "text-slate-200";

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

      <section className="relative mx-auto flex h-full w-full max-w-384 flex-col px-4 py-4 sm:px-8 sm:py-6">
        <div className="mb-3 flex justify-end sm:mb-4">
          <button
            type="button"
            // Toggle between dark and light mode for readability preference.
            onClick={() => setIsLightTheme((prev) => !prev)}
            aria-pressed={isLightTheme}
            aria-label={`Switch to ${isLightTheme ? "dark" : "light"} theme`}
            className={`relative z-20 flex items-center gap-3 rounded-full border px-3 py-2 backdrop-blur transition ${
              isLightTheme
                ? "border-[#b9c8ee] bg-white/85 text-[#334060]"
                : "border-[#6a7694] bg-[#3a4664]/85 text-slate-200"
            }`}
          >
            <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isLightTheme ? "opacity-100" : "opacity-40"}`}>Light</span>
            <span
              className="relative h-6 w-12 rounded-full p-1 transition bg-linear-to-r from-[#8f46ff] to-[#b260ff]"
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                  isLightTheme ? "left-1" : "left-7"
                }`}
              />
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${!isLightTheme ? "opacity-100" : "opacity-40"}`}>Dark</span>
          </button>
        </div>

        <div className={`app-enter flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl border p-6 backdrop-blur sm:p-8 ${shellClasses}`}>

          <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl font-['Space_Grotesk'] ${headingClasses}`}>
            Test Your Core Engineering Fundamentals
          </h1>

          <p className={`mt-2 max-w-3xl text-sm leading-relaxed sm:text-base ${subtitleClasses}`}>
            Answer each question, review instant feedback, and finish with your final score.
          </p>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <Quiz isLightTheme={isLightTheme} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
