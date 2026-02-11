"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Youtube, Globe, FileText } from "lucide-react";
import { ContentItem } from "../types";

const PDFViewer = dynamic(() => import("@/components/PDFViewer"), { ssr: false });

interface SourceViewerProps {
  item: ContentItem;
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

export function SourceViewer({ item }: SourceViewerProps) {
  if (item.type === "pdf") {
    return (
      <div className="h-full w-full bg-zinc-50 dark:bg-zinc-950">
        <PDFViewer url={`/api/content/${item.id}/file`} title={item.name} />
      </div>
    );
  }

  if (item.type === "youtube" && item.sourceUrl) {
    const embedUrl = getYoutubeEmbedUrl(item.sourceUrl);
    return (
      <div className="h-full w-full flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto p-6 lg:p-12 space-y-12">
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-200 dark:border-zinc-800">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={`YouTube video: ${item.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white/60 text-sm">Could not load video</p>
                </div>
              )}
            </div>

            {item.extractedText && (
              <div className="space-y-8 pb-20">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <FileText size={20} className="text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100">
                        Transcript
                      </h3>
                      <p className="text-[12px] text-zinc-500">Full video content</p>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
                    {item.extractedText.split(/\s+/).length} Words
                  </div>
                </div>
                <div className="text-[17px] text-zinc-600 dark:text-zinc-400 leading-[1.8] whitespace-pre-line select-text cursor-text max-w-[800px]">
                  {item.extractedText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="max-w-[800px] mx-auto p-8">
        {item.type === "website" && item.sourceUrl && (
          <div className="mb-8 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0">
                <Globe size={18} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">Source URL</p>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-zinc-600 dark:text-zinc-400 hover:underline truncate block"
                >
                  {item.sourceUrl}
                </a>
              </div>
            </div>
          </div>
        )}
        {item.extractedText && (
          <div className="text-[15px] text-zinc-600 dark:text-zinc-400 leading-[2] whitespace-pre-line select-text cursor-text">
            {item.extractedText}
          </div>
        )}
      </div>
    </div>
  );
}
