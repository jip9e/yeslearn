"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Command as CommandIcon, PanelRightClose, PanelRightOpen, Library, X } from "lucide-react";

import { SpaceData, ChatMessage, ChatSession } from "./types";
import { SelectionToolbar } from "./components/SelectionToolbar";
import { SourceViewer } from "./components/SourceViewer";
import { ChatSection } from "./components/ChatSection";
import { CommandCenter } from "./components/CommandCenter";
import { ContentRail } from "./components/ContentRail";
import { ExplainPanel } from "./components/ExplainPanel";
import { PracticePanel } from "./components/PracticePanel";
import { LearnPanel } from "./components/LearnPanel";

let chatIdCounter = 0;
function nextChatId() {
  return `chat-${Date.now()}-${++chatIdCounter}`;
}

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
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizCount, setQuizCount] = useState(10);
  const [quizMode, setQuizMode] = useState<"qcu" | "qcm">("qcu");
  const [focusTab, setFocusTab] = useState<FocusTab>("content");

  const [rightPanelTab, setRightPanelTab] = useState<"learn" | "chat">("learn");
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [learnPanelError, setLearnPanelError] = useState<string | null>(null);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);

  // Content rail toggle
  const [railOpen, setRailOpen] = useState(true);

  // Responsive
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
          chatSessions: data.chatSessions || [],
          summaries: data.summaries || [],
          quizQuestions: data.quizQuestions || [],
        });

        // Load persisted sessions
        const loadedSessions: ChatSession[] = (data.chatSessions || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          messages: s.messages || [],
          createdAt: s.createdAt || s.created_at || new Date().toISOString(),
        }));
        setChatSessions(loadedSessions);

        // If there are sessions, activate the most recent one
        if (loadedSessions.length > 0) {
          const latest = loadedSessions[loadedSessions.length - 1];
          setActiveChatId(latest.id);
          setMessages(latest.messages);
        } else if (data.chatMessages?.length > 0) {
          // Orphan messages (from before sessions) — show them in a default session
          setMessages(data.chatMessages);
        }

        if (data.contentItems?.length > 0) setSelectedContent(data.contentItems[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [spaceId]);

  /* text selection handler */
  const handleTextSelection = useCallback(() => {
    // Small delay to let the selection finalize (especially on touch)
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();
      if (text && text.length > 2 && contentRef.current?.contains(sel?.anchorNode || null)) {
        const range = sel!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionToolbar({
          x: rect.left + rect.width / 2 - 140,
          y: rect.top,
          text,
        });
      } else if (!text) {
        setSelectionToolbar(null);
      }
    }, 10);
  }, []);

  // Dismiss toolbar when selection is fully cleared (not during active selection)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 3) {
      // Delay dismissal to avoid flickering during touch selection
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        const latestSel = window.getSelection();
        const latestText = latestSel?.toString().trim();
        if (!latestText || latestText.length < 3) {
          setSelectionToolbar(null);
        }
      }, 300);
    } else {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    }
  }, []);

  useEffect(() => {
    // mouseup for desktop, touchend for touch devices
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("touchend", handleTextSelection);
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("touchend", handleTextSelection);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleTextSelection, handleSelectionChange]);

  /* ── Handlers ────────────────────────────────────────── */

  const handleSendMessage = async (overrideInput?: string, explicitQuote?: string) => {
    const input = overrideInput ?? chatInput;
    if (!input.trim() || sendingChat) return;
    const quote = explicitQuote !== undefined ? explicitQuote : quotedText;
    const userMsg = quote ? `> ${quote}\n\n${input}` : input;
    setChatInput("");
    setQuotedText(null);
    setSendingChat(true);
    setFollowUps([]);
    setRightPanelTab("chat");
    setRightPanelOpen(true);

    let sessionId = activeChatId;
    let sessionName = input.slice(0, 40) + (input.length > 40 ? "..." : "");
    if (!sessionId) {
      sessionId = nextChatId();
      const newSession: ChatSession = { id: sessionId, name: sessionName, messages: [], createdAt: new Date().toISOString() };
      setChatSessions(prev => [...prev, newSession]);
      setActiveChatId(sessionId);
    } else {
      // Use existing session name
      const existing = chatSessions.find(s => s.id === sessionId);
      sessionName = existing?.name || sessionName;
    }

    try {
      const tempUserMsg: ChatMessage = { id: `temp-user-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role: "user", content: userMsg, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, tempUserMsg]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, role: "user", content: userMsg, sessionId, sessionName }),
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
    setRightPanelOpen(true);
    setQuotedText(text);
    setFollowUps([]);

    const sessionId = nextChatId();
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
    setRightPanelTab("chat");

    if (action === "explain") handleSendMessage("[Respond in the same language as the quoted text below] Explain this concept in detail:", text);
    else if (action === "summarize") handleSendMessage("[Respond in the same language as the quoted text below] Summarize this in simple terms:", text);
    else if (action === "quiz") handleSendMessage("[Respond in the same language as the quoted text below] Create a quick quiz question about this:", text);
  };

  const openChatSession = useCallback((session: ChatSession) => {
    setRightPanelTab("chat");
    setActiveChatId(session.id);
    setMessages(session.messages);
    setFollowUps(session.messages.length > 0 ? (session.messages[session.messages.length - 1].followUpQuestions || []) : []);
    setRightPanelOpen(true);
  }, []);

  const createNewChat = () => {
    const sessionId = nextChatId();
    const newSession: ChatSession = { id: sessionId, name: "New Chat", messages: [], createdAt: new Date().toISOString() };
    setChatSessions(prev => [...prev, newSession]);
    setActiveChatId(sessionId);
    setMessages([]);
    setFollowUps([]);
    setRightPanelTab("chat");
    setRightPanelOpen(true);
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
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spaceId, questionCount: quizCount, quizMode }) });
      const data = await res.json();
      if (data.questions && space) {
        const parsed = data.questions.map((q: any) => ({
          ...q,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          correctIndices: typeof q.correctIndices === "string" ? JSON.parse(q.correctIndices) : (q.correctIndices || [q.correctIndex]),
          quizMode: q.quizMode || data.quizMode || quizMode,
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
    return (
      <div className="h-screen flex items-center justify-center bg-background text-muted-foreground">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!space) return null;

  const selectedItem = space.contentItems.find((c) => c.id === selectedContent) || null;

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground">
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
            setRightPanelTab("chat");
            setRightPanelOpen(true);
          } else if (action === "learn") {
            setRightPanelTab("learn");
            setRightPanelOpen(true);
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

      {/* Content Rail Drawer Overlay */}
      {railOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setRailOpen(false)} />
          <aside
            className="relative z-50 w-[300px] max-w-[85vw] h-full bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <button
              onClick={() => setRailOpen(false)}
              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground z-10"
              aria-label="Close library"
            >
              <X size={16} />
            </button>
            <ContentRail
              space={space}
              selectedContent={selectedContent}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectItem={(id) => {
                setSelectedContent(id);
                setFocusTab("content");
                setRailOpen(false);
              }}
            />
          </aside>
        </div>
      )}

      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-border px-4 py-2 bg-background shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setRailOpen(!railOpen)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            aria-label="Open library"
          >
            <Library size={16} />
          </button>
          <span className="text-[13px] font-medium text-muted-foreground truncate">{space.name}</span>
          {selectedItem && <span className="text-muted-foreground/40">/</span>}
          {selectedItem && (
            <span className="text-[13px] font-semibold text-foreground truncate max-w-[280px]">
              {selectedItem.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCommandCenterOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <CommandIcon size={12} />
            Search
            <kbd className="text-[10px] text-muted-foreground/60 ml-1">⌘K</kbd>
          </button>
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors ${rightPanelOpen ? "bg-secondary" : ""}`}
            aria-label={rightPanelOpen ? "Hide panel" : "Show panel"}
          >
            {rightPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </header>

      {/* Content + Right panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Center: Main content area */}
        <section className="flex flex-1 flex-col min-w-0" ref={contentRef}>
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border bg-background px-3 pt-1">
            {(["content", "explain", "practice"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFocusTab(tab)}
                className={`px-3.5 py-2 text-[12px] font-medium capitalize transition-colors relative rounded-t-lg ${
                  focusTab === tab
                    ? "text-foreground bg-secondary/50"
                    : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                {tab}
                {focusTab === tab && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {focusTab === "content" && (
              selectedItem ? (
                <SourceViewer item={selectedItem} />
              ) : (
                <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
                  <button
                    onClick={() => setRailOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-[13px]"
                  >
                    <Library size={14} />
                    Open Library
                  </button>
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
                quizCount={quizCount}
                setQuizCount={setQuizCount}
                quizMode={quizMode}
                setQuizMode={setQuizMode}
              />
            )}
          </div>
        </section>

        {/* Right panel - slides in/out */}
        <aside
          className={`border-l border-border bg-card flex flex-col shrink-0 transition-all duration-300 ease-out overflow-hidden ${
            isMobile
              ? rightPanelOpen
                ? "fixed inset-0 z-50 w-full"
                : "fixed right-0 inset-y-0 z-50 w-0"
              : rightPanelOpen
                ? "w-[400px]"
                : "w-0"
          }`}
        >
          <div className="flex flex-col h-full min-w-[400px] max-md:min-w-full">
            {/* Panel tab bar */}
            <div className="flex items-center border-b border-border shrink-0 bg-card">
              <button
                onClick={() => setRightPanelTab("learn")}
                className={`flex-1 px-4 py-2.5 text-[12px] font-medium text-center transition-colors relative ${
                  rightPanelTab === "learn" ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                Learn
                {rightPanelTab === "learn" && (
                  <span className="absolute bottom-0 left-6 right-6 h-[2px] bg-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => { setRightPanelTab("chat"); if (!activeChatId) createNewChat(); }}
                className={`flex-1 px-4 py-2.5 text-[12px] font-medium text-center transition-colors relative ${
                  rightPanelTab === "chat" ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
                }`}
              >
                Chat
                {rightPanelTab === "chat" && (
                  <span className="absolute bottom-0 left-6 right-6 h-[2px] bg-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => setRightPanelOpen(false)}
                className="px-3 py-2.5 text-muted-foreground/40 hover:text-foreground transition-colors"
                aria-label="Close panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {rightPanelTab === "learn" ? (
                <LearnPanel
                  space={space}
                  learnPanelError={learnPanelError}
                  generatingSummary={generatingSummary}
                  handleGenerateSummary={handleGenerateSummary}
                  generatingQuiz={generatingQuiz}
                  handleGenerateQuiz={handleGenerateQuiz}
                  quizAnswers={quizAnswers}
                  setQuizAnswers={setQuizAnswers}
                  quizSubmitted={quizSubmitted}
                  setQuizSubmitted={setQuizSubmitted}
                  quizCount={quizCount}
                  setQuizCount={setQuizCount}
                  quizMode={quizMode}
                  setQuizMode={setQuizMode}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  handleSendMessage={() => handleSendMessage()}
                  sendingChat={sendingChat}
                  chatSessions={chatSessions}
                  openChatSession={openChatSession}
                />
              ) : (
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
                  chatSessions={chatSessions}
                  activeChatId={activeChatId}
                  openChatSession={openChatSession}
                  createNewChat={createNewChat}
                />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
