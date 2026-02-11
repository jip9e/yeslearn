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
  Sparkles,
  ArrowRight,
  Square,
  CheckSquare,
} from "lucide-react";
import { SpaceData, ChatSession } from "../types";

interface LearnPanelProps {
  space: SpaceData;
  learnPanelError: string | null;
  generatingSummary: boolean;
  handleGenerateSummary: () => void;
  generatingQuiz: boolean;
  handleGenerateQuiz: () => void;
  quizAnswers: Record<number, number[]>;
  setQuizAnswers: (ans: Record<number, number[]>) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (val: boolean) => void;
  quizCount: number;
  setQuizCount: (val: number) => void;
  quizMode: "qcu" | "qcm";
  setQuizMode: (val: "qcu" | "qcm") => void;
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
  quizCount,
  setQuizCount,
  quizMode,
  setQuizMode,
  chatInput,
  setChatInput,
  handleSendMessage,
  sendingChat,
  chatSessions,
  openChatSession,
}: LearnPanelProps) {
  const getCorrectIndices = (q: typeof space.quizQuestions[0]) =>
    q.correctIndices && q.correctIndices.length > 0 ? q.correctIndices : [q.correctIndex];

  const isQuestionCorrect = (qIndex: number) => {
    const selected = quizAnswers[qIndex] || [];
    const correct = getCorrectIndices((space.quizQuestions || [])[qIndex]);
    return selected.length === correct.length && correct.every(i => selected.includes(i));
  };

  const quizScore = (space.quizQuestions || []).filter((_, i) => isQuestionCorrect(i)).length;
  const quizTotal = (space.quizQuestions || []).length;
  const quizPercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;
  const hasSummaries = (space.summaries || []).length > 0;
  const hasQuiz = quizTotal > 0;

  const isMultiSelect = (q: typeof space.quizQuestions[0]) => {
    const correct = getCorrectIndices(q);
    return correct.length > 1;
  };

  const toggleOption = (qIndex: number, oIndex: number, multi: boolean) => {
    if (quizSubmitted) return;
    const current = quizAnswers[qIndex] || [];
    if (multi) {
      const newAnswers = current.includes(oIndex)
        ? current.filter(i => i !== oIndex)
        : [...current, oIndex];
      setQuizAnswers({ ...quizAnswers, [qIndex]: newAnswers });
    } else {
      setQuizAnswers({ ...quizAnswers, [qIndex]: [oIndex] });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-card">
      <div className="p-4 space-y-5">
        {learnPanelError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
          >
            {learnPanelError}
          </div>
        )}

        {/* Quick Ask — moved to top for prominence */}
        <div>
          <div className="relative rounded-xl bg-background border border-border focus-within:border-ring/40 focus-within:shadow-sm transition-all">
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
              className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-transparent text-[13px] outline-none resize-none text-foreground placeholder:text-muted-foreground/40 leading-relaxed"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || sendingChat}
              aria-label="Send message"
              className={`absolute right-2.5 bottom-2.5 p-2 rounded-lg transition-all ${
                chatInput.trim() ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/25"
              } disabled:cursor-not-allowed`}
            >
              {sendingChat ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>

        {/* Quiz config + generate */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background text-[12px] font-medium text-foreground hover:bg-secondary hover:border-border/60 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {generatingSummary ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} className="text-muted-foreground" />
              )}
              {generatingSummary ? "Generating..." : hasSummaries ? "Regenerate" : "Summary"}
            </button>
            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background text-[12px] font-medium text-foreground hover:bg-secondary hover:border-border/60 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {generatingQuiz ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Brain size={14} className="text-muted-foreground" />
              )}
              {generatingQuiz ? "Generating..." : hasQuiz ? "New Quiz" : "Quiz"}
            </button>
          </div>

          {/* Compact quiz settings inline */}
          <div className="flex items-center gap-2">
            <select
              value={quizCount}
              onChange={(e) => setQuizCount(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border border-border bg-background text-[11px] text-foreground outline-none"
            >
              {[5, 10, 15, 20, 25, 30].map(n => (
                <option key={n} value={n}>{n} Q</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setQuizMode("qcu")}
                className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  quizMode === "qcu" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                QCU
              </button>
              <button
                onClick={() => setQuizMode("qcm")}
                className={`px-2.5 py-1.5 text-[11px] font-medium border-l border-border transition-colors ${
                  quizMode === "qcm" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                QCM
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground/50 ml-auto">
              {quizMode === "qcm" ? "Multiple answers" : "Single answer"}
            </span>
          </div>
        </div>

        {/* Coming soon — subtle inline pills */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 text-[11px] text-muted-foreground/50">
            <GraduationCap size={12} />
            Flashcards · Soon
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 text-[11px] text-muted-foreground/50">
            <Headphones size={12} />
            Podcast · Soon
          </div>
        </div>

        {/* Summaries */}
        {hasSummaries && (
          <div>
            <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-0.5">Summaries</h4>
            <div className="space-y-2">
              {(space.summaries || []).map((s) => (
                <details key={s.id} className="group rounded-xl border border-border bg-background overflow-hidden">
                  <summary className="flex items-center gap-2.5 px-3.5 py-3 cursor-pointer select-none hover:bg-secondary/50 transition-colors">
                    <ChevronRight size={12} className="text-muted-foreground/60 shrink-0 transition-transform duration-200 group-open:rotate-90" />
                    <span className="text-[13px] font-medium text-foreground">{s.title}</span>
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-[13px] leading-[1.8] text-muted-foreground prose-ai">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {hasQuiz && (
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Practice</h4>
              {quizSubmitted && (
                <div className="flex items-center gap-2.5">
                  <span className={`text-[12px] font-bold ${quizPercent >= 70 ? "text-emerald-500" : quizPercent >= 40 ? "text-amber-500" : "text-red-500"}`}>
                    {quizScore}/{quizTotal}
                  </span>
                  <button
                    onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 rounded px-1.5 py-0.5"
                  >
                    <RotateCcw size={11} /> Retry
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(space.quizQuestions || []).map((q, qi) => {
                const multi = isMultiSelect(q);
                const correctIndices = getCorrectIndices(q);
                const selected = quizAnswers[qi] || [];
                const questionMode = q.quizMode || quizMode;

                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-border bg-background">
                    <div className="flex items-start gap-1.5 mb-2.5">
                      <p className="text-[13px] font-medium text-foreground leading-snug flex-1">
                        {qi + 1}. {q.question}
                      </p>
                      {questionMode === "qcm" && multi && (
                        <span className="shrink-0 text-[9px] font-medium text-muted-foreground/50 bg-muted/40 px-1.5 py-0.5 rounded mt-0.5">
                          Multi
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {(q.options || []).map((opt, oi) => {
                        const isSelected = selected.includes(oi);
                        const isCorrect = quizSubmitted && correctIndices.includes(oi);
                        const isWrong = quizSubmitted && isSelected && !correctIndices.includes(oi);
                        const isMissed = quizSubmitted && !isSelected && correctIndices.includes(oi);

                        return (
                          <button
                            key={oi}
                            onClick={() => toggleOption(qi, oi, questionMode === "qcm" && multi)}
                            disabled={quizSubmitted}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all border flex items-center gap-2 ${
                              isCorrect
                                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium"
                                : isWrong
                                ? "bg-red-500/5 border-red-500/30 text-red-600 dark:text-red-400 font-medium"
                                : isMissed
                                ? "bg-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                : isSelected
                                ? "bg-primary/10 border-primary/40 text-foreground font-medium"
                                : "border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            }`}
                          >
                            {!quizSubmitted && (
                              <span className="shrink-0">
                                {questionMode === "qcm" && multi ? (
                                  isSelected ? <CheckSquare size={13} className="text-primary" /> : <Square size={13} className="text-muted-foreground/25" />
                                ) : (
                                  <span className={`block w-3 h-3 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/20"}`} />
                                )}
                              </span>
                            )}
                            {quizSubmitted && isCorrect && <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />}
                            {quizSubmitted && isWrong && <XCircle size={13} className="text-red-500 shrink-0" />}
                            {quizSubmitted && isMissed && <CheckCircle2 size={13} className="text-amber-500 shrink-0" />}
                            <span className="flex-1">{opt}</span>
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
                disabled={!Object.keys(quizAnswers).every((_, i) => {
                  const ans = quizAnswers[i];
                  return ans && ans.length > 0;
                }) || Object.keys(quizAnswers).length < quizTotal}
                className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-90 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Submit Answers
              </button>
            )}
          </div>
        )}

        {/* Recent Chats */}
        {chatSessions.length > 0 && (
          <div>
            <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">Recent Chats</h4>
            <div className="space-y-1">
              {chatSessions.slice(-5).reverse().map((session) => (
                <button
                  key={session.id}
                  onClick={() => openChatSession(session)}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-left text-[12px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors group"
                >
                  <MessageSquare size={12} className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
                  <span className="line-clamp-1 flex-1">{session.name}</span>
                  <ArrowRight size={12} className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
