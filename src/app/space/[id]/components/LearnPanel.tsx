"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
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
  MessageSquare,
} from "lucide-react";
import { SpaceData, ChatSession } from "../types";

interface LearnPanelProps {
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
  chatSessions: ChatSession[];
  openChatSession: (session: ChatSession) => void;
}

export function LearnPanel({
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
  chatSessions,
  openChatSession,
}: LearnPanelProps) {
  const quizScore = (space.quizQuestions || []).filter((q, i) => quizAnswers[i] === q.correctIndex).length;
  const quizTotal = (space.quizQuestions || []).length;
  const quizPercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-card">
      <div className="p-5 space-y-6">
        {learnPanelError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
          >
            {learnPanelError}
          </div>
        )}

        {/* Study Tools Grid */}
        <div>
          <h4 className="text-[14px] font-semibold text-foreground mb-4 px-1">Study Tools</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              aria-label={generatingSummary ? "Generating summary…" : "Generate summary"}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-background hover:bg-secondary hover:border-border/80 transition-all group focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                {generatingSummary ? (
                  <Loader2 size={22} className="animate-spin text-foreground" />
                ) : (
                  <FileText size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
              <span className="text-[13px] font-semibold text-foreground">Summary</span>
            </button>

            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
              aria-label={generatingQuiz ? "Generating quiz…" : "Generate quiz"}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-background hover:bg-secondary hover:border-border/80 transition-all group focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                {generatingQuiz ? (
                  <Loader2 size={22} className="animate-spin text-foreground" />
                ) : (
                  <Brain size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
              <span className="text-[13px] font-semibold text-foreground">Quiz</span>
            </button>

            <button
              disabled
              aria-label="Flashcards (coming soon)"
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-background opacity-40 cursor-not-allowed grayscale"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <GraduationCap size={22} className="text-muted-foreground" />
              </div>
              <span className="text-[13px] font-semibold text-foreground">Flashcards</span>
            </button>

            <button
              disabled
              aria-label="Podcast (coming soon)"
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-background opacity-40 cursor-not-allowed grayscale"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Headphones size={22} className="text-muted-foreground" />
              </div>
              <span className="text-[13px] font-semibold text-foreground">Podcast</span>
            </button>
          </div>
        </div>

        {/* Summaries */}
        {(space.summaries || []).length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[14px] font-semibold text-foreground">Summaries</h4>
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 rounded-md px-2 py-1"
              >
                {generatingSummary ? "Generating..." : "Regenerate"}
              </button>
            </div>
            <div className="space-y-3">
              {(space.summaries || []).map((s) => (
                <details key={s.id} className="group rounded-xl border border-border bg-background overflow-hidden transition-all duration-300">
                  <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none hover:bg-secondary transition-colors">
                    <ChevronRight size={14} className="text-muted-foreground shrink-0 transition-transform group-open:rotate-90 duration-300" />
                    <span className="text-[13px] font-semibold text-foreground">{s.title}</span>
                  </summary>
                  <div className="px-5 pb-5 pt-2 text-[13px] leading-[1.8] text-muted-foreground prose-ai">
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
              <h4 className="text-[14px] font-semibold text-foreground">Practice</h4>
              {quizSubmitted && (
                <div className="flex items-center gap-3">
                  <span className={`text-[13px] font-bold ${quizPercent >= 70 ? "text-emerald-500" : "text-amber-500"}`}>
                    {quizScore}/{quizTotal} ({quizPercent}%)
                  </span>
                  <button
                    onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                    className="text-[12px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 rounded px-2 py-1"
                  >
                    <RotateCcw size={13} /> Retry
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {(space.quizQuestions || []).map((q, qi) => {
                const answered = quizAnswers[qi] !== undefined;
                const isCorrectAnswer = quizSubmitted && quizAnswers[qi] === q.correctIndex;
                const isWrongAnswer = quizSubmitted && answered && quizAnswers[qi] !== q.correctIndex;
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-background">
                    <p className="text-[13px] font-semibold text-foreground mb-3">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {(q.options || []).map((opt, oi) => {
                        const isSelected = quizAnswers[qi] === oi;
                        const isCorrect = quizSubmitted && oi === q.correctIndex;
                        return (
                          <button
                            key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            disabled={quizSubmitted}
                            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-[12px] transition-all border ${
                              isCorrect
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-medium"
                                : isSelected && quizSubmitted
                                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-400 font-medium"
                                : isSelected
                                ? "bg-primary border-primary text-primary-foreground font-medium"
                                : "border-border text-muted-foreground hover:bg-secondary hover:border-border/80"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {quizSubmitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                              {quizSubmitted && isSelected && !isCorrect && <XCircle size={14} className="text-red-500 shrink-0" />}
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
                className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Submit Answers
              </button>
            )}
          </div>
        )}

        {/* Chat Sessions */}
        {chatSessions.length > 0 && (
          <div>
            <h4 className="text-[14px] font-semibold text-foreground mb-3 px-1">Recent Chats</h4>
            <div className="space-y-1.5">
              {chatSessions.slice(-5).reverse().map((session) => (
                <button
                  key={session.id}
                  onClick={() => openChatSession(session)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-border bg-background text-left text-[12px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <MessageSquare size={13} className="shrink-0" />
                  <span className="line-clamp-1 flex-1">{session.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Ask */}
        <div className="pt-2 border-t border-border">
          <h4 className="text-[13px] font-semibold text-foreground mb-3 px-1">Quick Ask</h4>
          <div className="relative rounded-xl bg-background border border-border focus-within:border-ring/50 transition-all">
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
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-transparent text-[13px] outline-none resize-none text-foreground placeholder:text-muted-foreground/50 leading-relaxed"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || sendingChat}
              aria-label="Send message"
              className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
                chatInput.trim() ? "bg-primary text-primary-foreground" : "text-muted-foreground/30"
              } disabled:cursor-not-allowed`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
