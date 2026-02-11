"use client";
import React, { useRef } from "react";
import { BookOpen, MessageSquare, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AIPanelTab, ChatSession } from "../types";

interface AIPanelProps {
  isMobile: boolean;
  aiPanelOpen: boolean;
  setAIPanelOpen: (val: boolean) => void;
  aiPanelWidth: number;
  aiPanelTab: AIPanelTab;
  setAIPanelTab: (val: AIPanelTab) => void;
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  activeChatId: string | null;
  openChatSession: (session: ChatSession) => void;
  createNewChat: () => void;
  children: React.ReactNode;
  showLearnTab?: boolean;
}

export function AIPanel({
  isMobile,
  aiPanelOpen,
  setAIPanelOpen,
  aiPanelWidth,
  aiPanelTab,
  setAIPanelTab,
  chatSessions,
  setChatSessions,
  activeChatId,
  openChatSession,
  createNewChat,
  children,
  showLearnTab = true,
}: AIPanelProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTablistKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tablist = tabListRef.current;
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll<HTMLElement>("[role='tab']"));
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex < 0) return;

    const focusAndActivate = (index: number) => {
      const nextTab = tabs[index];
      if (!nextTab) return;
      nextTab.focus();
      nextTab.click();
    };

    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAndActivate((currentIndex + 1) % tabs.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAndActivate((currentIndex - 1 + tabs.length) % tabs.length);
    }
  };

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.div
          initial={isMobile ? { x: "100%" } : { opacity: 0, scale: 0.95, x: 20 }}
          animate={isMobile ? { x: 0 } : { opacity: 1, scale: 1, x: 0 }}
          exit={isMobile ? { x: "100%" } : { opacity: 0, scale: 0.95, x: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`
            fixed z-50 flex flex-col bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden
            ${isMobile 
              ? "inset-0"
              : "right-6 bottom-6 max-h-[80vh]"}
          `}
          style={isMobile ? undefined : { width: aiPanelWidth }}
        >
          {/* Header / Tab bar */}
          <div className="border-b border-zinc-900 bg-zinc-950/80">
            <div className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-[0.4em] text-zinc-500">
              <span>Assistant</span>
              <button
                onClick={() => setAIPanelOpen(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X size={14} />
              </button>
            </div>

            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Assistant tabs"
              onKeyDown={handleTablistKeyDown}
              className="flex items-center gap-0.5 border-t border-zinc-900"
            >
              {showLearnTab && (
                <button
                  role="tab"
                  id="learn-tab"
                  type="button"
                  aria-selected={aiPanelTab === "learn"}
                  onClick={() => setAIPanelTab("learn")}
                  className={`flex items-center gap-2 px-4 py-3 text-[12px] font-medium uppercase tracking-[0.2em] transition-all ${
                    aiPanelTab === "learn" ? "text-zinc-50 border-b border-zinc-50" : "text-zinc-500"
                  }`}
                >
                  <BookOpen size={12} />
                  Learn
                </button>
              )}

              {chatSessions.slice(-2).map((session) => (
                <div
                  key={session.id}
                  role="tab"
                  onClick={() => openChatSession(session)}
                  className={`group flex items-center gap-2 px-4 py-3 text-[12px] font-medium uppercase tracking-[0.2em] cursor-pointer ${
                    aiPanelTab === "chat" && activeChatId === session.id ? "text-zinc-50 border-b border-zinc-50" : "text-zinc-500"
                  }`}
                >
                  <MessageSquare size={12} className="shrink-0" />
                  <span className="truncate max-w-[80px]">{session.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatSessions((prev) => prev.filter((s) => s.id !== session.id));
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              <button
                onClick={createNewChat}
                className="ml-auto px-3 py-3 text-[12px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50/30 dark:bg-zinc-900/30">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
