"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Youtube, FileText, Globe, Upload, X, Check, AlertCircle, Loader2 } from "lucide-react";

interface ContentType {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const CONTENT_TYPES: ContentType[] = [
  { id: "youtube", label: "YouTube Video", icon: Youtube, description: "Paste a YouTube URL." },
  { id: "pdf", label: "PDF / Document", icon: FileText, description: "Upload a PDF file." },
  { id: "website", label: "Website URL", icon: Globe, description: "Paste a webpage link." },
  { id: "text", label: "Text / Notes", icon: FileText, description: "Write or paste text." },
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
      }, 900);
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
      <div className="p-4 sm:p-6 md:p-8 max-w-[640px] mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-3 pl-14 md:pl-8">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
          <Check size={26} className="text-foreground" />
        </div>
        <h2 className="text-[20px] font-semibold text-foreground">Content added</h2>
        <p className="text-[14px] text-muted-foreground">Redirecting to your space...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[680px] mx-auto pl-14 md:pl-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[24px] sm:text-[30px] font-semibold tracking-tight mb-1 text-foreground">Add Content</h1>
      <p className="text-muted-foreground text-[14px] sm:text-[15px] mb-6">Add learning material to one of your spaces.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-[13px] flex items-center gap-2" role="alert" aria-live="polite">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-5">
        <div>
          <label htmlFor="space-select" className="block text-[13px] font-medium mb-2 text-foreground">
            Space <span className="text-destructive" aria-label="required">*</span>
          </label>
          {spaces.length === 0 ? (
            <div className="p-4 rounded-lg border border-border bg-background text-center" role="alert">
              <p className="text-[13px] text-muted-foreground mb-2">No spaces yet</p>
              <Link href="/space/new" className="text-[13px] text-foreground font-medium hover:opacity-80">
                Create a space first
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <fieldset>
          <legend className="block text-[13px] font-medium mb-2 text-foreground">
            Content Type <span className="text-destructive" aria-label="required">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Content type selection">
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
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedType === type.id ? "border-primary bg-secondary/50" : "border-border hover:bg-background"
                }`}
              >
                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center mb-2">
                  <type.icon size={15} className="text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="text-[13px] font-medium text-foreground">{type.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="content-name" className="block text-[13px] font-medium mb-2 text-foreground">
            Name <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="content-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={getAutoName()}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
          />
        </div>

        {(selectedType === "youtube" || selectedType === "website") && (
          <div>
            <label htmlFor="content-url" className="block text-[13px] font-medium mb-2 text-foreground">
              {selectedType === "youtube" ? "YouTube URL" : "Website URL"} <span className="text-destructive">*</span>
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
              placeholder={selectedType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://example.com/article"}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
            />
          </div>
        )}

        {selectedType === "pdf" && (
          <div>
            <label htmlFor="pdf-upload" className="block text-[13px] font-medium mb-2 text-foreground">
              PDF File <span className="text-destructive">*</span>
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
              className="sr-only"
            />
            {file ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                <FileText size={18} className="text-muted-foreground" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    clearError();
                  }}
                  aria-label="Remove selected PDF file"
                  className="p-1 rounded hover:bg-secondary"
                >
                  <X size={14} className="text-muted-foreground" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 rounded-lg border border-dashed border-border bg-background flex flex-col items-center gap-2 hover:bg-secondary/30 transition-colors"
              >
                <Upload size={22} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-[13px] text-muted-foreground">Click to select a PDF file</p>
              </button>
            )}
          </div>
        )}

        {selectedType === "text" && (
          <div>
            <label htmlFor="text-content" className="block text-[13px] font-medium mb-2 text-foreground">
              Text Content <span className="text-destructive">*</span>
            </label>
            <textarea
              id="text-content"
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                clearError();
              }}
              placeholder="Paste or type your notes"
              required
              rows={8}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none placeholder:text-muted-foreground"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || spaces.length === 0}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
