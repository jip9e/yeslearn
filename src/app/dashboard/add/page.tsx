"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
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
  { id: "youtube", label: "YouTube Video", icon: Youtube, color: "text-muted-foreground", bg: "bg-secondary", description: "Paste a YouTube URL to extract the transcript" },
  { id: "pdf", label: "PDF / Document", icon: FileText, color: "text-muted-foreground", bg: "bg-secondary", description: "Upload a PDF file to extract text content" },
  { id: "website", label: "Website URL", icon: Globe, color: "text-muted-foreground", bg: "bg-secondary", description: "Paste a website URL to extract its content" },
  { id: "text", label: "Text / Notes", icon: FileText, color: "text-muted-foreground", bg: "bg-secondary", description: "Paste or type text content directly" },
];

interface Space {
  id: string;
  name: string;
  icon: string;
}

export default function AddContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedType = searchParams.get("type") || "youtube";
  const preselectedSpaceId = searchParams.get("spaceId") || "";
  const allowedTypeIds = new Set(CONTENT_TYPES.map((type) => type.id));
  const initialType = allowedTypeIds.has(requestedType) ? requestedType : "youtube";

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

  const clearError = () => {
    if (error) setError("");
  };

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Check size={32} className="text-foreground" />
        </div>
        <h2 className="text-[20px] font-semibold">Content Added!</h2>
        <p className="text-[14px] text-muted-foreground/80">Redirecting to your space...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[640px] mx-auto pl-14 md:pl-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight mb-1 text-foreground">Add Content</h1>
      <p className="text-muted-foreground text-[14px] sm:text-[15px] mb-6 sm:mb-8">Add learning materials to your space.</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2" role="alert" aria-live="polite">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Space Selector */}
        <div>
          <label htmlFor="space-select" className="block text-[13px] font-medium mb-2 text-foreground">
            Space <span className="text-red-600" aria-label="required">*</span>
          </label>
          {spaces.length === 0 ? (
            <div className="p-4 rounded-xl border border-border bg-card text-center" role="alert">
              <p className="text-[13px] text-muted-foreground/80 mb-2">No spaces yet</p>
              <Link href="/space/new" className="text-[13px] text-foreground font-medium hover:opacity-70">
                + Create a space first
              </Link>
            </div>
          ) : (
            <select
              id="space-select"
              value={selectedSpaceId}
              onChange={(e) => {
                setSelectedSpaceId(e.target.value);
                clearError();
              }}
              required
              aria-required="true"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-card text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
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
          <fieldset>
            <legend className="block text-[13px] font-medium mb-2 text-foreground">
              Content Type <span className="text-red-600" aria-label="required">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Content type selection">
              {CONTENT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    clearError();
                  }}
                  role="radio"
                  aria-checked={selectedType === type.id}
                  aria-label={`${type.label}: ${type.description}`}
                  className={`p-4 rounded-xl border-2 text-left transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white ${selectedType === type.id
                      ? "border-primary bg-card"
                      : "border-border hover:border-border/80"
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center mb-2`}>
                    <type.icon size={16} className={type.color} aria-hidden="true" />
                  </div>
                  <p className="text-[13px] font-medium text-foreground">{type.label}</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">{type.description}</p>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="content-name" className="block text-[13px] font-medium mb-2 text-foreground">
            Name <span className="text-muted-foreground/70">(auto-generated if empty)</span>
          </label>
          <input
            id="content-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={getAutoName()}
            aria-describedby="name-help"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-card text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white placeholder:text-muted-foreground/70"
          />
          <p id="name-help" className="sr-only">Leave empty to auto-generate name based on content</p>
        </div>

        {/* YouTube / Website URL Input */}
        {(selectedType === "youtube" || selectedType === "website") && (
          <div>
            <label htmlFor="content-url" className="block text-[13px] font-medium mb-2 text-foreground">
              {selectedType === "youtube" ? "YouTube URL" : "Website URL"} <span className="text-red-600" aria-label="required">*</span>
            </label>
            <input
              id="content-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                clearError();
              }}
              required
              aria-required="true"
              aria-describedby={error && !url.trim() ? "url-error" : undefined}
              aria-invalid={error && !url.trim() ? "true" : "false"}
              placeholder={
                selectedType === "youtube"
                  ? "https://www.youtube.com/watch?v=..."
                  : "https://example.com/article"
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-card text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white placeholder:text-muted-foreground/70"
            />
            {error && !url.trim() && (
              <p id="url-error" className="text-[12px] text-red-600 dark:text-red-400 mt-1">
                Please enter a URL
              </p>
            )}
          </div>
        )}

        {/* PDF Upload */}
        {selectedType === "pdf" && (
          <div>
            <label htmlFor="pdf-upload" className="block text-[13px] font-medium mb-2 text-foreground">
              PDF File <span className="text-red-600" aria-label="required">*</span>
            </label>
            <input
              id="pdf-upload"
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                clearError();
              }}
              required
              aria-required="true"
              aria-describedby={error && !file ? "pdf-error" : "pdf-help"}
              className="sr-only"
            />
            {file ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background dark:bg-card">
                <FileText size={20} className="text-muted-foreground" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground/80">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    clearError();
                  }}
                  aria-label="Remove selected PDF file"
                  className="p-1 rounded hover:bg-secondary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
                >
                  <X size={14} className="text-muted-foreground/80" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Select a PDF file to upload (max 50MB)"
                className="w-full p-8 rounded-xl border-2 border-dashed border-border flex flex-col items-center gap-2 hover:border-border/80 hover:bg-secondary transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
              >
                <Upload size={24} className="text-muted-foreground/70" aria-hidden="true" />
                <p className="text-[13px] text-muted-foreground/80">Click to select a PDF file</p>
                <p className="text-[11px] text-muted-foreground/70" id="pdf-help">Max 50MB</p>
              </button>
            )}
            {error && !file && (
              <p id="pdf-error" className="text-[12px] text-red-600 dark:text-red-400 mt-1">
                Please select a PDF file
              </p>
            )}
          </div>
        )}

        {/* Text Input */}
        {selectedType === "text" && (
          <div>
            <label htmlFor="text-content" className="block text-[13px] font-medium mb-2 text-foreground">
              Text Content <span className="text-red-600" aria-label="required">*</span>
            </label>
            <textarea
              id="text-content"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                clearError();
              }}
              placeholder="Paste or type your notes, text content, etc."
              required
              aria-required="true"
              aria-describedby={error && !textContent.trim() ? "text-error" : undefined}
              aria-invalid={error && !textContent.trim() ? "true" : "false"}
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background dark:bg-card text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white resize-none placeholder:text-muted-foreground/70"
            />
            {error && !textContent.trim() && (
              <p id="text-error" className="text-[12px] text-red-600 dark:text-red-400 mt-1">
                Please enter some text
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || spaces.length === 0}
          aria-disabled={submitting || spaces.length === 0}
          aria-label={submitting ? "Processing content submission" : "Add content to space"}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Processing...
            </>
          ) : (
            "Add Content"
          )}
        </button>
      </form>
    </div>
  );
}

