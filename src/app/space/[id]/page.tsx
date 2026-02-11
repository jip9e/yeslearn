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

  const [aiPanelOpen, setAIPanelOpen] = useState(true);
  const [aiPanelTab, setAIPanelTab] = useState<AIPanelTab>("learn");
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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* ── Clean Top Bar ───────────────────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[16px] font-bold shadow-lg">
              {space.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-semibold text-[18px] text-gray-900 dark:text-white">{space.name}</h1>
              {space.description && (
                <p className="text-[13px] text-gray-500 dark:text-gray-400">{space.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/add?spaceId=${space.id}`} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[14px] font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={16} /> Add Content
          </Link>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden" ref={mainContainerRef}>

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-all duration-300 flex flex-col" ref={contentRef}>
          {selectedItem ? (
            <>
              {/* Content header with back button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                    title="Back to content list"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                      {getTypeIcon(selectedItem.type)}
                    </div>
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">{selectedItem.name}</h2>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteContent(selectedItem.id)} 
                  disabled={deleting === selectedItem.id} 
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                >
                  {deleting === selectedItem.id ? (
                    <Loader2 size={16} className="animate-spin text-red-400" />
                  ) : (
                    <Trash2 size={16} className="text-red-400 group-hover:text-red-500" />
                  )}
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
            // Content Grid View (like youlearn.ai)
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto">
                {/* Search bar */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm max-w-2xl">
                    <Search size={18} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your content..."
                      className="bg-transparent text-[15px] outline-none flex-1 placeholder:text-gray-400 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Content Grid */}
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <BookOpen size={36} className="text-white" />
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
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedContent(item.id)}
                          className="group text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                          {/* Hover gradient effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="relative">
                            {/* Icon and type */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                                <IconComponent size={24} />
                              </div>
                              <span className="text-[11px] px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                                {item.type}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
            {/* ═══ RESIZE HANDLE ═══ */}
            <div
              className={`resize-handle ${isDragging ? "dragging" : ""}`}
              onMouseDown={handleResizeStart}
            />

            {/* ═══ AI PANEL ═══ */}
            <div
              className="bg-white dark:bg-gray-900 flex flex-col shrink-0 transition-[width] duration-100 border-l border-gray-200 dark:border-gray-800"
              style={{ width: aiPanelWidth }}
            >
              {/* Panel header */}
              <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  AI Assistant
                </h3>
                <button 
                  onClick={() => setAIPanelOpen(false)} 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                  title="Close panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Panel content - Combined Learn & Chat */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-5 space-y-6">
                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <ToolCard icon={<Brain size={16} />} label="Quiz" color="#8b5cf6" loading={generatingQuiz} onClick={handleGenerateQuiz} />
                      <ToolCard icon={<FileText size={16} />} label="Summary" color="#f59e0b" loading={generatingSummary} onClick={handleGenerateSummary} />
                    </div>
                  </div>

                  {/* Summaries */}
                  {space.summaries.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Summary</h4>
                        <button 
                          onClick={handleGenerateSummary} 
                          disabled={generatingSummary} 
                          className="text-[12px] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                        >
                          {generatingSummary ? "Generating..." : "Refresh"}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {space.summaries.map((s) => (
                          <div key={s.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-[13px] font-medium mb-2 text-gray-900 dark:text-white">{s.title}</p>
                            <div className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed prose-ai">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content.slice(0, 300)}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Section - Always visible */}
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <MessageSquare size={16} />
                      Chat with AI
                    </h4>
                    
                    {/* Chat messages */}
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-[13px]">
                          Ask me anything about this content
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "ai" && (
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                                <Sparkles size={14} />
                              </div>
                            )}
                            <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                              <div className={`p-3 rounded-xl ${
                                msg.role === "user"
                                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                              }`}>
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  className="text-[13px] leading-relaxed prose-ai"
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-3 border-t border-gray-200 dark:border-gray-800">
                      {quotedText && (
                        <div className="mb-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mb-1">Quoted text:</p>
                            <p className="text-[12px] text-gray-700 dark:text-gray-300 line-clamp-2">{quotedText}</p>
                          </div>
                          <button onClick={() => setQuotedText(null)} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors">
                            <X size={14} className="text-blue-600 dark:text-blue-400" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChat();
                            }
                          }}
                          placeholder="Ask a question..."
                          disabled={sendingChat}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-[14px] outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all disabled:opacity-50 text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                        <button
                          onClick={handleSendChat}
                          disabled={!chatInput.trim() || sendingChat}
                          className="px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingChat ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Toggle AI Panel Button (when closed and content is selected) */}
        {selectedItem && !aiPanelOpen && (
          <button
            onClick={() => setAIPanelOpen(true)}
            className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 hover:scale-110"
            title="Open AI Assistant"
          >
            <Sparkles size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
