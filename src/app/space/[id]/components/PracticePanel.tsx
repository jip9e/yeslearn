"use client";
import React, { useState } from "react";
import { SpaceData } from "../types";
import { Loader2, RotateCcw, CheckCircle2, XCircle, ChevronDown, Settings2, Sparkles, Square, CheckSquare } from "lucide-react";

interface PracticePanelProps {
  space: SpaceData;
  quizAnswers: Record<number, number[]>;
  setQuizAnswers: (value: Record<number, number[]>) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (value: boolean) => void;
  generatingQuiz: boolean;
  handleGenerateQuiz: () => void;
  quizCount: number;
  setQuizCount: (value: number) => void;
  quizMode: "qcu" | "qcm";
  setQuizMode: (value: "qcu" | "qcm") => void;
}

export function PracticePanel({
  space,
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  setQuizSubmitted,
  generatingQuiz,
  handleGenerateQuiz,
  quizCount,
  setQuizCount,
  quizMode,
  setQuizMode,
}: PracticePanelProps) {
  const questions = space.quizQuestions || [];
  const [showSettings, setShowSettings] = useState(questions.length === 0);

  // Scoring: compare selected indices with correct indices
  const getCorrectIndices = (q: typeof questions[0]) =>
    q.correctIndices && q.correctIndices.length > 0 ? q.correctIndices : [q.correctIndex];

  const isQuestionCorrect = (qIndex: number) => {
    const selected = quizAnswers[qIndex] || [];
    const correct = getCorrectIndices(questions[qIndex]);
    return selected.length === correct.length && correct.every(i => selected.includes(i));
  };

  const quizScore = questions.filter((_, idx) => isQuestionCorrect(idx)).length;
  const quizPercent = questions.length > 0 ? Math.round((quizScore / questions.length) * 100) : 0;

  const isMultiSelect = (q: typeof questions[0]) => {
    const correct = getCorrectIndices(q);
    return correct.length > 1;
  };

  const toggleOption = (qIndex: number, oIndex: number, multi: boolean) => {
    if (quizSubmitted) return;
    const current = quizAnswers[qIndex] || [];
    if (multi) {
      // Toggle in/out
      const newAnswers = current.includes(oIndex)
        ? current.filter(i => i !== oIndex)
        : [...current, oIndex];
      setQuizAnswers({ ...quizAnswers, [qIndex]: newAnswers });
    } else {
      // Single select
      setQuizAnswers({ ...quizAnswers, [qIndex]: [oIndex] });
    }
  };

  const allAnswered = questions.every((_, idx) => (quizAnswers[idx] || []).length > 0);

  const countOptions = [5, 10, 15, 20, 25, 30];

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-[12px] font-medium text-muted-foreground">Practice</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors ${showSettings ? "bg-secondary text-foreground" : ""}`}
            aria-label="Quiz settings"
          >
            <Settings2 size={14} />
          </button>
          <button
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium transition hover:opacity-90 disabled:opacity-40"
          >
            {generatingQuiz ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {generatingQuiz ? "Generating..." : questions.length ? "New Quiz" : "Generate"}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-border px-5 py-4 space-y-4 bg-muted/20">
          {/* Question Count */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Number of Questions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {countOptions.map(n => (
                <button
                  key={n}
                  onClick={() => setQuizCount(n)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                    quizCount === n
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Mode */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Quiz Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setQuizMode("qcu")}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all ${
                  quizMode === "qcu"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="font-semibold">QCU</div>
                <div className={`text-[10px] mt-0.5 ${quizMode === "qcu" ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                  Single answer
                </div>
              </button>
              <button
                onClick={() => setQuizMode("qcm")}
                className={`flex-1 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all ${
                  quizMode === "qcm"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div className="font-semibold">QCM</div>
                <div className={`text-[10px] mt-0.5 ${quizMode === "qcm" ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                  Multiple answers
                </div>
              </button>
            </div>
            {quizMode === "qcm" && (
              <p className="text-[11px] text-muted-foreground/60 mt-2 leading-relaxed">
                Each question may have one or multiple correct answers. The AI decides based on the content.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-muted-foreground/40" />
            </div>
            <p className="text-[13px] text-muted-foreground mb-1">No quiz yet</p>
            <p className="text-[11px] text-muted-foreground/50">Configure settings above and generate a quiz</p>
          </div>
        ) : (
          questions.map((question, qIndex) => {
            const multi = isMultiSelect(question);
            const correctIndices = getCorrectIndices(question);
            const selected = quizAnswers[qIndex] || [];
            const questionMode = question.quizMode || quizMode;

            return (
              <div key={question.id} className="border border-border bg-card rounded-xl px-4 py-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-[11px] font-bold text-muted-foreground/50 mt-0.5 shrink-0">
                    {qIndex + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-foreground leading-snug">
                      {question.question}
                    </p>
                    {questionMode === "qcm" && multi && (
                      <span className="inline-block mt-1.5 text-[10px] font-medium text-muted-foreground/50 bg-muted/40 px-2 py-0.5 rounded-md">
                        Multiple answers
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 ml-5">
                  {(question.options || []).map((option, oIndex) => {
                    const isSelected = selected.includes(oIndex);
                    const isCorrect = quizSubmitted && correctIndices.includes(oIndex);
                    const isWrong = quizSubmitted && isSelected && !correctIndices.includes(oIndex);
                    const isMissed = quizSubmitted && !isSelected && correctIndices.includes(oIndex);

                    return (
                      <button
                        key={`${question.id}-${oIndex}`}
                        onClick={() => toggleOption(qIndex, oIndex, questionMode === "qcm" && multi)}
                        disabled={quizSubmitted}
                        className={`flex w-full items-center gap-2.5 border px-3 py-2.5 rounded-lg text-left text-[12px] transition-all ${
                          isCorrect
                            ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                            : isWrong
                            ? "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5"
                            : isMissed
                            ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                            : isSelected
                            ? "border-primary/40 bg-primary/8 text-foreground font-medium"
                            : "border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        }`}
                      >
                        {/* Checkbox/Radio indicator */}
                        {!quizSubmitted && (
                          <span className="shrink-0">
                            {questionMode === "qcm" && multi ? (
                              isSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} className="text-muted-foreground/30" />
                            ) : (
                              <span className={`block w-3.5 h-3.5 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/25"}`}>
                                {isSelected && <span className="block w-full h-full rounded-full bg-primary-foreground scale-[0.4]" />}
                              </span>
                            )}
                          </span>
                        )}
                        {quizSubmitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                        {quizSubmitted && isWrong && <XCircle size={14} className="text-red-500 shrink-0" />}
                        {quizSubmitted && isMissed && <CheckCircle2 size={14} className="text-amber-500 shrink-0" />}
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom bar */}
      {questions.length > 0 && (
        <div className="border-t border-border px-5 py-3 flex items-center gap-3 bg-card">
          {quizSubmitted ? (
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-bold ${quizPercent >= 70 ? "text-emerald-500" : quizPercent >= 40 ? "text-amber-500" : "text-red-500"}`}>
                {quizScore}/{questions.length}
              </span>
              <span className="text-[11px] text-muted-foreground">({quizPercent}%)</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              {Object.keys(quizAnswers).filter(k => (quizAnswers[Number(k)] || []).length > 0).length}/{questions.length} answered
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {quizSubmitted && (
              <button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-foreground hover:bg-secondary"
              >
                <RotateCcw size={12} /> Retry
              </button>
            )}
            {!quizSubmitted && (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={!allAnswered}
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium disabled:opacity-25 hover:opacity-90 transition-all"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
