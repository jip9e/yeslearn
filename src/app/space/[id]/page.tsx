"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Send,
  FileText,
  Youtube,
  Globe,
  Mic,
  MoreHorizontal,
  MessageSquare,
  BookOpen,
  Brain,
  Headphones,
  Trash2,
  Download,
  Share2,
  Search,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

const SPACE_DATA: Record<string, { name: string; color: string; icon: string }> = {
  "bio-101": { name: "Biology 101", color: "bg-blue-400", icon: "🧬" },
  "ml-research": { name: "ML Research", color: "bg-green-400", icon: "🧠" },
  "history-notes": { name: "History Notes", color: "bg-purple-400", icon: "🌍" },
  "physics-201": { name: "Physics 201", color: "bg-orange-400", icon: "⚡" },
  "cs-algorithms": { name: "CS Algorithms", color: "bg-red-400", icon: "💻" },
};

const CONTENT_ITEMS = [
  { id: "1", name: "Cell Division Lecture", type: "youtube", duration: "45 min", date: "2 days ago" },
  { id: "2", name: "Chapter 5 - Mitosis.pdf", type: "pdf", pages: 24, date: "1 week ago" },
  { id: "3", name: "Biology Textbook Ch.6", type: "website", date: "2 weeks ago" },
  { id: "4", name: "Lab Recording - Session 3", type: "audio", duration: "1h 20min", date: "3 weeks ago" },
  { id: "5", name: "Genetics Overview Slides", type: "pdf", pages: 42, date: "1 month ago" },
];

const SUMMARY_CONTENT = [
  { title: "Cell Division Overview", content: "Cell division is the process by which a parent cell divides into two or more daughter cells. It is usually a small part of a larger cell cycle." },
  { title: "Mitosis Phases", content: "Mitosis consists of prophase, metaphase, anaphase, and telophase. Each phase has distinct characteristics and events." },
  { title: "Key Concepts", content: "DNA replication occurs during the S phase. Chromosome condensation begins in prophase. Spindle fibers attach during metaphase." },
  { title: "Meiosis vs Mitosis", content: "Meiosis produces four haploid cells, while mitosis produces two identical diploid cells. Meiosis involves two rounds of division." },
];

const QUIZ_QUESTIONS = [
  {
    question: "What phase of mitosis involves the alignment of chromosomes along the cell's equator?",
    options: ["Prophase", "Metaphase", "Anaphase", "Telophase"],
    correct: 1,
  },
  {
    question: "How many daughter cells are produced at the end of meiosis?",
    options: ["2", "4", "6", "8"],
    correct: 1,
  },
  {
    question: "During which phase does DNA replication occur?",
    options: ["G1 Phase", "S Phase", "G2 Phase", "M Phase"],
    correct: 1,
  },
];

const CHAT_MESSAGES = [
  { role: "user" as const, content: "What are the main differences between mitosis and meiosis?" },
  {
    role: "ai" as const,
    content:
      "Great question! Here are the key differences:\n\n**Mitosis** produces 2 identical diploid cells, while **Meiosis** produces 4 genetically unique haploid cells.\n\nMitosis involves 1 division, meiosis involves 2 divisions. Crossing over occurs in meiosis (Prophase I) but not in mitosis.\n\n*Source: Cell Division Lecture, 12:34*",
  },
  { role: "user" as const, content: "Can you explain crossing over in more detail?" },
  {
    role: "ai" as const,
    content:
      "Crossing over is the exchange of genetic material between homologous chromosomes during Prophase I of meiosis. This process:\n\n1. Increases genetic variation\n2. Occurs at points called chiasmata\n3. Results in recombinant chromosomes\n\nThis is one of the main reasons offspring are genetically unique from their parents.\n\n*Source: Chapter 5 - Mitosis.pdf, p.18*",
  },
];

type Tab = "content" | "chat" | "summary" | "quiz" | "podcast";

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id as string;
  const space = SPACE_DATA[spaceId] || { name: "Unknown Space", color: "bg-gray-400", icon: "📁" };

  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [selectedContent, setSelectedContent] = useState<string | null>("1");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { role: "user", content: chatInput }]);
    setChatInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I'll look into that based on your uploaded materials. This is a simulated response since no backend is connected. In a real scenario, I would analyze your content and provide sourced answers.",
        },
      ]);
    }, 500);
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "content", label: "Content", icon: <BookOpen size={14} /> },
    { id: "chat", label: "AI Chat", icon: <MessageSquare size={14} /> },
    { id: "summary", label: "Summary", icon: <FileText size={14} /> },
    { id: "quiz", label: "Quiz", icon: <Brain size={14} /> },
    { id: "podcast", label: "Podcast", icon: <Headphones size={14} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Top Header */}
      <div className="border-b border-[#e5e5e5] bg-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#999] hover:text-black">
            <ArrowLeft size={16} />
          </Link>
          <div className={`w-7 h-7 rounded-lg ${space.color} flex items-center justify-center text-sm`}>
            {space.icon}
          </div>
          <h1 className="text-[15px] font-semibold">{space.name}</h1>
          <span className="text-[12px] text-[#bbb]">{CONTENT_ITEMS.length} items</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddContent(!showAddContent)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-[12px] font-medium hover:opacity-90"
          >
            <Plus size={12} /> Add Content
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[#f1f1f1]">
            <Share2 size={14} className="text-[#999]" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-[#f1f1f1]">
            <MoreHorizontal size={14} className="text-[#999]" />
          </button>
        </div>
      </div>

      {/* Add Content Dropdown */}
      {showAddContent && (
        <div className="bg-white border-b border-[#e5e5e5] px-6 py-3">
          <div className="flex gap-2">
            <Link
              href="/dashboard/add?type=youtube"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-[13px] font-medium text-red-600 hover:bg-red-100 transition-colors"
              onClick={() => setShowAddContent(false)}
            >
              <Youtube size={14} /> YouTube Video
            </Link>
            <Link
              href="/dashboard/add?type=pdf"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-[13px] font-medium text-blue-600 hover:bg-blue-100 transition-colors"
              onClick={() => setShowAddContent(false)}
            >
              <FileText size={14} /> PDF / Document
            </Link>
            <Link
              href="/dashboard/add?type=website"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 text-[13px] font-medium text-green-600 hover:bg-green-100 transition-colors"
              onClick={() => setShowAddContent(false)}
            >
              <Globe size={14} /> Website
            </Link>
            <Link
              href="/dashboard/add?type=audio"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 text-[13px] font-medium text-purple-600 hover:bg-purple-100 transition-colors"
              onClick={() => setShowAddContent(false)}
            >
              <Mic size={14} /> Audio
            </Link>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="border-b border-[#e5e5e5] bg-white px-6 flex items-center gap-1 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-[#999] hover:text-[#666]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="flex h-full">
            {/* Content List */}
            <div className="w-[320px] border-r border-[#e5e5e5] bg-white overflow-y-auto shrink-0">
              <div className="p-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f5f5f5] text-[#999] mb-2">
                  <Search size={13} />
                  <span className="text-[12px]">Search content...</span>
                </div>
              </div>
              {CONTENT_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedContent(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selectedContent === item.id
                      ? "bg-[#f5f5f5] border-l-2 border-black"
                      : "hover:bg-[#fafafa] border-l-2 border-transparent"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{item.name}</p>
                    <p className="text-[11px] text-[#bbb]">
                      {item.type === "pdf" ? `${item.pages} pages` : item.duration || ""} · {item.date}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Content Viewer */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedContent ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(CONTENT_ITEMS.find((c) => c.id === selectedContent)?.type || "")}
                      <h2 className="text-[16px] font-semibold">
                        {CONTENT_ITEMS.find((c) => c.id === selectedContent)?.name}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-[#f1f1f1]">
                        <Download size={14} className="text-[#999]" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Simulated content viewer */}
                  {CONTENT_ITEMS.find((c) => c.id === selectedContent)?.type === "youtube" ? (
                    <div className="rounded-2xl bg-black aspect-video w-full flex items-center justify-center mb-6">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                          <Play size={24} className="text-white ml-1" />
                        </div>
                        <p className="text-white/60 text-sm">Cell Division Lecture</p>
                        <p className="text-white/40 text-xs mt-1">Video Player - 45:00</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#e5e5e5] bg-white p-8 mb-6 min-h-[400px]">
                      <div className="space-y-3">
                        <div className="h-4 bg-[#f1f1f1] rounded w-full" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-[90%]" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-[95%]" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-[70%]" />
                        <div className="h-6" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-full" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-[85%]" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-full" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-[60%]" />
                        <div className="h-6" />
                        <div className="h-32 bg-[#f8f8f8] rounded-xl border border-[#e5e5e5]" />
                        <div className="h-6" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-full" />
                        <div className="h-4 bg-[#f1f1f1] rounded w-[80%]" />
                      </div>
                    </div>
                  )}

                  {/* Transcript / Key Points */}
                  <div className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
                    <h3 className="text-[14px] font-semibold mb-3 flex items-center gap-2">
                      <Sparkles size={14} className="text-orange-400" />
                      AI-Generated Key Points
                    </h3>
                    <ul className="space-y-2">
                      <li className="text-[13px] text-[#666] flex gap-2">
                        <ChevronRight size={14} className="text-[#ccc] shrink-0 mt-0.5" />
                        Cell division is essential for growth, repair, and reproduction in organisms.
                      </li>
                      <li className="text-[13px] text-[#666] flex gap-2">
                        <ChevronRight size={14} className="text-[#ccc] shrink-0 mt-0.5" />
                        Mitosis produces two identical diploid daughter cells through a single division.
                      </li>
                      <li className="text-[13px] text-[#666] flex gap-2">
                        <ChevronRight size={14} className="text-[#ccc] shrink-0 mt-0.5" />
                        Meiosis involves two rounds of division, resulting in four haploid gametes.
                      </li>
                      <li className="text-[13px] text-[#666] flex gap-2">
                        <ChevronRight size={14} className="text-[#ccc] shrink-0 mt-0.5" />
                        Crossing over during Prophase I increases genetic diversity.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[#ccc]">
                  <p className="text-[14px]">Select content to view</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-[700px] mx-auto space-y-4">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} className="text-white" />
                  </div>
                  <h3 className="text-[16px] font-semibold mb-1">AI Chat</h3>
                  <p className="text-[13px] text-[#999]">Ask questions about your content. Answers include source references.</p>
                </div>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-[1.6] ${
                        msg.role === "user"
                          ? "bg-black text-white"
                          : "bg-[#f5f5f5] text-[#333]"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#e5e5e5] bg-white px-6 py-4">
              <div className="max-w-[700px] mx-auto flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask anything about your content..."
                  className="flex-1 px-4 py-3 rounded-xl border border-[#e5e5e5] text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-[#ccc]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="max-w-[700px] mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={16} className="text-orange-400" />
                <h2 className="text-[16px] font-semibold">AI-Generated Summary</h2>
              </div>
              <div className="space-y-6">
                {SUMMARY_CONTENT.map((section, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                    <h3 className="text-[15px] font-semibold mb-2">{section.title}</h3>
                    <p className="text-[14px] text-[#666] leading-[1.7]">{section.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-white rounded-2xl border border-[#e5e5e5] p-6">
                <h3 className="text-[15px] font-semibold mb-3">Chapters</h3>
                <div className="space-y-2">
                  {["Introduction to Cell Division", "Phases of Mitosis", "Understanding Meiosis", "Comparing Mitosis & Meiosis", "Practice & Review"].map((ch, i) => (
                    <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f8f8f8] text-left transition-colors">
                      <span className="text-[12px] text-[#bbb] w-5">{i + 1}</span>
                      <span className="text-[13px] text-[#666]">{ch}</span>
                      <span className="ml-auto text-[11px] text-[#ccc]">{["0:00", "8:24", "18:30", "28:15", "38:00"][i]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === "quiz" && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="max-w-[700px] mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-purple-500" />
                  <h2 className="text-[16px] font-semibold">Knowledge Quiz</h2>
                </div>
                {quizSubmitted && (
                  <button
                    onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                    className="text-[13px] text-black font-medium hover:opacity-70"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {QUIZ_QUESTIONS.map((q, qi) => (
                  <div key={qi} className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                    <p className="text-[14px] font-medium mb-4">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = quizAnswers[qi] === oi;
                        const isCorrect = quizSubmitted && oi === q.correct;
                        const isWrong = quizSubmitted && isSelected && oi !== q.correct;
                        return (
                          <button
                            key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] border transition-all ${
                              isCorrect
                                ? "border-green-400 bg-green-50 text-green-700"
                                : isWrong
                                ? "border-red-400 bg-red-50 text-red-700"
                                : isSelected
                                ? "border-black bg-[#f5f5f5]"
                                : "border-[#e5e5e5] hover:border-[#ccc] hover:bg-[#fafafa]"
                            }`}
                            disabled={quizSubmitted}
                          >
                            <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[11px] shrink-0"
                              style={{
                                borderColor: isCorrect ? "#4ade80" : isWrong ? "#f87171" : isSelected ? "#000" : "#e5e5e5",
                                backgroundColor: isSelected && !quizSubmitted ? "#000" : "transparent",
                                color: isSelected && !quizSubmitted ? "#fff" : undefined,
                              }}
                            >
                              {isCorrect ? <CheckCircle2 size={14} className="text-green-500" /> :
                               isWrong ? <XCircle size={14} className="text-red-500" /> :
                               String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && quizAnswers[qi] !== q.correct && (
                      <p className="mt-3 text-[12px] text-[#666] bg-[#f8f8f8] rounded-lg px-3 py-2">
                        The correct answer is <strong>{q.options[q.correct]}</strong>. Review the summary for more details.
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {!quizSubmitted && (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                  className="mt-6 w-full py-3 rounded-xl bg-black text-white text-[14px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Submit Answers
                </button>
              )}
              {quizSubmitted && (
                <div className="mt-6 bg-white rounded-2xl border border-[#e5e5e5] p-6 text-center">
                  <p className="text-[24px] font-bold mb-1">
                    {QUIZ_QUESTIONS.filter((q, i) => quizAnswers[i] === q.correct).length} / {QUIZ_QUESTIONS.length}
                  </p>
                  <p className="text-[13px] text-[#999]">Questions answered correctly</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Podcast Tab */}
        {activeTab === "podcast" && (
          <div className="p-6 overflow-y-auto h-full">
            <div className="max-w-[700px] mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Headphones size={16} className="text-orange-500" />
                <h2 className="text-[16px] font-semibold">AI Podcast</h2>
              </div>
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Headphones size={32} className="text-white" />
                </div>
                <h3 className="text-[16px] font-semibold mb-1">{space.name} - Audio Summary</h3>
                <p className="text-[13px] text-[#999] mb-6">AI-generated podcast covering all key topics in this space</p>

                {/* Audio Player */}
                <div className="bg-[#f5f5f5] rounded-2xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <button
                      onClick={() => setPodcastPlaying(!podcastPlaying)}
                      className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:opacity-90"
                    >
                      {podcastPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: podcastPlaying ? "35%" : "0%" }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[11px] text-[#999]">{podcastPlaying ? "4:12" : "0:00"}</span>
                        <span className="text-[11px] text-[#999]">12:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Episode sections */}
                <div className="mt-6 text-left">
                  <h4 className="text-[13px] font-semibold mb-3">Topics Covered</h4>
                  <div className="space-y-2">
                    {["Introduction & Overview", "Key Concepts Explained", "Deep Dive: Mitosis", "Deep Dive: Meiosis", "Summary & Takeaways"].map((topic, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f8f8f8] cursor-pointer">
                        <span className="text-[11px] text-[#bbb] w-5">{i + 1}</span>
                        <span className="text-[13px] text-[#666] flex-1">{topic}</span>
                        <span className="text-[11px] text-[#ccc]">{["0:00", "2:15", "4:30", "7:45", "10:30"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
