"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Command as CommandIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { SpaceData, ChatMessage, ChatSession, AIPanelTab } from "./types";
import { SelectionToolbar } from "./components/SelectionToolbar";
import { SourceViewer } from "./components/SourceViewer";
import { AIPanel } from "./components/AIPanel";
import { ChatSection } from "./components/ChatSection";
import { CommandCenter } from "./components/CommandCenter";
import { ContentRail } from "./components/ContentRail";
import { ExplainPanel } from "./components/ExplainPanel";
import { PracticePanel } from "./components/PracticePanel";
import { StudyStack } from "./components/StudyStack";

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  type FocusTab = "content" | "explain" | "practice";

  /* state */
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizCount] = useState(5);
  const [focusTab, setFocusTab] = useState<FocusTab>("content");

  const [aiPanelOpen, setAIPanelOpen] = useState(true);
  const [aiPanelTab, setAIPanelTab] = useState<AIPanelTab>("chat");
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [learnPanelError, setLearnPanelError] = useState<string | null>(null);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);

  // Chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);

  // AIPanel Width
  const [aiPanelWidth, setAiPanelWidth] = useState(420);

  // Responsive: detect phone screens
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* fetch space */
  useEffect(() => {
    fetch(`/api/spaces/${spaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setSpace({
          ...data,
          contentItems: data.contentItems || [],
          chatMessages: data.chatMessages || [],
          summaries: data.summaries || [],
          quizQuestions: data.quizQuestions || [],
        });
        setMessages(data.chatMessages || []);
        if (data.contentItems?.length > 0) setSelectedContent(data.contentItems[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [spaceId]);

  /* text selection handler */
  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 2 && contentRef.current?.contains(sel?.anchorNode || null)) {
      const range = sel!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionToolbar({
        x: rect.left + rect.width / 2 - 140,
        y: rect.top + window.scrollY - 60,
        text,
      });
    } else {
      setTimeout(() => setSelectionToolbar(null), 200);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [handleTextSelection]);

  /* ── Handlers ────────────────────────────────────────── */

  const handleSendMessage = async (overrideInput?: string) => {
    const input = overrideInput ?? chatInput;
    if (!input.trim() || sendingChat) return;
    const userMsg = quotedText ? `> ${quotedText}\n\n${input}` : input;
    setChatInput("");
    setQuotedText(null);
    setSendingChat(true);
    setFollowUps([]);
    setAIPanelTab("chat");
    setAIPanelOpen(true);

    let sessionId = activeChatId;
    if (!sessionId) {
      sessionId = `chat-${Date.now()}`;
      const sessionName = input.slice(0, 40) + (input.length > 40 ? "..." : "");
      const newSession: ChatSession = { id: sessionId, name: sessionName, messages: [], createdAt: new Date().toISOString() };
      setChatSessions(prev => [...prev, newSession]);
      setActiveChatId(sessionId);
    }

    try {
      const tempUserMsg: ChatMessage = { id: "temp-user", role: "user", content: userMsg, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, tempUserMsg]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, role: "user", content: userMsg }),
      });
      const data = await res.json();

      if (data.userMessage && data.aiMessage) {
        const aiMsg: ChatMessage = {
          ...data.aiMessage,
          sources: data.sources || [],
          followUpQuestions: data.followUpQuestions || [],
        };
        setMessages((prev) => {
          const newMsgs = [...prev.filter((m) => m.id !== "temp-user"), data.userMessage, aiMsg];
          setChatSessions(ps => ps.map(s => s.id === sessionId ? { ...s, messages: newMsgs } : s));
          return newMsgs;
        });
        setFollowUps(data.followUpQuestions || []);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== "temp-user"));
    } finally {
      setSendingChat(false);
    }
  };

  const handleSelectionAction = (action: string, text: string) => {
    setAIPanelOpen(true);
    setQuotedText(text);
    setFollowUps([]);

    const sessionId = `chat-${Date.now()}`;
    const actionLabels: Record<string, string> = {
      explain: "Explain: " + text.slice(0, 30) + "...",
      summarize: "Summarize: " + text.slice(0, 30) + "...",
      quiz: "Quiz: " + text.slice(0, 30) + "...",
      chat: "Chat: " + text.slice(0, 30) + "...",
    };
    const sessionName = actionLabels[action] || text.slice(0, 40);
    const newSession: ChatSession = { id: sessionId, name: sessionName, messages: [], createdAt: new Date().toISOString() };
    setChatSessions(prev => [...prev, newSession]);
    setActiveChatId(sessionId);
    setMessages([]);
    setAIPanelTab("chat");

    if (action === "explain") handleSendMessage("Explain this concept in detail:");
    else if (action === "summarize") handleSendMessage("Summarize this in simple terms:");
    else if (action === "quiz") handleSendMessage("Create a quick quiz question about this:");
  };

  const openChatSession = useCallback((session: ChatSession) => {
    setAIPanelTab("chat");
    setActiveChatId(session.id);
    setMessages(session.messages);
    setFollowUps(session.messages.length > 0 ? (session.messages[session.messages.length - 1].followUpQuestions || []) : []);
    setAIPanelOpen(true);
  }, []);

  const createNewChat = () => {
    const sessionId = `chat-${Date.now()}`;
    const newSession: ChatSession = { id: sessionId, name: "New Chat", messages: [], createdAt: new Date().toISOString() };
    setChatSessions(prev => [...prev, newSession]);
    setActiveChatId(sessionId);
    setMessages([]);
    setFollowUps([]);
    setAIPanelTab("chat");
    setAIPanelOpen(true);
  };

  const handleGenerateSummary = async () => {
    if (generatingSummary) return;
    setLearnPanelError(null);
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spaceId }) });
      const data = await res.json();
      if (data.summaries && space) {
        setSpace({ ...space, summaries: data.summaries });
      } else if (data.error) {
        setLearnPanelError(data.error);
      }
    } catch {
      setLearnPanelError("Failed to generate summary.");
    } finally { setGeneratingSummary(false); }
  };

  const handleGenerateQuiz = async () => {
    if (generatingQuiz) return;
    setLearnPanelError(null);
    setGeneratingQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spaceId, questionCount: quizCount }) });
      const data = await res.json();
      if (data.questions && space) {
        const parsed = data.questions.map((q: any) => ({
          ...q, options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        }));
        setSpace({ ...space, quizQuestions: parsed });
      } else if (data.error) {
        setLearnPanelError(data.error);
      }
    } catch {
      setLearnPanelError("Failed to generate quiz.");
    } finally { setGeneratingQuiz(false); }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-zinc-500"><Loader2 size={24} className="animate-spin" /></div>;
  }

  if (!space) return null;

  const selectedItem = space.contentItems.find((c) => c.id === selectedContent) || null;
  const summariesReady = Boolean(space.summaries && space.summaries.length > 0);
  const quizReady = Boolean(space.quizQuestions && space.quizQuestions.length > 0);

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100">
      <CommandCenter 
        isOpen={isCommandCenterOpen}
        setIsOpen={setIsCommandCenterOpen}
        sources={space.contentItems}
        onSelectSource={(id) => {
          setSelectedContent(id);
          setFocusTab("content");
        }}
        onAction={(action) => {
          if (action === "chat") {
            setAIPanelTab("chat");
            setAIPanelOpen(true);
          } else if (action === "learn") {
            setFocusTab("explain");
          }
        }}
      />

      {selectionToolbar && (
        <SelectionToolbar
          position={{ x: selectionToolbar.x, y: selectionToolbar.y }}
          text={selectionToolbar.text}
          onAction={handleSelectionAction}
          onClose={() => setSelectionToolbar(null)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-900 px-8 py-3 text-[12px] uppercase tracking-[0.35em] text-zinc-500">
          <div className="flex items-center gap-3 text-zinc-400">
            <span>{space.name}</span>
            {selectedItem && (
              <span className="text-zinc-600">/</span>
            )}
            {selectedItem && <span className="text-zinc-200 truncate max-w-[320px] normal-case tracking-normal font-medium">{selectedItem.name}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCommandCenterOpen(true)}
              className="flex items-center gap-2 border border-zinc-800 px-4 py-2 text-[11px] font-semibold tracking-[0.3em] text-zinc-200"
            >
              <CommandIcon size={14} />
              Search
              <span className="text-[10px] text-zinc-500">⌘K</span>
            </button>
            <button
              onClick={() => setAIPanelOpen(true)}
              className="border border-zinc-800 px-4 py-2 text-[11px] font-semibold tracking-[0.3em] text-zinc-200"
            >
              Assistant
            </button>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="border-r border-zinc-900">
            <ContentRail
              space={space}
              selectedContent={selectedContent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectItem={(id) => {
                setSelectedContent(id);
                setFocusTab("content");
              }}
            />
          </aside>

          <section className="flex flex-col border-r border-zinc-900" ref={contentRef}>
            <div className="flex items-center border-b border-zinc-900 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
              {["content", "explain", "practice"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFocusTab(tab as FocusTab)}
                  className={`px-5 py-3 ${focusTab === tab ? "text-zinc-100 border-b border-zinc-100" : "text-zinc-600"}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {focusTab === "content" && (
                selectedItem ? (
                  <SourceViewer item={selectedItem} />
                ) : (
                  <div className="flex h-full items-center justify-center text-[12px] text-zinc-500">
                    Select something from the left rail.
                  </div>
                )
              )}
              {focusTab === "explain" && (
                <ExplainPanel
                  space={space}
                  generatingSummary={generatingSummary}
                  handleGenerateSummary={handleGenerateSummary}
                  learnPanelError={learnPanelError}
                />
              )}
              {focusTab === "practice" && (
                <PracticePanel
                  space={space}
                  quizAnswers={quizAnswers}
                  setQuizAnswers={setQuizAnswers}
                  quizSubmitted={quizSubmitted}
                  setQuizSubmitted={setQuizSubmitted}
                  generatingQuiz={generatingQuiz}
                  handleGenerateQuiz={handleGenerateQuiz}
                />
              )}
            </div>
          </section>

          <aside>
            <StudyStack
              space={space}
              generatingSummary={generatingSummary}
              generatingQuiz={generatingQuiz}
              handleGenerateSummary={handleGenerateSummary}
              handleGenerateQuiz={handleGenerateQuiz}
              summariesReady={summariesReady}
              quizReady={quizReady}
              followUps={followUps}
              chatSessions={chatSessions}
              openChatSession={openChatSession}
              setIsCommandCenterOpen={setIsCommandCenterOpen}
            />
          </aside>
        </div>
      </div>

      <AIPanel
        isMobile={isMobile}
        aiPanelOpen={aiPanelOpen}
        setAIPanelOpen={setAIPanelOpen}
        aiPanelWidth={aiPanelWidth}
        aiPanelTab={aiPanelTab}
        setAIPanelTab={setAIPanelTab}
        chatSessions={chatSessions}
        setChatSessions={setChatSessions}
        activeChatId={activeChatId}
        openChatSession={openChatSession}
        createNewChat={createNewChat}
        showLearnTab={false}
      >
        <ChatSection
          messages={messages}
          sendingChat={sendingChat}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendMessage={handleSendMessage}
          quotedText={quotedText}
          setQuotedText={setQuotedText}
          followUps={followUps}
          chatEndRef={chatEndRef}
        />
      </AIPanel>
    </div>
  );
}
