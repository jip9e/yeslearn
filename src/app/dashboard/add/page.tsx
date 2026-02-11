"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Youtube,
  FileText,
  Globe,
  Mic,
  Upload,
  X,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ContentType {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  description: string;
}

const CONTENT_TYPES: ContentType[] = [
  { id: "youtube", label: "YouTube Video", icon: Youtube, color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800", description: "Paste a YouTube URL to extract the transcript" },
  { id: "pdf", label: "PDF / Document", icon: FileText, color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800", description: "Upload a PDF file to extract text content" },
  { id: "website", label: "Website URL", icon: Globe, color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800", description: "Paste a website URL to extract its content" },
  { id: "text", label: "Text / Notes", icon: FileText, color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800", description: "Paste or type text content directly" },
];

interface Space {
  id: string;
  name: string;
  icon: string;
}

export default function AddContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = searchParams.get("type") || "youtube";
  const preselectedSpaceId = searchParams.get("spaceId") || "";

  const [selectedType, setSelectedType] = useState(initialType);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState(preselectedSpaceId);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch spaces for the selector
  useEffect(() => {
    fetch("/api/spaces")
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        if (!selectedSpaceId && data.length > 0) {
          setSelectedSpaceId(data[0].id);
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (!selectedSpaceId) {
      setError("Please select or create a space first.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("spaceId", selectedSpaceId);
      formData.append("type", selectedType);
      formData.append("name", name || getAutoName());

      if (selectedType === "youtube" || selectedType === "website") {
        if (!url.trim()) {
          setError("Please enter a URL.");
          setSubmitting(false);
          return;
        }
        formData.append("sourceUrl", url.trim());
      }

      if (selectedType === "pdf") {
        if (!file) {
          setError("Please select a PDF file.");
          setSubmitting(false);
          return;
        }
        formData.append("file", file);
      }

      if (selectedType === "text") {
        if (!textContent.trim()) {
          setError("Please enter some text.");
          setSubmitting(false);
          return;
        }
        formData.append("text", textContent);
      }

      const res = await fetch("/api/content", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add content");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/space/${selectedSpaceId}`);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add content");
      setSubmitting(false);
    }
  };

  const getAutoName = () => {
    if (selectedType === "youtube" && url) {
      return `YouTube: ${url.split("v=")[1]?.slice(0, 11) || url.slice(0, 40)}`;
    }
    if (selectedType === "pdf" && file) return file.name;
    if (selectedType === "website" && url) {
      try {
        return new URL(url).hostname;
      } catch {
        return url.slice(0, 40);
      }
    }
    if (selectedType === "text") return "Text Note";
    return "Untitled";
  };

  if (success) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-[640px] mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-4 pl-14 md:pl-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Check size={32} className="text-gray-900 dark:text-white" />
        </div>
        <h2 className="text-[20px] font-semibold">Content Added!</h2>
        <p className="text-[14px] text-[#999]">Redirecting to your space...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[640px] mx-auto pl-14 md:pl-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-[#999] hover:text-black dark:hover:text-white mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight mb-1 dark:text-white">Add Content</h1>
      <p className="text-[#666] dark:text-[#999] text-[14px] sm:text-[15px] mb-6 sm:mb-8">Add learning materials to your space.</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Space Selector */}
        <div>
          <label className="block text-[13px] font-medium mb-2 dark:text-white">Space</label>
          {spaces.length === 0 ? (
            <div className="p-4 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-[#fafafa] dark:bg-[#1a1a1a] text-center">
              <p className="text-[13px] text-[#999] dark:text-[#777] mb-2">No spaces yet</p>
              <Link href="/space/new" className="text-[13px] text-black dark:text-white font-medium hover:opacity-70">
                + Create a space first
              </Link>
            </div>
          ) : (
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Content Type Selector */}
        <div>
          <label className="block text-[13px] font-medium mb-2 dark:text-white">Content Type</label>
          <div className="grid grid-cols-2 gap-3">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedType === type.id
                    ? "border-black dark:border-white bg-[#fafafa] dark:bg-[#1a1a1a]"
                    : "border-[#e5e5e5] dark:border-[#333] hover:border-[#ccc] dark:hover:border-[#555]"
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center mb-2`}>
                  <type.icon size={16} className={type.color} />
                </div>
                <p className="text-[13px] font-medium dark:text-white">{type.label}</p>
                <p className="text-[11px] text-[#999] dark:text-[#777] mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[13px] font-medium mb-2 dark:text-white">
            Name <span className="text-[#ccc] dark:text-[#555]">(auto-generated if empty)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={getAutoName()}
            className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 placeholder:text-[#ccc] dark:placeholder:text-[#555]"
          />
        </div>

        {/* YouTube / Website URL Input */}
        {(selectedType === "youtube" || selectedType === "website") && (
          <div>
            <label className="block text-[13px] font-medium mb-2 dark:text-white">
              {selectedType === "youtube" ? "YouTube URL" : "Website URL"}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                selectedType === "youtube"
                  ? "https://www.youtube.com/watch?v=..."
                  : "https://example.com/article"
              }
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 placeholder:text-[#ccc] dark:placeholder:text-[#555]"
            />
          </div>
        )}

        {/* PDF Upload */}
        {selectedType === "pdf" && (
          <div>
            <label className="block text-[13px] font-medium mb-2 dark:text-white">PDF File</label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a]">
                <FileText size={20} className="text-gray-600 dark:text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate dark:text-white">{file.name}</p>
                  <p className="text-[11px] text-[#999] dark:text-[#777]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 rounded hover:bg-[#f1f1f1] dark:hover:bg-[#333]"
                >
                  <X size={14} className="text-[#999] dark:text-[#777]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 rounded-xl border-2 border-dashed border-[#e0e0e0] dark:border-[#444] flex flex-col items-center gap-2 hover:border-[#bbb] dark:hover:border-[#666] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-all"
              >
                <Upload size={24} className="text-[#ccc] dark:text-[#555]" />
                <p className="text-[13px] text-[#999] dark:text-[#777]">Click to select a PDF file</p>
                <p className="text-[11px] text-[#ccc] dark:text-[#555]">Max 50MB</p>
              </button>
            )}
          </div>
        )}

        {/* Text Input */}
        {selectedType === "text" && (
          <div>
            <label className="block text-[13px] font-medium mb-2 dark:text-white">Text Content</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste or type your notes, text content, etc."
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] dark:text-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 resize-none placeholder:text-[#ccc] dark:placeholder:text-[#555]"
            />
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || spaces.length === 0}
          className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            "Add Content"
          )}
        </button>
      </div>
    </div>
  );
}
