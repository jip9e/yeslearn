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
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-border px-6 py-3 text-[12px] text-muted-foreground">
        <span className="font-medium">Explain</span>
        <button
          onClick={handleGenerateSummary}
          disabled={generatingSummary}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-foreground transition hover:bg-secondary disabled:opacity-40"
        >
          {generatingSummary ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
          {summaries.length ? "Regenerate" : "Generate"}
        </button>
      </div>

      {learnPanelError && (
        <div className="border-b border-destructive/40 px-6 py-3 text-[12px] text-destructive">
          {learnPanelError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {summaries.length === 0 ? (
          <div className="max-w-sm text-[13px] text-muted-foreground">
            No summary yet. Generate one to get a clean brief of this space.
          </div>
        ) : (
          <div className="space-y-6">
            {summaries.map((summary) => (
              <article key={summary.id} className="border border-border bg-card rounded-xl px-5 py-5 text-[13px] leading-relaxed text-foreground">
                <header className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {summary.title || "Summary"}
                </header>
                <div className="prose-ai max-w-none">
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
