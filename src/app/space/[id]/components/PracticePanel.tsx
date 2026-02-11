"use client";
import React from "react";
import { SpaceData } from "../types";
import { Loader2, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

interface PracticePanelProps {
  space: SpaceData;
  quizAnswers: Record<number, number>;
  setQuizAnswers: (value: Record<number, number>) => void;
  quizSubmitted: boolean;
  setQuizSubmitted: (value: boolean) => void;
  generatingQuiz: boolean;
  handleGenerateQuiz: () => void;
}

export function PracticePanel({
  space,
  quizAnswers,
  setQuizAnswers,
  quizSubmitted,
  setQuizSubmitted,
  generatingQuiz,
  handleGenerateQuiz,
}: PracticePanelProps) {
  const questions = space.quizQuestions || [];
  const quizScore = questions.filter((q, idx) => quizAnswers[idx] === q.correctIndex).length;
  const quizPercent = questions.length > 0 ? Math.round((quizScore / questions.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-border px-6 py-3 text-[12px] text-muted-foreground">
        <span className="font-medium">Practice</span>
        <button
          onClick={handleGenerateQuiz}
          disabled={generatingQuiz}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-foreground transition hover:bg-secondary disabled:opacity-40"
        >
          {generatingQuiz ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
          {questions.length ? "Refresh" : "Generate"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {questions.length === 0 ? (
          <div className="max-w-sm text-[13px] text-muted-foreground">No quiz ready. Generate a practice set to drill this space.</div>
        ) : (
          questions.map((question, qIndex) => {
            const answered = quizAnswers[qIndex] !== undefined;
            return (
              <div key={question.id} className="border border-border bg-card rounded-xl px-5 py-4 text-[13px]">
                <p className="font-semibold text-foreground mb-3">
                  {qIndex + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {(question.options || []).map((option, oIndex) => {
                    const isSelected = quizAnswers[qIndex] === oIndex;
                    const isCorrect = quizSubmitted && oIndex === question.correctIndex;
                    const isWrong = quizSubmitted && isSelected && !isCorrect;
                    return (
                      <button
                        key={`${question.id}-${oIndex}`}
                        onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex })}
                        className={`flex w-full items-center gap-2 border px-3.5 py-2.5 rounded-xl text-left text-[12px] transition ${
                          isCorrect
                            ? "border-emerald-400 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                            : isWrong
                            ? "border-red-400 dark:border-red-500/40 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
                            : isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:bg-secondary hover:border-border/80"
                        }`}
                      >
                        {isCorrect && <CheckCircle2 size={14} className="text-emerald-500" />}
                        {isWrong && <XCircle size={14} className="text-red-500" />}
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {questions.length > 0 && (
        <div className="border-t border-border px-6 py-4 flex items-center gap-4">
          {quizSubmitted ? (
            <div className="text-[12px] font-semibold text-foreground">
              Score {quizScore}/{questions.length} ({quizPercent}%)
            </div>
          ) : (
            <div className="text-[12px] text-muted-foreground">Select options then submit.</div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {quizSubmitted && (
              <button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-foreground hover:bg-secondary"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={quizSubmitted || Object.keys(quizAnswers).length < questions.length}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium disabled:opacity-30"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
