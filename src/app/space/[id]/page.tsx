"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/PDFViewer"), { ssr: false });
import {
  ArrowLeft,
  Plus,
  Send,
  FileText,
  Youtube,
  Globe,
  Mic,
  MessageSquare,
  BookOpen,
  Brain,
  Headphones,
  Trash2,
  Search,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  RotateCcw,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Lightbulb,
  Maximize2,
  Minimize2,
  Hash,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/* ────────────────────────── Types ────────────────────────── */

interface ContentItem {
  id: string;
  name: string;
  type: string;
  sourceUrl?: string;
  extractedText?: string;
  metadata?: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
  sources?: { index: number; name: string }[];
  followUpQuestions?: string[];
}

interface Summary {
  id: string;
  title: string;
  content: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface SpaceData {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  contentItems: ContentItem[];
  chatMessages: ChatMessage[];
  summaries: Summary[];
  quizQuestions: QuizQuestion[];
}

type AIPanelTab = "learn" | "chat";

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
}

/* ────────────────────────── Helpers ─────────────────────── */

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  youtube: Youtube,
  pdf: FileText,
  website: Globe,
  audio: Mic,
  text: FileText,
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getYoutubeEmbedUrl(sourceUrl: string): string | null {
  try {
    const url = new URL(sourceUrl);
    let videoId = "";
    if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") || "";
    } else if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

/* ──────────────── CopyButton ────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Copy">
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-[#999]" />}
    </button>
  );
}

/* ──────────────── ToolCard ──────────────────── */

function ToolCard({ icon, label, color, onClick, loading, description }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void; loading?: boolean; description?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 group-hover:scale-110 transition-transform shadow-sm">
        {loading ? (
          <Loader2 size={18} className="animate-spin text-gray-600 dark:text-gray-400" />
        ) : (
          <span className="text-gray-700 dark:text-gray-300">{icon}</span>
        )}
      </div>
      <div className="text-left min-w-0 flex-1">
        <span className="text-[14px] font-medium text-gray-900 dark:text-white block">{label}</span>
        {description && <span className="text-[12px] text-gray-500 dark:text-gray-400 block mt-0.5">{description}</span>}
      </div>
    </button>
  );
}

/* ──────────── Selection Toolbar ──────────────── */

function SelectionToolbar({ position, text, onAction, onClose }: {
  position: { x: number; y: number };
  text: string;
  onAction: (action: string, text: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const actions = [
    { id: "explain", label: "Explain", icon: <Lightbulb size={13} /> },
    { id: "summarize", label: "Summarize", icon: <FileText size={13} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={13} /> },
    { id: "quiz", label: "Quiz", icon: <Brain size={13} /> },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1200);
  };

  // Clamp position within viewport — place well above selection so it doesn't block extending it
  const toolbarHeight = 44;
  const gap = 12;
  const rawY = position.y - toolbarHeight - gap;
  const clampedX = Math.max(8, Math.min(position.x, window.innerWidth - 420));
  const clampedY = Math.max(8, rawY);

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#e0e0e0] dark:border-[#333] px-2 py-1.5 animate-in fade-in zoom-in-95 duration-150"
      style={{ left: clampedX, top: clampedY }}
    >
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#555] dark:text-[#aaa] hover:bg-[#f0f0f0] dark:hover:bg-[#222] hover:text-black dark:hover:text-white transition-colors"
      >
        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#333]" />
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => { onAction(a.id, text); onClose(); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#555] dark:text-[#aaa] hover:bg-[#f0f0f0] dark:hover:bg-[#222] hover:text-black dark:hover:text-white transition-colors"
        >
          {a.icon} {a.label}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════ MAIN ═══════════════════════════ */

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* state */
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sendingChat, setSendingChat] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizCount, setQuizCount] = useState(5);

  const [aiPanelOpen, setAIPanelOpen] = useState(true);
  const [aiPanelTab, setAIPanelTab] = useState<AIPanelTab>("learn");
  const [selectedText, setSelectedText] = useState("");
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionResults, setMentionResults] = useState<ContentItem[]>([]);

  // Chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);

  // Resizable panel state
  const [aiPanelWidth, setAiPanelWidth] = useState(420);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Responsive: detect narrow screens (iPad / mobile)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* scroll chat */
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (aiPanelTab === "chat") scrollToBottom();
  }, [messages, aiPanelTab, scrollToBottom]);

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

  /* text selection handler — works for mouse and touch */
  const handleTextSelection = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 2 && contentRef.current?.contains(sel?.anchorNode || null)) {
      const range = sel!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionToolbar({
        x: rect.left + rect.width / 2 - 140,
        y: rect.top + window.scrollY,
        text,
      });
      setSelectedText(text);
    } else {
      // delay to allow button click to register
      setTimeout(() => setSelectionToolbar(null), 200);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    // Touch support: selectionchange fires after long-press selection on mobile
    let touchTimer: ReturnType<typeof setTimeout> | null = null;
    const handleSelectionChange = () => {
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(handleTextSelection, 300);
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (touchTimer) clearTimeout(touchTimer);
    };
  }, [handleTextSelection]);

  /* ── Resize drag handlers ────────────────────────────── */
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragRef.current = { startX: clientX, startWidth: aiPanelWidth };
    setIsDragging(true);
  }, [aiPanelWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const delta = dragRef.current.startX - clientX;
      const containerW = mainContainerRef.current?.offsetWidth || 1200;
      const minW = 280;
      const maxW = Math.min(containerW * 0.7, 800);
      setAiPanelWidth(Math.max(minW, Math.min(maxW, dragRef.current.startWidth + delta)));
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  /* ── handlers ─────────────────────────────────────────── */

  const handleSendMessage = async (overrideInput?: string) => {
    const input = overrideInput ?? chatInput;
    if (!input.trim() || sendingChat) return;
    const userMsg = quotedText ? `> ${quotedText}\n\n${input}` : input;
    setChatInput("");
    setQuotedText(null);
    setSendingChat(true);
    setFollowUps([]);

    // Auto-switch to chat tab
    setAIPanelTab("chat");

    // Create or use active chat session
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

      // Also update session
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, tempUserMsg] } : s));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, role: "user", content: userMsg }),
      });
      const data = await res.json();

      if (data.userMessage && data.aiMessage) {
        // Attach sources and follow-ups to AI message
        const aiMsg: ChatMessage = {
          ...data.aiMessage,
          sources: data.sources || [],
          followUpQuestions: data.followUpQuestions || [],
        };
        const newMsgs = [...messages.filter((m) => m.id !== "temp-user"), data.userMessage, aiMsg];
        setMessages(newMsgs);
        setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: newMsgs } : s));
        setFollowUps(data.followUpQuestions || []);
      } else {
        setMessages((prev) => [...prev.filter((m) => m.id !== "temp-user"), data]);
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

    // Create a new chat session for the action
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

    if (action === "explain") {
      setChatInput("Explain this concept in detail:");
    } else if (action === "summarize") {
      setChatInput("Summarize this in simple terms:");
    } else if (action === "quiz") {
      setChatInput("Create a quick quiz question about this:");
    } else {
      setChatInput("");
    }
  };

  const handleGenerateSummary = async () => {
    if (generatingSummary) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spaceId }) });
      const data = await res.json();
      if (data.summaries && space) setSpace({ ...space, summaries: data.summaries });
      else if (data.error) alert(data.error);
    } catch { alert("Failed to generate summary."); }
    finally { setGeneratingSummary(false); }
  };

  const handleGenerateQuiz = async () => {
    if (generatingQuiz) return;
    setGeneratingQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spaceId, questionCount: quizCount }) });
      const data = await res.json();
      if (data.questions && space) {
        const parsed = data.questions.map((q: { id: string; question: string; options: string | string[]; correctIndex: number }) => ({
          ...q, options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        }));
        setSpace({ ...space, quizQuestions: parsed });
      } else if (data.error) alert(data.error);
    } catch { alert("Failed to generate quiz."); }
    finally { setGeneratingQuiz(false); }
  };

  const handleDeleteContent = async (contentId: string) => {
    setDeleting(contentId);
    try {
      await fetch(`/api/content/${contentId}`, { method: "DELETE" });
      setSpace((prev) => prev ? { ...prev, contentItems: prev.contentItems.filter((c) => c.id !== contentId) } : null);
      if (selectedContent === contentId) setSelectedContent(space?.contentItems.find((c) => c.id !== contentId)?.id || null);
    } finally { setDeleting(null); }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube": return <Youtube size={14} />;
      case "pdf": return <FileText size={14} />;
      case "website": return <Globe size={14} />;
      case "audio": return <Mic size={14} />;
      default: return <FileText size={14} />;
    }
  };

  /* ── Loading / Not Found ──────────────────────────────── */

  if (loading) {
    return <div className="h-full flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]"><Loader2 size={24} className="animate-spin text-[#999]" /></div>;
  }

  if (!space) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-[#fafafa] dark:bg-[#0a0a0a]">
        <p className="text-[16px] font-medium">Space not found</p>
        <Link href="/dashboard" className="text-[13px] text-[#999] hover:text-black">← Back to Dashboard</Link>
      </div>
    );
  }

  const selectedItem = space.contentItems.find((c) => c.id === selectedContent);
  const filteredItems = space.contentItems.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const quizScore = (space.quizQuestions || []).filter((q, i) => quizAnswers[i] === q.correctIndex).length;
  const quizTotal = (space.quizQuestions || []).length;
  const quizPercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;

  /* ════════════════════════ RENDER ══════════════════════ */

  return (
    <div className="h-full flex bg-white dark:bg-[#0a0a0a]" ref={mainContainerRef}>

        {/* ═══ Selection Toolbar (floating) ═══ */}
        {selectionToolbar && (
          <SelectionToolbar
            position={{ x: selectionToolbar.x, y: selectionToolbar.y }}
            text={selectionToolbar.text}
            onAction={handleSelectionAction}
            onClose={() => setSelectionToolbar(null)}
          />
        )}

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-all duration-300 flex flex-col" ref={contentRef}>
          {selectedItem ? (
            <>
              {/* Compact content header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400"
                    title="Back to content list"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400">{getTypeIcon(selectedItem.type)}</span>
                  <h2 className="text-[13px] font-medium text-gray-900 dark:text-white truncate">{selectedItem.name}</h2>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/add?spaceId=${space.id}`}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400"
                    title="Add Content"
                  >
                    <Plus size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDeleteContent(selectedItem.id)} 
                    disabled={deleting === selectedItem.id} 
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400"
                  >
                    {deleting === selectedItem.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* PDF Viewer — custom react-pdf renderer with text selection */}
              {selectedItem.type === "pdf" && (
                <div className="flex-1 min-h-0">
                  <PDFViewer
                    url={`/api/content/${selectedItem.id}/file`}
                    title={selectedItem.name}
                  />
                </div>
              )}

              {/* YouTube Embed with enhanced transcript view */}
              {selectedItem.type === "youtube" && selectedItem.sourceUrl && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Video player */}
                  <div className="aspect-video w-full bg-black shrink-0">
                    {getYoutubeEmbedUrl(selectedItem.sourceUrl) ? (
                      <iframe 
                        src={getYoutubeEmbedUrl(selectedItem.sourceUrl)!} 
                        className="w-full h-full" 
                        allowFullScreen 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-white/60 text-sm">Could not load video</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Transcript/Chapters section (like youlearn.ai) */}
                  {selectedItem.extractedText && (
                    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <button className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-[14px] font-medium">
                            Chapters
                          </button>
                          <button className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 text-[14px] font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Transcripts
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Sample chapter format - in real app, parse from transcript */}
                          <div className="group cursor-pointer">
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <span className="text-[13px] font-mono text-gray-500 dark:text-gray-400 shrink-0">00:00</span>
                              <div className="flex-1">
                                <h4 className="text-[14px] font-medium text-gray-900 dark:text-white mb-1">Introduction</h4>
                                <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                  {selectedItem.extractedText.slice(0, 150)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Website / Text content — scrollable */}
              {selectedItem.type !== "pdf" && selectedItem.type !== "youtube" && (
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedItem.type === "website" && selectedItem.sourceUrl && (
                    <div className="mb-3">
                      <a href={selectedItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-500 hover:underline flex items-center gap-1">
                        <Globe size={12} /> {selectedItem.sourceUrl}
                      </a>
                    </div>
                  )}
                  {selectedItem.extractedText && (
                    <div className="text-[14px] text-[#444] dark:text-[#ccc] leading-[1.8] whitespace-pre-line select-text cursor-text max-w-[700px]">
                      {selectedItem.extractedText}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // Content Grid View
            <div className="flex-1 overflow-y-auto">
              {/* Compact header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400">
                    <ArrowLeft size={16} />
                  </Link>
                  <h1 className="text-[13px] font-medium text-gray-900 dark:text-white">{space.name}</h1>
                </div>
                <Link
                  href={`/dashboard/add?spaceId=${space.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black dark:bg-white text-white dark:text-black text-[12px] font-medium hover:opacity-90 transition-all"
                >
                  <Plus size={14} /> Add
                </Link>
              </div>

              <div className="p-6 max-w-7xl mx-auto">
                {/* Search bar */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 max-w-md">
                    <Search size={15} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="bg-transparent text-[13px] outline-none flex-1 placeholder:text-gray-400 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Content Grid */}
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
                      <BookOpen size={36} className="text-white dark:text-black" />
                    </div>
                    <h3 className="text-[20px] font-semibold text-gray-900 dark:text-white mb-2">
                      {space.contentItems.length === 0 ? "No content yet" : "No results found"}
                    </h3>
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                      {space.contentItems.length === 0 
                        ? "Add your first learning material to get started with AI-powered summaries, quizzes, and chat."
                        : "Try adjusting your search terms."}
                    </p>
                    {space.contentItems.length === 0 && (
                      <Link 
                        href={`/dashboard/add?spaceId=${space.id}`} 
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[15px] font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                      >
                        <Plus size={18} /> Add Content
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => {
                      const IconComponent = TYPE_ICONS[item.type] || FileText;
                      // Extract YouTube thumbnail if it's a video
                      const getYoutubeThumbnail = (url: string | undefined) => {
                        if (!url) return null;
                        try {
                          const urlObj = new URL(url);
                          let videoId = "";
                          if (urlObj.hostname.includes("youtube.com")) {
                            videoId = urlObj.searchParams.get("v") || "";
                          } else if (urlObj.hostname.includes("youtu.be")) {
                            videoId = urlObj.pathname.slice(1);
                          }
                          return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
                        } catch {
                          return null;
                        }
                      };
                      
                      const thumbnail = item.type === "youtube" ? getYoutubeThumbnail(item.sourceUrl) : null;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedContent(item.id)}
                          className="group text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                          {/* Thumbnail for videos */}
                          {thumbnail ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-800">
                              <img 
                                src={thumbnail} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
                                  <Youtube size={20} />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Icon for non-video content */
                            <div className="p-6 pb-0">
                              <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black group-hover:scale-105 transition-transform">
                                <IconComponent size={24} />
                              </div>
                            </div>
                          )}
                          
                          <div className="p-6">
                            {/* Type badge */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[11px] px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                                {item.type}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors">
                              {item.name}
                            </h3>

                            {/* Metadata */}
                            <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
                              <span>{timeAgo(item.createdAt)}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR - AI Panel (toggleable) ═══ */}
        {selectedItem && aiPanelOpen && (
          <>
            {/* Mobile overlay backdrop */}
            {isMobile && (
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setAIPanelOpen(false)}
              />
            )}

            {/* ═══ RESIZE HANDLE (desktop only) ═══ */}
            {!isMobile && (
              <div
                className={`w-1 cursor-col-resize hover:bg-[#8b5cf6]/30 active:bg-[#8b5cf6]/50 transition-colors ${isDragging ? "bg-[#8b5cf6]/50" : "bg-transparent"}`}
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
              />
            )}

            {/* ═══ AI PANEL ═══ */}
            <div
              className={
                isMobile
                  ? "fixed inset-y-0 right-0 z-50 w-[85vw] max-w-[420px] bg-[#0d0d12] flex flex-col border-l border-[#1a1a2e] shadow-2xl animate-in slide-in-from-right duration-200"
                  : "bg-[#0d0d12] flex flex-col shrink-0 transition-[width] duration-100 border-l border-[#1a1a2e]"
              }
              style={isMobile ? undefined : { width: aiPanelWidth }}
            >
              {/* ─── Tab bar ───────────────────────── */}
              <div className="flex items-center justify-between px-2 pt-2 pb-0 shrink-0 bg-[#0d0d12]">
                <div className="flex items-center gap-0.5 flex-1">
                  {/* Learn Tab */}
                  <button
                    onClick={() => setAIPanelTab("learn")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-[13px] font-medium transition-all ${
                      aiPanelTab === "learn"
                        ? "bg-[#141420] text-white border border-[#1e1e3a] border-b-transparent"
                        : "text-[#666] hover:text-[#999] hover:bg-[#111118]"
                    }`}
                  >
                    <BookOpen size={14} />
                    Learn
                  </button>

                  {/* Chat sessions as tabs */}
                  {chatSessions.slice(-3).map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setAIPanelTab("chat");
                        setActiveChatId(session.id);
                        setMessages(session.messages);
                        setFollowUps(session.messages.length > 0 ? (session.messages[session.messages.length - 1].followUpQuestions || []) : []);
                      }}
                      className={`group flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-[12px] font-medium transition-all max-w-[140px] ${
                        aiPanelTab === "chat" && activeChatId === session.id
                          ? "bg-[#141420] text-white border border-[#1e1e3a] border-b-transparent"
                          : "text-[#555] hover:text-[#999] hover:bg-[#111118]"
                      }`}
                    >
                      <MessageSquare size={12} className="shrink-0" />
                      <span className="truncate">{session.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatSessions(prev => prev.filter(s => s.id !== session.id));
                          if (activeChatId === session.id) {
                            setAIPanelTab("learn");
                            setActiveChatId(null);
                            setMessages([]);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#222] rounded transition-all shrink-0"
                      >
                        <X size={10} />
                      </button>
                    </button>
                  ))}

                  {/* New chat button */}
                  <button
                    onClick={() => {
                      const sessionId = `chat-${Date.now()}`;
                      const newSession: ChatSession = { id: sessionId, name: "New Chat", messages: [], createdAt: new Date().toISOString() };
                      setChatSessions(prev => [...prev, newSession]);
                      setActiveChatId(sessionId);
                      setMessages([]);
                      setFollowUps([]);
                      setAIPanelTab("chat");
                    }}
                    className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-[#1a1a2e] transition-all ml-1"
                    title="New chat"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => setAIPanelOpen(false)} 
                  className="p-2 rounded-lg hover:bg-[#1a1a2e] transition-all text-[#555] hover:text-white ml-2"
                  title="Close panel"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Tab content border line */}
              <div className="h-px bg-[#1e1e3a]" />

              {/* ─── LEARN TAB CONTENT ─────────────── */}
              {aiPanelTab === "learn" && (
                <div className="flex-1 overflow-y-auto bg-[#141420]">
                  <div className="p-5 space-y-6">
                    {/* Generate section */}
                    <div>
                      <h4 className="text-[14px] font-semibold text-white mb-3">Generate</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleGenerateSummary}
                          disabled={generatingSummary}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#1e1e3a] bg-[#0d0d12] hover:bg-[#1a1a2e] transition-all disabled:opacity-50"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
                            {generatingSummary ? (
                              <Loader2 size={20} className="animate-spin text-[#8b5cf6]" />
                            ) : (
                              <FileText size={20} className="text-[#a78bfa]" />
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-white">Summary</span>
                        </button>

                        <button
                          onClick={handleGenerateQuiz}
                          disabled={generatingQuiz}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#1e1e3a] bg-[#0d0d12] hover:bg-[#1a1a2e] transition-all disabled:opacity-50"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
                            {generatingQuiz ? (
                              <Loader2 size={20} className="animate-spin text-[#8b5cf6]" />
                            ) : (
                              <Brain size={20} className="text-[#a78bfa]" />
                            )}
                          </div>
                          <span className="text-[13px] font-medium text-white">Quiz</span>
                        </button>

                        <button disabled className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#1e1e3a] bg-[#0d0d12] opacity-40 cursor-not-allowed">
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
                            <GraduationCap size={20} className="text-[#a78bfa]" />
                          </div>
                          <span className="text-[13px] font-medium text-white">Flashcards</span>
                        </button>

                        <button disabled className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#1e1e3a] bg-[#0d0d12] opacity-40 cursor-not-allowed">
                          <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
                            <Headphones size={20} className="text-[#a78bfa]" />
                          </div>
                          <span className="text-[13px] font-medium text-white">Podcast</span>
                        </button>
                      </div>
                    </div>

                    {/* Summaries */}
                    {(space.summaries || []).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[13px] font-semibold text-[#aaa]">Summary</h4>
                          <button 
                            onClick={handleGenerateSummary} 
                            disabled={generatingSummary} 
                            className="text-[12px] text-[#666] hover:text-white transition-colors disabled:opacity-50"
                          >
                            {generatingSummary ? "Generating..." : "Refresh"}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(space.summaries || []).map((s) => (
                            <div key={s.id} className="p-4 rounded-xl border border-[#1e1e3a] bg-[#0d0d12]">
                              <p className="text-[13px] font-medium mb-2 text-white">{s.title}</p>
                              <div className="text-[13px] text-[#999] leading-relaxed prose-ai">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content.slice(0, 300)}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quiz */}
                    {(space.quizQuestions || []).length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[13px] font-semibold text-[#aaa]">Quiz</h4>
                          {quizSubmitted && (
                            <div className="flex items-center gap-2">
                              <span className={`text-[12px] font-bold ${quizPercent >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {quizScore}/{quizTotal} ({quizPercent}%)
                              </span>
                              <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="text-[11px] text-[#666] hover:text-white transition-colors flex items-center gap-1">
                                <RotateCcw size={11} /> Retry
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {(space.quizQuestions || []).map((q, qi) => {
                            const answered = quizAnswers[qi] !== undefined;
                            const correct = quizSubmitted && quizAnswers[qi] === q.correctIndex;
                            const wrong = quizSubmitted && answered && quizAnswers[qi] !== q.correctIndex;
                            return (
                              <div key={q.id} className="p-4 rounded-xl border border-[#1e1e3a] bg-[#0d0d12]">
                                <p className="text-[13px] font-medium text-white mb-3">{qi + 1}. {q.question}</p>
                                <div className="space-y-2">
                                  {(q.options || []).map((opt, oi) => {
                                    const isSelected = quizAnswers[qi] === oi;
                                    const isCorrect = quizSubmitted && oi === q.correctIndex;
                                    return (
                                      <button
                                        key={oi}
                                        onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                                        disabled={quizSubmitted}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all border ${
                                          isCorrect ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" :
                                          isSelected && quizSubmitted ? "bg-red-500/10 border-red-500/40 text-red-300" :
                                          isSelected ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/40 text-white" :
                                          "border-[#1e1e3a] text-[#bbb] hover:bg-[#1a1a2e] hover:text-white"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {quizSubmitted && isCorrect && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                                          {quizSubmitted && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 shrink-0" />}
                                          <span>{opt}</span>
                                        </div>
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
                            disabled={Object.keys(quizAnswers).length < (space.quizQuestions || []).length}
                            className="mt-4 w-full py-3 rounded-xl bg-[#8b5cf6] text-white text-[14px] font-semibold hover:bg-[#7c3aed] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Submit Answers
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Ask section at bottom of learn tab */}
                    <div className="pt-2">
                      <h4 className="text-[13px] font-semibold text-[#aaa] mb-3">Ask AI</h4>
                      <div className="relative rounded-xl bg-[#0d0d12] border border-[#1e1e3a] focus-within:border-[#8b5cf6]/50 transition-all">
                        <textarea
                          value={chatInput}
                          onChange={(e) => {
                            setChatInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Ask anything about your content..."
                          rows={1}
                          className="w-full pl-4 pr-12 py-3 rounded-xl bg-transparent text-[13px] outline-none resize-none text-white placeholder:text-[#555] leading-relaxed"
                          style={{ minHeight: '44px', maxHeight: '80px' }}
                        />
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!chatInput.trim() || sendingChat}
                          className={`absolute right-2 bottom-1.5 p-2 rounded-lg transition-all ${chatInput.trim() ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]' : 'text-[#333]'} disabled:cursor-not-allowed`}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── CHAT TAB CONTENT ──────────────── */}
              {aiPanelTab === "chat" && (
                <div className="flex-1 flex flex-col bg-[#141420] overflow-hidden">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center border border-[#8b5cf6]/20">
                          <Sparkles size={28} className="text-[#8b5cf6]" />
                        </div>
                        <div className="text-center">
                          <p className="text-[15px] font-semibold text-white mb-1">Start a conversation</p>
                          <p className="text-[12px] text-[#666] max-w-[240px] leading-relaxed">Ask questions about your content, get explanations, and dive deeper into any topic</p>
                        </div>
                        {/* Quick-start chips */}
                        <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-[320px]">
                          {[
                            "Explain the key concepts",
                            "Summarize the main points",
                            "Quiz me on this material",
                            "What should I focus on?",
                          ].map((chip) => (
                            <button
                              key={chip}
                              onClick={() => { setChatInput(chip); handleSendMessage(chip); }}
                              className="px-3 py-2 rounded-xl bg-[#1a1a2e] border border-[#252545] text-[12px] text-[#aaa] hover:text-white hover:bg-[#252545] hover:border-[#8b5cf6]/30 transition-all"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isUser = msg.role === "user";
                        const isLast = idx === messages.length - 1;
                        const hasQuote = msg.content.startsWith("> ");
                        const quotePart = hasQuote ? msg.content.split("\n\n")[0].replace(/^> /, "") : null;
                        const mainContent = hasQuote ? msg.content.split("\n\n").slice(1).join("\n\n") : msg.content;

                        // Replace [Source N] with styled badges in display
                        const renderContentWithSources = (text: string) => {
                          return text.replace(/\[Source (\d+)\]/g, '**⟨Source $1⟩**');
                        };

                        return (
                          <div key={msg.id} className={`${isLast ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}`}>
                            {isUser ? (
                              /* ── User message ── */
                              <div className="flex justify-end">
                                <div className="max-w-[85%]">
                                  {quotePart && (
                                    <div className="mb-1.5 px-3 py-2 rounded-xl bg-[#8b5cf6]/10 border-l-2 border-[#8b5cf6] ml-auto max-w-fit">
                                      <p className="text-[11px] text-[#a78bfa] leading-relaxed line-clamp-2 italic">{quotePart}</p>
                                    </div>
                                  )}
                                  <div className="px-4 py-3 rounded-2xl rounded-br-md bg-[#8b5cf6] text-white">
                                    <p className="text-[13px] leading-relaxed">{mainContent}</p>
                                  </div>
                                  <p className="text-[10px] text-[#444] mt-1 text-right pr-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* ── AI message ── */
                              <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-[#8b5cf6]/20">
                                  <Sparkles size={13} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-[#8b5cf6] mb-1.5 uppercase tracking-wider">YesLearn AI</p>
                                  <div className="text-[13px] leading-[1.8] text-[#ddd] [&_strong]:text-white [&_a]:text-[#8b5cf6] [&_h1]:text-[16px] [&_h2]:text-[15px] [&_h3]:text-[14px] [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:space-y-1 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:text-[12px] [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[#e879f9] [&_pre]:bg-[#0d0d12] [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[#1e1e3a] [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-[#8b5cf6]/40 [&_blockquote]:pl-3 [&_blockquote]:text-[#999] [&_blockquote]:italic">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {renderContentWithSources(msg.content)}
                                    </ReactMarkdown>
                                  </div>

                                  {/* Source citations */}
                                  {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {msg.sources.map((src) => (
                                        <div
                                          key={src.index}
                                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[11px] text-[#a78bfa] font-medium hover:bg-[#8b5cf6]/20 transition-colors cursor-default"
                                        >
                                          <FileText size={11} className="shrink-0" />
                                          <span className="truncate max-w-[150px]">{src.name}</span>
                                          <span className="text-[#666] text-[10px] shrink-0">Source {src.index}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 mt-2">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(msg.content)}
                                      className="p-1.5 rounded-lg hover:bg-[#1a1a2e] transition-colors"
                                      title="Copy"
                                    >
                                      <Copy size={12} className="text-[#555]" />
                                    </button>
                                    <button className="p-1.5 rounded-lg hover:bg-[#1a1a2e] transition-colors" title="Good">
                                      <ThumbsUp size={12} className="text-[#555]" />
                                    </button>
                                    <button className="p-1.5 rounded-lg hover:bg-[#1a1a2e] transition-colors" title="Bad">
                                      <ThumbsDown size={12} className="text-[#555]" />
                                    </button>
                                  </div>

                                  {/* Follow-up questions — only on the last AI message */}
                                  {isLast && !sendingChat && (msg.followUpQuestions?.length || followUps.length > 0) && (
                                    <div className="mt-4 space-y-2">
                                      <p className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">Suggested follow-ups</p>
                                      {(msg.followUpQuestions?.length ? msg.followUpQuestions : followUps).map((q, i) => (
                                        <button
                                          key={i}
                                          onClick={() => { setChatInput(q); handleSendMessage(q); }}
                                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#0d0d12] border border-[#1e1e3a] text-[12px] text-[#bbb] hover:text-white hover:bg-[#1a1a2e] hover:border-[#8b5cf6]/30 transition-all text-left group"
                                        >
                                          <ChevronRight size={12} className="text-[#8b5cf6] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                          <span className="line-clamp-2">{q}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Typing indicator */}
                    {sendingChat && (
                      <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center shrink-0 shadow-lg shadow-[#8b5cf6]/20">
                          <Sparkles size={13} className="text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#1a1a2e] border border-[#252545]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* ─── Chat Composer ──────────────────── */}
                  <div className="px-4 pb-4 pt-2 border-t border-[#1e1e3a] bg-[#0d0d12]/80 backdrop-blur-xl shrink-0">
                    {/* Quoted text banner */}
                    {quotedText && (
                      <div className="mb-2.5 p-2.5 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 flex items-start gap-2">
                          <div className="w-1 self-stretch rounded-full bg-[#8b5cf6] shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#8b5cf6] font-semibold mb-0.5">Selected text</p>
                            <p className="text-[12px] text-[#aaa] leading-relaxed line-clamp-2">{quotedText}</p>
                          </div>
                        </div>
                        <button onClick={() => setQuotedText(null)} className="p-1 hover:bg-[#8b5cf6]/20 rounded-lg transition-colors shrink-0">
                          <X size={14} className="text-[#8b5cf6]" />
                        </button>
                      </div>
                    )}

                    {/* Input */}
                    <div className="relative rounded-xl bg-[#0d0d12] border border-[#1e1e3a] focus-within:border-[#8b5cf6]/50 focus-within:shadow-lg focus-within:shadow-[#8b5cf6]/5 transition-all">
                      <textarea
                        value={chatInput}
                        onChange={(e) => {
                          setChatInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Ask anything..."
                        disabled={sendingChat}
                        rows={1}
                        className="w-full pl-4 pr-12 pt-3 pb-3 rounded-xl bg-transparent text-[13px] outline-none resize-none disabled:opacity-50 text-white placeholder:text-[#555] leading-relaxed"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!chatInput.trim() || sendingChat}
                        className={`absolute right-2 bottom-1.5 p-2 rounded-lg transition-all duration-200 ${chatInput.trim() 
                          ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/25 hover:bg-[#7c3aed] active:scale-95' 
                          : 'text-[#333]'} disabled:cursor-not-allowed`}
                      >
                        {sendingChat ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#444] mt-2 text-center">AI may make mistakes. Verify important information.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Toggle AI Panel Button (when closed and content is selected) */}
        {selectedItem && !aiPanelOpen && (
          <button
            onClick={() => setAIPanelOpen(true)}
            className="fixed right-6 bottom-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] text-white shadow-xl shadow-[#8b5cf6]/30 hover:shadow-[#8b5cf6]/50 transition-all flex items-center justify-center z-50 hover:scale-110 active:scale-95"
            title="Open AI Assistant"
          >
            <Sparkles size={24} />
          </button>
        )}
    </div>
  );
}
