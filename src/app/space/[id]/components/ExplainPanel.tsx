"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, RefreshCcw } from "lucide-react";
import { SpaceData } from "../types";

interface ExplainPanelProps {
  space: SpaceData;
  generatingSummary: boolean;
  handleGenerateSummary: () => void;
  learnPanelError: string | null;
}

export function ExplainPanel({ space, generatingSummary, handleGenerateSummary, learnPanelError }: ExplainPanelProps) {
  const summaries = space.summaries || [];

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-900 px-6 py-3 text-[12px] uppercase tracking-[0.3em] text-zinc-500">
        <span>Explain</span>
        <button
          onClick={handleGenerateSummary}
          disabled={generatingSummary}
          className="flex items-center gap-2 border border-zinc-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-zinc-600 disabled:opacity-40"
        >
          {generatingSummary ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
          {summaries.length ? "Regenerate" : "Generate"}
        </button>
      </div>

      {learnPanelError && (
        <div className="border-b border-red-500/40 px-6 py-3 text-[12px] text-red-400">
          {learnPanelError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {summaries.length === 0 ? (
          <div className="max-w-sm text-[13px] text-zinc-500">
            No summary yet. Generate one to get a clean brief of this space.
          </div>
        ) : (
          <div className="space-y-8">
            {summaries.map((summary) => (
              <article key={summary.id} className="border border-zinc-800 bg-zinc-950 px-5 py-5 text-[13px] leading-relaxed text-zinc-200">
                <header className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  {summary.title || "Summary"}
                </header>
                <div className="prose prose-invert max-w-none prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary.content}</ReactMarkdown>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
