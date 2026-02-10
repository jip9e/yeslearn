"use client";
import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Youtube,
  FileText,
  Globe,
  Mic,
  Type,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  ChevronRight,
  FileUp,
  Link2,
  AlertCircle,
  Presentation,
  BookOpen,
  Video,
} from "lucide-react";

type ContentType = "youtube" | "pdf" | "website" | "audio" | "text" | "slides" | "image" | "video" | null;

const CONTENT_TYPES = [
  { id: "youtube" as ContentType, label: "YouTube Video", description: "Paste a YouTube URL to generate notes, quizzes, and chat", icon: Youtube, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  { id: "pdf" as ContentType, label: "PDF / Document", description: "Upload PDF, DOCX, or TXT files up to 50MB", icon: FileText, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "website" as ContentType, label: "Website URL", description: "Paste any webpage URL to extract and learn from its content", icon: Globe, color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  { id: "audio" as ContentType, label: "Audio / Recording", description: "Upload MP3, WAV, M4A, or record directly", icon: Mic, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  { id: "text" as ContentType, label: "Text / Notes", description: "Paste or type your notes, essays, or study material", icon: Type, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { id: "slides" as ContentType, label: "Slides / Presentation", description: "Upload PowerPoint (PPTX) or Google Slides export", icon: Presentation, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-200" },
  { id: "image" as ContentType, label: "Image / Screenshot", description: "Upload images of notes, diagrams, or textbook pages", icon: ImageIcon, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200" },
  { id: "video" as ContentType, label: "Video File", description: "Upload MP4, MOV, or WebM video files up to 500MB", icon: Video, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
];

const SPACES = [
  { id: "bio-101", name: "Biology 101", color: "bg-blue-400" },
  { id: "ml-research", name: "ML Research", color: "bg-green-400" },
  { id: "history-notes", name: "History Notes", color: "bg-purple-400" },
  { id: "physics-201", name: "Physics 201", color: "bg-orange-400" },
  { id: "cs-algorithms", name: "CS Algorithms", color: "bg-red-400" },
];

export default function AddContentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = searchParams.get("type") as ContentType;
  const [selectedType, setSelectedType] = useState<ContentType>(initialType);
  const [selectedSpace, setSelectedSpace] = useState("bio-101");

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubePlaylist, setYoutubePlaylist] = useState(false);

  // PDF state
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfOcr, setPdfOcr] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Website state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteDepth, setWebsiteDepth] = useState("single");

  // Audio state
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [audioLanguage, setAudioLanguage] = useState("auto");
  const [isRecording, setIsRecording] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Text state
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");

  // Slides state
  const [slideFiles, setSlideFiles] = useState<File[]>([]);
  const slideInputRef = useRef<HTMLInputElement>(null);

  // Image state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Video state
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Processing options
  const [generateSummary, setGenerateSummary] = useState(true);
  const [generateQuiz, setGenerateQuiz] = useState(true);
  const [generatePodcast, setGeneratePodcast] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setter((prev) => [...prev, ...files]);
  }, []);

  const removeFile = (setter: React.Dispatch<React.SetStateAction<File[]>>, index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    // No backend - navigate to the space
    router.push(`/space/${selectedSpace}`);
  };

  const isValid = () => {
    switch (selectedType) {
      case "youtube": return youtubeUrl.trim().length > 0;
      case "pdf": return pdfFiles.length > 0;
      case "website": return websiteUrl.trim().length > 0;
      case "audio": return audioFiles.length > 0;
      case "text": return textContent.trim().length > 0;
      case "slides": return slideFiles.length > 0;
      case "image": return imageFiles.length > 0;
      case "video": return videoFiles.length > 0;
      default: return false;
    }
  };

  const renderFileUploadZone = (
    accept: string,
    files: File[],
    setter: React.Dispatch<React.SetStateAction<File[]>>,
    inputRef: React.RefObject<HTMLInputElement | null>,
    label: string,
    sublabel: string
  ) => (
    <div>
      <div
        className="border-2 border-dashed border-[#e0e0e0] rounded-2xl p-8 text-center hover:border-[#bbb] hover:bg-[#fafafa] transition-all cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleFileDrop(e, setter)}
      >
        <FileUp size={32} className="mx-auto mb-3 text-[#ccc]" />
        <p className="text-[14px] font-medium mb-1">{label}</p>
        <p className="text-[12px] text-[#999]">{sublabel}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setter((prev) => [...prev, ...files]);
          }}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#f5f5f5]">
              <FileText size={14} className="text-[#666] shrink-0" />
              <span className="text-[13px] flex-1 truncate">{file.name}</span>
              <span className="text-[11px] text-[#999]">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              <button onClick={() => removeFile(setter, i)} className="text-[#999] hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-[13px] text-[#999] hover:text-black mb-6">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <h1 className="text-[28px] font-bold tracking-tight mb-1">Add Content</h1>
      <p className="text-[#666] text-[15px] mb-8">Choose a content type and add it to one of your spaces.</p>

      {/* Content Type Selector */}
      {!selectedType ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-start gap-4 p-5 rounded-2xl border ${type.border} ${type.bg} text-left hover:shadow-sm transition-all group`}
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <type.icon size={18} className={type.color} />
              </div>
              <div>
                <p className="text-[14px] font-semibold mb-0.5">{type.label}</p>
                <p className="text-[12px] text-[#666]">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {/* Selected type header */}
          <button
            onClick={() => setSelectedType(null)}
            className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-[#f5f5f5] hover:bg-[#eee] transition-colors w-full text-left"
          >
            {(() => {
              const t = CONTENT_TYPES.find((c) => c.id === selectedType)!;
              return (
                <>
                  <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center`}>
                    <t.icon size={16} className={t.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold">{t.label}</p>
                    <p className="text-[11px] text-[#999]">Click to change content type</p>
                  </div>
                  <ChevronRight size={14} className="text-[#ccc]" />
                </>
              );
            })()}
          </button>

          <div className="flex flex-col gap-6">
            {/* Space Selector */}
            <div>
              <label className="block text-[13px] font-medium mb-2">Add to Space</label>
              <div className="flex flex-wrap gap-2">
                {SPACES.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => setSelectedSpace(space.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] border transition-all ${
                      selectedSpace === space.id
                        ? "border-black bg-[#f5f5f5] font-medium"
                        : "border-[#e5e5e5] hover:border-[#ccc]"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm ${space.color}`} />
                    {space.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Type-specific form */}
            {selectedType === "youtube" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-2">YouTube URL</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc]" />
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]"
                      />
                    </div>
                  </div>
                  {youtubeUrl && !youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be") && (
                    <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> Please enter a valid YouTube URL
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={youtubePlaylist}
                    onChange={(e) => setYoutubePlaylist(e.target.checked)}
                    className="w-4 h-4 rounded border-[#ccc] accent-black"
                  />
                  <span className="text-[13px]">Import entire playlist (if URL is a playlist)</span>
                </label>
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Supported formats:</p>
                  <p>• Standard video URLs (youtube.com/watch?v=...)</p>
                  <p>• Short URLs (youtu.be/...)</p>
                  <p>• Playlist URLs (youtube.com/playlist?list=...)</p>
                  <p>• Chapters and timestamps will be automatically detected</p>
                </div>
              </div>
            )}

            {selectedType === "pdf" && (
              <div className="flex flex-col gap-4">
                {renderFileUploadZone(
                  ".pdf,.doc,.docx,.txt,.rtf,.epub",
                  pdfFiles,
                  setPdfFiles,
                  pdfInputRef,
                  "Drop files here or click to browse",
                  "Supports PDF, DOC, DOCX, TXT, RTF, EPUB — up to 50MB each"
                )}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pdfOcr}
                    onChange={(e) => setPdfOcr(e.target.checked)}
                    className="w-4 h-4 rounded border-[#ccc] accent-black"
                  />
                  <div>
                    <span className="text-[13px]">Enable OCR (Optical Character Recognition)</span>
                    <p className="text-[11px] text-[#999]">Use for scanned documents or image-based PDFs</p>
                  </div>
                </label>
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Processing includes:</p>
                  <p>• Text extraction and chunking</p>
                  <p>• Table and figure detection</p>
                  <p>• Heading and section structure recognition</p>
                  <p>• Formula and equation parsing (LaTeX)</p>
                </div>
              </div>
            )}

            {selectedType === "website" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-2">Website URL</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc]" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-2">Crawl Depth</label>
                  <div className="flex gap-2">
                    {[
                      { id: "single", label: "Single Page", desc: "Only this URL" },
                      { id: "shallow", label: "Shallow", desc: "Page + linked pages (1 level)" },
                      { id: "deep", label: "Deep", desc: "Full site crawl (up to 50 pages)" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setWebsiteDepth(opt.id)}
                        className={`flex-1 px-3 py-3 rounded-xl border text-center transition-all ${
                          websiteDepth === opt.id
                            ? "border-black bg-[#f5f5f5]"
                            : "border-[#e5e5e5] hover:border-[#ccc]"
                        }`}
                      >
                        <p className="text-[13px] font-medium">{opt.label}</p>
                        <p className="text-[10px] text-[#999]">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Web extraction features:</p>
                  <p>• Automatic article/content detection</p>
                  <p>• Removes ads, navigation, and clutter</p>
                  <p>• Preserves images, code blocks, and tables</p>
                  <p>• Works with paywalled sites (if you have access)</p>
                </div>
              </div>
            )}

            {selectedType === "audio" && (
              <div className="flex flex-col gap-4">
                {renderFileUploadZone(
                  ".mp3,.wav,.m4a,.ogg,.flac,.aac,.wma",
                  audioFiles,
                  setAudioFiles,
                  audioInputRef,
                  "Drop audio files here or click to browse",
                  "Supports MP3, WAV, M4A, OGG, FLAC, AAC — up to 200MB each"
                )}
                <div className="text-center text-[12px] text-[#999]">— or —</div>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all ${
                    isRecording
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-[#e0e0e0] hover:border-[#bbb] text-[#666]"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-[#ccc]"}`} />
                  <span className="text-[14px] font-medium">{isRecording ? "Recording... Click to stop" : "Record Audio"}</span>
                </button>
                <div>
                  <label className="block text-[13px] font-medium mb-2">Transcription Language</label>
                  <select
                    value={audioLanguage}
                    onChange={(e) => setAudioLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Audio processing:</p>
                  <p>• AI transcription with speaker diarization</p>
                  <p>• Automatic chapter/topic detection</p>
                  <p>• Background noise filtering</p>
                  <p>• Supports 50+ languages</p>
                </div>
              </div>
            )}

            {selectedType === "text" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    placeholder="e.g., Lecture Notes - Week 5"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-2">Content</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste or type your notes, essays, study material, or any text content here..."
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] resize-none placeholder:text-[#ccc] font-mono leading-relaxed"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-[11px] text-[#999]">Supports Markdown, LaTeX, and plain text</p>
                    <p className="text-[11px] text-[#999]">{textContent.length.toLocaleString()} characters</p>
                  </div>
                </div>
              </div>
            )}

            {selectedType === "slides" && (
              <div className="flex flex-col gap-4">
                {renderFileUploadZone(
                  ".pptx,.ppt,.key,.odp",
                  slideFiles,
                  setSlideFiles,
                  slideInputRef,
                  "Drop presentation files here or click to browse",
                  "Supports PPTX, PPT, KEY, ODP — up to 100MB each"
                )}
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Slide processing:</p>
                  <p>• Extracts text, images, and speaker notes</p>
                  <p>• Preserves slide order and structure</p>
                  <p>• Detects diagrams and charts</p>
                  <p>• Each slide becomes a navigable section</p>
                </div>
              </div>
            )}

            {selectedType === "image" && (
              <div className="flex flex-col gap-4">
                {renderFileUploadZone(
                  ".png,.jpg,.jpeg,.gif,.webp,.svg,.heic",
                  imageFiles,
                  setImageFiles,
                  imageInputRef,
                  "Drop images here or click to browse",
                  "Supports PNG, JPG, GIF, WebP, SVG, HEIC — up to 20MB each"
                )}
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Image processing:</p>
                  <p>• OCR for handwritten and printed text</p>
                  <p>• Diagram and chart analysis</p>
                  <p>• Math equation recognition</p>
                  <p>• Multi-image batch processing</p>
                </div>
              </div>
            )}

            {selectedType === "video" && (
              <div className="flex flex-col gap-4">
                {renderFileUploadZone(
                  ".mp4,.mov,.webm,.avi,.mkv",
                  videoFiles,
                  setVideoFiles,
                  videoInputRef,
                  "Drop video files here or click to browse",
                  "Supports MP4, MOV, WebM, AVI, MKV — up to 500MB each"
                )}
                <div className="bg-[#f8f8f8] rounded-xl p-4 text-[12px] text-[#666] space-y-1">
                  <p className="font-medium text-[#333]">Video processing:</p>
                  <p>• Audio transcription with timestamps</p>
                  <p>• Visual content analysis (slides, whiteboard)</p>
                  <p>• Automatic chapter detection</p>
                  <p>• Frame-by-frame key moment extraction</p>
                </div>
              </div>
            )}

            {/* Processing Options */}
            <div className="border-t border-[#e5e5e5] pt-6">
              <label className="block text-[13px] font-medium mb-3">Auto-generate on import</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8f8f8] cursor-pointer hover:bg-[#f1f1f1] transition-colors">
                  <input type="checkbox" checked={generateSummary} onChange={(e) => setGenerateSummary(e.target.checked)} className="w-4 h-4 rounded accent-black" />
                  <div>
                    <span className="text-[13px] font-medium">Summary & Key Points</span>
                    <p className="text-[11px] text-[#999]">AI-generated summary with key takeaways</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8f8f8] cursor-pointer hover:bg-[#f1f1f1] transition-colors">
                  <input type="checkbox" checked={generateQuiz} onChange={(e) => setGenerateQuiz(e.target.checked)} className="w-4 h-4 rounded accent-black" />
                  <div>
                    <span className="text-[13px] font-medium">Quiz Questions</span>
                    <p className="text-[11px] text-[#999]">Multiple choice and short answer questions</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f8f8f8] cursor-pointer hover:bg-[#f1f1f1] transition-colors">
                  <input type="checkbox" checked={generatePodcast} onChange={(e) => setGeneratePodcast(e.target.checked)} className="w-4 h-4 rounded accent-black" />
                  <div>
                    <span className="text-[13px] font-medium">AI Podcast</span>
                    <p className="text-[11px] text-[#999]">Audio overview narrated by AI</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-[14px] font-medium text-center hover:bg-[#f8f8f8] transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleAdd}
                disabled={!isValid()}
                className="flex-1 py-3 rounded-xl bg-black text-white text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                Add to Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
