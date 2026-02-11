"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  FileText,
  Brain,
  GraduationCap,
  Headphones,
  Loader2,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { SpaceData } from "../types";

interface LearnSectionProps {
  space: SpaceData;
  learnPanelError: string | null;
  generatingSummary: boolean;
  handleGenerateSummary: () => void;
  generatingQuiz: boolean;
  handleGenerateQuiz: () => void;
  quizAnswers: Record<number, number>;
  setQuizAnswers: (ans: Record<number, number>) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (val: boolean) => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: () => void;
  sendingChat: boolean;
}

export function LearnSection({
  space,
  learnPanelError,
  generatingSummary,
  handleGenerateSummary,
  generatingQuiz,
  handleGenerateQuiz,
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  setQuizSubmitted,
  chatInput,
  setChatInput,
  handleSendMessage,
  sendingChat,
}: LearnSectionProps) {
  const quizScore = (space.quizQuestions || []).filter((q, i) => quizAnswers[i] === q.correctIndex).length;
  const quizTotal = (space.quizQuestions || []).length;
  const quizPercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;

  return (
    <div id="learn-panel" role="tabpanel" aria-labelledby="learn-tab" className="flex-1 overflow-y-auto bg-background">
      <div className="p-5 space-y-6">
        {learnPanelError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300"
          >
            {learnPanelError}
          </div>
        )}

        {/* Generate section */}
        <div>
          <h4 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 mb-4 px-1">Study Tools</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              aria-label={generatingSummary ? "Generating summary…" : "Generate summary"}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {generatingSummary ? (
                  <Loader2 size={22} className="animate-spin text-zinc-900 dark:text-zinc-100" />
                ) : (
                  <FileText size={22} className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                )}
              </div>
              <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Summary</span>
            </button>

            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
              aria-label={generatingQuiz ? "Generating quiz…" : "Generate quiz"}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {generatingQuiz ? (
                  <Loader2 size={22} className="animate-spin text-zinc-900 dark:text-zinc-100" />
                ) : (
                  <Brain size={22} className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                )}
              </div>
              <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Quiz</span>
            </button>

            <button
              disabled
              aria-label="Flashcards (coming soon)"
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 opacity-40 cursor-not-allowed grayscale"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <GraduationCap size={22} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Flashcards</span>
            </button>

            <button
              disabled
              aria-label="Podcast (coming soon)"
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 opacity-40 cursor-not-allowed grayscale"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Headphones size={22} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">Podcast</span>
            </button>
          </div>
        </div>

        {/* Summaries */}
        {(space.summaries || []).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">Summaries</h4>
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                aria-label={generatingSummary ? "Regenerating summary…" : "Refresh summary"}
                className="text-[12px] text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
              >
                {generatingSummary ? "Generating..." : "Regenerate"}
              </button>
            </div>
            <div className="space-y-4">
              {(space.summaries || []).map((s) => (
                <details key={s.id} className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm transition-all duration-300">
                  <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <ChevronRight size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0 transition-transform group-open:rotate-90 duration-300" />
                    <span className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">{s.title}</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-[13px] leading-[1.8] text-zinc-600 dark:text-zinc-400 [&_strong]:text-zinc-900 dark:[&_strong]:text-zinc-100 [&_strong]:font-semibold [&_a]:text-zinc-600 dark:[&_a]:text-zinc-400 [&_a]:underline [&_h1]:text-[17px] [&_h2]:text-[15px] [&_h3]:text-[14px] [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:space-y-2 [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:space-y-2 [&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_code]:text-[12px] [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre]:bg-zinc-50 dark:[&_pre]:bg-zinc-950 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-zinc-200 dark:[&_pre]:border-zinc-800 [&_pre]:overflow-x-auto [&_blockquote]:border-l-4 [&_blockquote]:border-zinc-200 dark:[&_blockquote]:border-zinc-700 [&_blockquote]:pl-4 [&_blockquote]:italic">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {(space.quizQuestions || []).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">Practice</h4>
              {quizSubmitted && (
                <div className="flex items-center gap-3">
                  <span className={`text-[13px] font-bold ${quizPercent >= 70 ? "text-emerald-500" : "text-amber-500"}`}>
                    {quizScore}/{quizTotal} ({quizPercent}%)
                  </span>
                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    aria-label="Retry quiz"
                    className="text-[12px] text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1"
                  >
                    <RotateCcw size={13} /> Retry
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {(space.quizQuestions || []).map((q, qi) => {
                const answered = quizAnswers[qi] !== undefined;
                const correct = quizSubmitted && quizAnswers[qi] === q.correctIndex;
                const wrong = quizSubmitted && answered && quizAnswers[qi] !== q.correctIndex;
                return (
                  <div key={q.id} className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
                    <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2.5">
                      {(q.options || []).map((opt, oi) => {
                        const isSelected = quizAnswers[qi] === oi;
                        const isCorrect = quizSubmitted && oi === q.correctIndex;
                        return (
                          <button
                            key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            disabled={quizSubmitted}
                            aria-label={`Option ${oi + 1}: ${opt}`}
                            className={`w-full text-left px-4 py-3 rounded-xl text-[13px] transition-all border focus-visible:ring-2 focus-visible:ring-ring ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-medium"
                                : isSelected && quizSubmitted
                                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-400 font-medium"
                                : isSelected
                                ? "bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium"
                                : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {quizSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                              {quizSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
                              <span className="flex-1">{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {!quizSubmitted && (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length < (space.quizQuestions || []).length}
                className="mt-6 w-full py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[14px] font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
              >
                Submit Answers
              </button>
            )}
          </div>
        )}

        {/* Quick Ask section at bottom of learn tab */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-4 px-1">Quick Ask</h4>
          <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 shadow-sm focus-within:shadow-md transition-all duration-300">
            <textarea
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about your content..."
              rows={1}
              className="w-full pl-5 pr-12 py-4 rounded-2xl bg-transparent text-[13px] outline-none resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-muted-foreground/50 leading-relaxed"
              style={{ minHeight: "56px", maxHeight: "120px" }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || sendingChat}
              aria-label="Send message"
              className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all duration-300 ${
                chatInput.trim() ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-md" : "text-muted-foreground/30"
              } disabled:cursor-not-allowed`}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
