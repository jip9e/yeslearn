"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, BookOpen, FileText, Youtube, Globe, Mic } from "lucide-react";
import { SpaceData, ContentItem } from "../types";

interface ContentGridProps {
  space: SpaceData;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectItem: (id: string) => void;
}

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

export function ContentGrid({ space, searchQuery, setSearchQuery, onSelectItem }: ContentGridProps) {
  const filteredItems = space.contentItems.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Search bar */}
        <div className="mb-10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-md shadow-sm focus-within:shadow-md focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              aria-label="Search content items"
              className="bg-transparent text-[14px] outline-none flex-1 placeholder:text-muted-foreground/50 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-24 h-24 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <BookOpen size={40} className="text-zinc-400 dark:text-zinc-600" />
            </div>
            <h3 className="text-[22px] font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              {space.contentItems.length === 0 ? "Your library is empty" : "No results found"}
            </h3>
            <p className="text-[15px] text-muted-foreground mb-8 max-w-md leading-relaxed">
              {space.contentItems.length === 0
                ? "Upload your study materials, paste links, or record lectures to start your learning journey with AI."
                : "We couldn't find anything matching your search. Try different keywords or clear the search."}
            </p>
            {space.contentItems.length === 0 && (
              <Link
                href={`/dashboard/add?spaceId=${space.id}`}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-[16px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
              >
                <Plus size={20} /> Add Content
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const IconComponent = TYPE_ICONS[item.type] || FileText;
              const thumbnail = item.type === "youtube" ? getYoutubeThumbnail(item.sourceUrl) : null;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  aria-label={`Open ${item.name}`}
                  className="group text-left bg-white dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-2xl hover:shadow-zinc-500/10 transition-all duration-500 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {thumbnail ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-3xl bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={thumbnail}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-lg border border-white/20">
                          <Youtube size={20} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-8 pt-8">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-all duration-500">
                        <IconComponent size={28} />
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                        {item.type}
                      </span>
                    </div>

                    <h3 className="text-[18px] font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground mt-4 font-medium">
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
  );
}
