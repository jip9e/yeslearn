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

/* ────────────────────────── Helpers ─────────────────────── */

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
      className="flex items-center gap-3 p-3.5 rounded-xl border border-[#eee] dark:border-[#222] bg-white dark:bg-[#111] hover:bg-[#f8f8f8] dark:hover:bg-[#1a1a1a] hover:border-[#ddd] dark:hover:border-[#333] transition-all duration-200 hover:shadow-sm active:scale-[0.98] disabled:opacity-50"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#f0f0f0] dark:bg-[#1a1a1a]">
        {loading ? <Loader2 size={15} className="animate-spin text-[#888]" /> : <span className="text-[#555] dark:text-[#888]">{icon}</span>}
      </div>
      <div className="text-left min-w-0">
        <span className="text-[13px] font-medium text-[#333] dark:text-[#ccc] block">{label}</span>
        {description && <span className="text-[11px] text-[#999] dark:text-[#666] block">{description}</span>}
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
  const actions = [
    { id: "explain", label: "Explain", icon: <Lightbulb size={13} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={13} /> },
    { id: "quiz", label: "Quiz", icon: <Brain size={13} /> },
  ];

  return (
    <div
      className="fixed z-50 flex items-center gap-1 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-[#e5e5e5] dark:border-[#333] px-2 py-1.5 animate-in fade-in zoom-in-95 duration-150"
      style={{ left: position.x, top: position.y - 50 }}
    >
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => { onAction(a.id, text); onClose(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#555] dark:text-[#aaa] hover:bg-[#f0f0f0] dark:hover:bg-[#222] hover:text-black dark:hover:text-white transition-colors"
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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiPanelTab, setAIPanelTab] = useState<AIPanelTab>("learn");
  const [aiPanelExpanded, setAIPanelExpanded] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionToolbar, setSelectionToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionResults, setMentionResults] = useState<ContentItem[]>([]);

  // Resizable panel state
  const [aiPanelWidth, setAiPanelWidth] = useState(420);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

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
        setSpace(data);
        setMessages(data.chatMessages || []);
        if (data.contentItems?.length > 0) setSelectedContent(data.contentItems[0].id);
      })
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
        x: Math.min(rect.left + rect.width / 2 - 100, window.innerWidth - 280),
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
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [handleTextSelection]);

  /* ── Resize drag handlers ────────────────────────────── */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: aiPanelWidth };
    setIsDragging(true);
  }, [aiPanelWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - e.clientX;
      const containerW = mainContainerRef.current?.offsetWidth || 1200;
      const minW = 300;
      const maxW = Math.min(containerW * 0.65, 800);
      setAiPanelWidth(Math.max(minW, Math.min(maxW, dragRef.current.startWidth + delta)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  /* ── handlers ─────────────────────────────────────────── */

  const handleSendMessage = async () => {
    if (!chatInput.trim() || sendingChat) return;
    const userMsg = quotedText ? `> ${quotedText}\n\n${chatInput}` : chatInput;
    setChatInput("");
    setQuotedText(null);
    setSendingChat(true);

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
        setMessages((prev) => [...prev.filter((m) => m.id !== "temp-user"), data.userMessage, data.aiMessage]);
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
    setAIPanelTab("chat");
    setQuotedText(text);
    if (action === "explain") {
      setChatInput("Explain this concept in detail:");
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
      case "youtube": return <Youtube size={14} className="text-red-500" />;
      case "pdf": return <FileText size={14} className="text-blue-500" />;
      case "website": return <Globe size={14} className="text-green-500" />;
      case "audio": return <Mic size={14} className="text-purple-500" />;
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
  const quizScore = space.quizQuestions.filter((q, i) => quizAnswers[i] === q.correctIndex).length;
  const quizTotal = space.quizQuestions.length;
  const quizPercent = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;

  /* ════════════════════════ RENDER ══════════════════════ */

  return (
    <div className="h-full flex flex-col bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* ── Top Bar ───────────────────────────────────────── */}
      <div className="border-b border-[#eee] dark:border-[#1a1a1a] bg-white dark:bg-[#0a0a0a] px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors text-[#888]" title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <Link href="/dashboard" className="text-[#999] hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2 text-[14px]">
            <div className="w-6 h-6 rounded-md bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center text-[11px] font-semibold text-[#555] dark:text-[#888]">
              {space.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold dark:text-white">{space.name}</span>
            {selectedItem && (
              <>
                <span className="text-[#ccc]">/</span>
                <span className="text-[#888]">{selectedItem.name}</span>
              </>
            )}
          </div>
        </div>
        <Link href={`/dashboard/add?spaceId=${space.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[12px] font-medium hover:opacity-90 transition-opacity">
          <Plus size={12} /> Add Content
        </Link>
      </div>

      {/* ── Main 3-Column Layout ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden" ref={mainContainerRef}>

        {/* ═══ SIDEBAR (collapsible) ═══ */}
        <div className={`bg-white dark:bg-[#0a0a0a] border-r border-[#eee] dark:border-[#1a1a1a] overflow-y-auto shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-[240px]" : "w-0 overflow-hidden"}`}>
          <div className="w-[240px]">
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f5f5f5] dark:bg-[#141414]">
                <Search size={13} className="text-[#999]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-[12px] outline-none flex-1 placeholder:text-[#999] dark:text-white"
                />
              </div>
            </div>
            {filteredItems.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[12px] text-[#999] mb-2">{space.contentItems.length === 0 ? "No content yet" : "No results"}</p>
                {space.contentItems.length === 0 && (
                  <Link href={`/dashboard/add?spaceId=${space.id}`} className="text-[12px] text-black dark:text-white font-medium hover:opacity-70">+ Add content</Link>
                )}
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedContent(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${selectedContent === item.id ? "bg-[#f0f0f0] dark:bg-[#1a1a1a] border-l-2 border-black dark:border-white" : "hover:bg-[#f5f5f5] dark:hover:bg-[#111] border-l-2 border-transparent"
                    }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center shrink-0">{getTypeIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate dark:text-white">{item.name}</p>
                    <p className="text-[10px] text-[#999]">{item.type} · {timeAgo(item.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ═══ CONTENT VIEWER (left/center) ═══ */}
        <div className={`flex-1 overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] transition-all duration-300 flex flex-col ${aiPanelExpanded ? "hidden" : ""}`} ref={contentRef}>
          {selectedItem ? (
            <>
              {/* Content header bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#eee] dark:border-[#1a1a1a] bg-white dark:bg-[#0a0a0a] shrink-0">
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedItem.type)}
                  <h2 className="text-[13px] font-medium dark:text-white">{selectedItem.name}</h2>
                </div>
                <button onClick={() => handleDeleteContent(selectedItem.id)} disabled={deleting === selectedItem.id} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  {deleting === selectedItem.id ? <Loader2 size={13} className="animate-spin text-red-400" /> : <Trash2 size={13} className="text-red-400" />}
                </button>
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

              {/* YouTube Embed — full width */}
              {selectedItem.type === "youtube" && selectedItem.sourceUrl && (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 min-h-0">
                    {getYoutubeEmbedUrl(selectedItem.sourceUrl) ? (
                      <iframe src={getYoutubeEmbedUrl(selectedItem.sourceUrl)!} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    ) : (
                      <div className="bg-black h-full flex items-center justify-center"><p className="text-white/60 text-sm">Could not load video</p></div>
                    )}
                  </div>
                  {/* Transcript below video */}
                  {selectedItem.extractedText && (
                    <div className="max-h-[40%] overflow-y-auto p-4 border-t border-[#eee] dark:border-[#1a1a1a] bg-white dark:bg-[#0a0a0a]">
                      <h3 className="text-[12px] font-semibold text-[#999] mb-2 uppercase tracking-wider">Transcript</h3>
                      <div className="text-[13px] text-[#444] dark:text-[#ccc] leading-[1.7] whitespace-pre-line select-text cursor-text">
                        {selectedItem.extractedText}
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
            <div className="h-full flex flex-col items-center justify-center text-[#999] gap-3">
              <BookOpen size={32} />
              <p className="text-[14px]">{space.contentItems.length === 0 ? "Add content to get started" : "Select content to view"}</p>
            </div>
          )}
        </div>

        {/* ═══ RESIZE HANDLE ═══ */}
        {!aiPanelExpanded && (
          <div
            className={`resize-handle ${isDragging ? "dragging" : ""}`}
            onMouseDown={handleResizeStart}
          />
        )}

        {/* ═══ AI LEARNING PANEL (right, resizable) ═══ */}
        <div
          className={`bg-white dark:bg-[#0a0a0a] flex flex-col shrink-0 transition-[width] duration-100 ${aiPanelExpanded ? "flex-1" : ""}`}
          style={aiPanelExpanded ? undefined : { width: aiPanelWidth }}
        >
          {/* Panel header with tabs */}
          <div className="border-b border-[#eee] dark:border-[#1a1a1a] px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-[#f0f0f0] dark:bg-[#141414] rounded-lg p-0.5">
              <button
                onClick={() => setAIPanelTab("learn")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${aiPanelTab === "learn" ? "bg-white dark:bg-[#222] text-black dark:text-white shadow-sm" : "text-[#888] hover:text-[#555] dark:hover:text-[#ccc]"
                  }`}
              >
                <Sparkles size={12} /> Learn
              </button>
              <button
                onClick={() => setAIPanelTab("chat")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${aiPanelTab === "chat" ? "bg-white dark:bg-[#222] text-black dark:text-white shadow-sm" : "text-[#888] hover:text-[#555] dark:hover:text-[#ccc]"
                  }`}
              >
                <MessageSquare size={12} /> Chat
              </button>
            </div>
            <button onClick={() => setAIPanelExpanded(!aiPanelExpanded)} className="p-1.5 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors text-[#999]">
              {aiPanelExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">

            {/* ─── LEARN TAB ─── */}
            {aiPanelTab === "learn" && (
              <div className="p-4">
                {/* Generate tool cards */}
                <h4 className="text-[12px] font-semibold text-[#999] uppercase tracking-wider mb-3">Generate</h4>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <ToolCard icon={<Brain size={15} />} label="Quiz" color="#8b5cf6" loading={generatingQuiz} onClick={handleGenerateQuiz} />
                  <ToolCard icon={<FileText size={15} />} label="Summary" color="#f59e0b" loading={generatingSummary} onClick={handleGenerateSummary} />
                  <ToolCard icon={<Headphones size={15} />} label="Podcast" color="#ef4444" onClick={() => { }} />
                  <ToolCard icon={<GraduationCap size={15} />} label="Flashcards" color="#3b82f6" onClick={() => { }} />
                </div>

                {/* Generated summaries */}
                {space.summaries.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[12px] font-semibold text-[#999] uppercase tracking-wider">Summary</h4>
                      <button onClick={handleGenerateSummary} disabled={generatingSummary} className="text-[11px] text-[#888] hover:text-black dark:hover:text-white transition-colors">
                        {generatingSummary ? "..." : "↻ Refresh"}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {space.summaries.map((s, i) => (
                        <div key={s.id} className="p-3 rounded-xl border border-[#eee] dark:border-[#222] hover:bg-[#f8f8f8] dark:hover:bg-[#111] transition-colors cursor-default">
                          <div className="flex items-start gap-2">
                            <span className="text-[11px] font-bold w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#666] dark:text-[#999]">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[12px] font-medium mb-1 dark:text-white">{s.title}</p>
                              <div className="text-[11px] text-[#888] leading-[1.5] prose-ai line-clamp-3">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content.slice(0, 200)}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated quiz */}
                {quizTotal > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[12px] font-semibold text-[#999] uppercase tracking-wider">Quiz ({quizTotal} questions)</h4>
                      <div className="flex items-center gap-2">
                        {quizSubmitted && (
                          <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="text-[11px] text-[#888] hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                            <RotateCcw size={10} /> Retry
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#999]">{Object.keys(quizAnswers).length}/{quizTotal} answered</span>
                        {quizSubmitted && (
                          <span className="text-[12px] font-semibold" style={{ color: quizPercent >= 70 ? "#10b981" : quizPercent >= 40 ? "#f59e0b" : "#ef4444" }}>
                            {quizPercent}%
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{
                          width: `${(Object.keys(quizAnswers).length / quizTotal) * 100}%`,
                          backgroundColor: quizSubmitted ? (quizPercent >= 70 ? "#10b981" : quizPercent >= 40 ? "#f59e0b" : "#ef4444") : "#8b5cf6",
                        }} />
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-3">
                      {space.quizQuestions.map((q, qi) => (
                        <div key={q.id} className="p-3 rounded-xl border border-[#eee] dark:border-[#222]">
                          <p className="text-[12px] font-medium mb-2 dark:text-white">{qi + 1}. {q.question}</p>
                          <div className="space-y-1">
                            {q.options.map((opt: string, oi: number) => {
                              const isSelected = quizAnswers[qi] === oi;
                              const isCorrect = quizSubmitted && oi === q.correctIndex;
                              const isWrong = quizSubmitted && isSelected && oi !== q.correctIndex;
                              return (
                                <button
                                  key={oi}
                                  onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[11px] border transition-all ${isCorrect ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                    : isWrong ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                      : isSelected ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400"
                                        : "border-[#eee] dark:border-[#222] hover:border-[#ccc] dark:hover:border-[#444] hover:bg-[#f8f8f8] dark:hover:bg-[#111] dark:text-[#ccc]"
                                    }`}
                                  disabled={quizSubmitted}
                                >
                                  <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0" style={{
                                    borderColor: isCorrect ? "#4ade80" : isWrong ? "#f87171" : isSelected ? "#8b5cf6" : "#e5e5e5",
                                    backgroundColor: isSelected && !quizSubmitted ? "#8b5cf6" : "transparent",
                                    color: isSelected && !quizSubmitted ? "#fff" : undefined,
                                  }}>
                                    {isCorrect ? <CheckCircle2 size={12} className="text-green-500" /> : isWrong ? <XCircle size={12} className="text-red-500" /> : String.fromCharCode(65 + oi)}
                                  </span>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!quizSubmitted && (
                      <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < quizTotal}
                        className="mt-3 w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[12px] font-medium hover:opacity-90 disabled:opacity-30 transition-opacity"
                      >
                        Submit Answers
                      </button>
                    )}

                    {quizSubmitted && (
                      <div className="mt-3 p-4 rounded-xl border border-[#eee] dark:border-[#222] text-center">
                        <p className="text-[20px] font-bold mb-0.5 dark:text-white">{quizScore}/{quizTotal}</p>
                        <p className="text-[11px] text-[#999]">
                          {quizPercent >= 90 ? "🎉 Excellent!" : quizPercent >= 70 ? "👍 Great job!" : quizPercent >= 40 ? "💪 Keep going!" : "📖 Review & retry!"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {space.summaries.length === 0 && quizTotal === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={20} className="text-[#ccc]" />
                    </div>
                    <p className="text-[13px] text-[#999] max-w-[200px] mx-auto">
                      Click the tools above to generate AI-powered study materials.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── CHAT TAB ─── */}
            {aiPanelTab === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="space-y-6">
                    {/* Welcome empty state */}
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center pt-12 pb-6">
                        <div className="w-10 h-10 rounded-full bg-[#121212] dark:bg-white flex items-center justify-center mb-4">
                          <Sparkles size={18} className="text-white dark:text-black" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-[#121212] dark:text-white mb-1">AI Tutor</h3>
                        <p className="text-[13px] text-[#888] mb-6 text-center max-w-[240px] leading-relaxed">
                          Ask anything about your content. I'll help you understand.
                        </p>
                        <div className="w-full space-y-2">
                          {["Explain the key concepts", "Summarize the main ideas", "What should I focus on?"].map((q) => (
                            <button key={q} onClick={() => setChatInput(q)}
                              className="w-full text-left px-4 py-3 rounded-xl border border-[#e7e7e7] dark:border-[#222] text-[13px] text-[#555] dark:text-[#999] hover:bg-[#f6f6f6] dark:hover:bg-[#111] hover:text-[#121212] dark:hover:text-white transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start gap-3"}`}>
                        {msg.role === "ai" && (
                          <div className="w-7 h-7 rounded-full bg-[#121212] dark:bg-white flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={12} className="text-white dark:text-black" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-[88%] group">
                          {msg.role === "user" ? (
                            <div className="bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#121212] dark:text-[#e5e5e5] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-[1.7]">
                              <div className="whitespace-pre-line">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="prose-ai text-[13.5px] text-[#333] dark:text-[#d0d0d0] leading-[1.75]">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                              </div>
                              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={msg.content} />
                                <button className="p-1 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors"><ThumbsUp size={12} className="text-[#ccc] dark:text-[#444]" /></button>
                                <button className="p-1 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors"><ThumbsDown size={12} className="text-[#ccc] dark:text-[#444]" /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {sendingChat && (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#121212] dark:bg-white flex items-center justify-center shrink-0">
                          <Sparkles size={12} className="text-white dark:text-black" />
                        </div>
                        <div className="pt-2">
                          <div className="typing-dots"><span></span><span></span><span></span></div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Chat Input (always visible at bottom) ─────── */}
          <div className="border-t border-[#eee] dark:border-[#1a1a1a] p-3 shrink-0">
            {/* Quoted text chip */}
            {quotedText && (
              <div className="flex items-start gap-2 mb-2 px-3 py-2 bg-[#f6f6f6] dark:bg-[#141414] rounded-lg border-l-2 border-[#121212] dark:border-white">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#888] mb-0.5">Selected text</p>
                  <p className="text-[12px] text-[#444] dark:text-[#aaa] line-clamp-2">{quotedText}</p>
                </div>
                <button onClick={() => setQuotedText(null)} className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 shrink-0"><X size={12} className="text-[#999]" /></button>
              </div>
            )}
            <div className="relative">
              <div className="flex items-end gap-2 bg-[#f6f6f6] dark:bg-[#141414] rounded-2xl px-4 py-2.5 border border-transparent focus-within:border-[#d4d4d4] dark:focus-within:border-[#333] transition-colors">
                <textarea
                  value={chatInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setChatInput(e.target.value);
                    const v = e.target.value;
                    const lastAt = v.lastIndexOf("@");
                    if (lastAt >= 0) {
                      const after = v.slice(lastAt + 1);
                      if (!after.includes(" ") && after.length < 30) {
                        const q = after.toLowerCase();
                        const matches = space.contentItems.filter(ci => ci.name.toLowerCase().includes(q));
                        setMentionResults(matches.length > 0 ? matches.slice(0, 5) : []);
                        setShowMentions(matches.length > 0);
                      } else {
                        setShowMentions(false);
                      }
                    } else {
                      setShowMentions(false);
                    }
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Ask anything..."
                  className="flex-1 resize-none bg-transparent text-[13px] focus:outline-none placeholder:text-[#bbb] dark:placeholder:text-[#555] max-h-24 dark:text-white"
                  rows={1}
                  disabled={sendingChat}
                  onFocus={() => { if (aiPanelTab !== "chat") setAIPanelTab("chat"); }}
                />
                <button onClick={handleSendMessage} disabled={!chatInput.trim() || sendingChat}
                  className="w-8 h-8 rounded-full bg-[#121212] dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-80 disabled:opacity-20 shrink-0 transition-opacity"
                >
                  {sendingChat ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
              {/* @ mention dropdown */}
              {showMentions && mentionResults.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-[#111] border border-[#eee] dark:border-[#222] rounded-xl shadow-lg overflow-hidden z-10">
                  {mentionResults.map((ci) => (
                    <button
                      key={ci.id}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-[12px] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const lastAt = chatInput.lastIndexOf("@");
                        setChatInput(chatInput.slice(0, lastAt) + "@" + ci.name + " ");
                        setShowMentions(false);
                      }}
                    >
                      <FileText size={13} className="text-[#888] shrink-0" />
                      <span className="truncate dark:text-[#ccc]">{ci.name}</span>
                      <span className="text-[10px] text-[#bbb] dark:text-[#555] ml-auto">{ci.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Selection Toolbar (floating) ──────────────────── */}
      {selectionToolbar && (
        <SelectionToolbar
          position={{ x: selectionToolbar.x, y: selectionToolbar.y }}
          text={selectionToolbar.text}
          onAction={handleSelectionAction}
          onClose={() => setSelectionToolbar(null)}
        />
      )}
    </div>
  );
}
