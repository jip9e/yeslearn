"use client";
import React from "react";
import { Loader2, Target, Sparkles, Compass, MessageSquare } from "lucide-react";
import { SpaceData, ChatSession } from "../types";

interface StudyStackProps {
  space: SpaceData;
  generatingSummary: boolean;
  generatingQuiz: boolean;
  handleGenerateSummary: () => void;
  handleGenerateQuiz: () => void;
  summariesReady: boolean;
  quizReady: boolean;
  followUps: string[];
  chatSessions: ChatSession[];
  openChatSession: (session: ChatSession) => void;
  setIsCommandCenterOpen: (value: boolean) => void;
}

export function StudyStack({
  space,
  generatingSummary,
  generatingQuiz,
  handleGenerateSummary,
  handleGenerateQuiz,
  summariesReady,
  quizReady,
  followUps,
  chatSessions,
  openChatSession,
  setIsCommandCenterOpen,
}: StudyStackProps) {
  const tasks = [
    {
      label: "Summary",
      ready: summariesReady,
      action: handleGenerateSummary,
      loading: generatingSummary,
    },
    {
      label: "Practice",
      ready: quizReady,
      action: handleGenerateQuiz,
      loading: generatingQuiz,
    },
  ];

  return (
    <div className="flex h-full flex-col border-l border-zinc-900 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-900 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
        Study Stack
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        <section>
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Quick actions</div>
          <div className="space-y-2">
            <button
              onClick={() => setIsCommandCenterOpen(true)}
              className="flex w-full items-center justify-between border border-zinc-800 px-4 py-3 text-left text-[12px] uppercase tracking-[0.3em] text-zinc-100 hover:border-zinc-600"
            >
              <span className="flex items-center gap-3">
                <Compass size={14} />
                Command
              </span>
              <span className="text-[10px] text-zinc-500">⌘K</span>
            </button>
          </div>
        </section>

        <section>
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Automations</div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task.label}
                onClick={task.action}
                disabled={task.loading}
                className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[12px] uppercase tracking-[0.2em] ${
                  task.ready ? "border-zinc-700 text-zinc-200" : "border-zinc-800 text-zinc-400"
                }`}
              >
                <span className="flex items-center gap-3">
                  {task.label === "Summary" ? <Sparkles size={14} /> : <Target size={14} />}
                  {task.label}
                </span>
                {task.loading ? <Loader2 size={14} className="animate-spin" /> : task.ready ? "Ready" : "Run"}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Chat sessions</div>
          {chatSessions.length === 0 ? (
            <p className="text-[12px] text-zinc-500">Start a chat via the assistant to pin it here.</p>
          ) : (
            <div className="space-y-1">
              {chatSessions.slice(-5).reverse().map((session) => (
                <button
                  key={session.id}
                  onClick={() => openChatSession(session)}
                  className="flex w-full items-center gap-2 border border-zinc-800 px-3 py-2 text-left text-[12px] text-zinc-300 hover:border-zinc-600"
                >
                  <MessageSquare size={12} />
                  <span className="line-clamp-1">{session.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Follow ups</div>
          {followUps.length === 0 ? (
            <p className="text-[12px] text-zinc-500">No pending AI follow-ups.</p>
          ) : (
            <ul className="space-y-2 text-[12px] text-zinc-200">
              {followUps.map((item, idx) => (
                <li key={`${item}-${idx}`} className="border border-zinc-800 px-3 py-2 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Space stats</div>
          <div className="border border-zinc-800 px-4 py-3 text-[12px] text-zinc-300">
            <div className="flex items-center justify-between">
              <span>Assets</span>
              <span>{space.contentItems.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Summaries</span>
              <span>{space.summaries?.length || 0}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Quiz Questions</span>
              <span>{space.quizQuestions?.length || 0}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
