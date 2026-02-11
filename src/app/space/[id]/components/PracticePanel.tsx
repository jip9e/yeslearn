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
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-3 text-[12px] uppercase tracking-[0.3em] text-zinc-500">
        <span>Practice</span>
        <button
          onClick={handleGenerateQuiz}
          disabled={generatingQuiz}
          className="flex items-center gap-2 border border-zinc-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-zinc-600 disabled:opacity-40"
        >
          {generatingQuiz ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
          {questions.length ? "Refresh" : "Generate"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {questions.length === 0 ? (
          <div className="max-w-sm text-[13px] text-zinc-500">No quiz ready. Generate a practice set to drill this space.</div>
        ) : (
          questions.map((question, qIndex) => {
            const answered = quizAnswers[qIndex] !== undefined;
            const correct = quizSubmitted && quizAnswers[qIndex] === question.correctIndex;
            const wrong = quizSubmitted && answered && quizAnswers[qIndex] !== question.correctIndex;
            return (
              <div key={question.id} className="border border-zinc-800 bg-zinc-900 px-5 py-4 text-[13px]">
                <p className="font-semibold text-zinc-100 mb-3">
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
                        className={`flex w-full items-center gap-2 border px-3 py-2 text-left text-[12px] transition ${
                          isCorrect
                            ? "border-emerald-400 text-emerald-300"
                            : isWrong
                            ? "border-red-500 text-red-400"
                            : isSelected
                            ? "border-zinc-50 bg-zinc-50/5 text-zinc-50"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        {isCorrect && <CheckCircle2 size={14} className="text-emerald-400" />}
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
        <div className="border-t border-zinc-900 px-6 py-4 flex items-center gap-4">
          {quizSubmitted ? (
            <div className="text-[12px] font-semibold text-zinc-200">
              Score {quizScore}/{questions.length} ({quizPercent}%)
            </div>
          ) : (
            <div className="text-[12px] text-zinc-500">Select options then submit.</div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {quizSubmitted && (
              <button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                }}
                className="border border-zinc-700 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-200"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => setQuizSubmitted(true)}
              disabled={quizSubmitted || Object.keys(quizAnswers).length < questions.length}
              className="border border-white/40 px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-50 disabled:opacity-30"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
