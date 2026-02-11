"use client";
import React from "react";
import { Search, FileText, Youtube, Globe, Mic } from "lucide-react";
import { SpaceData } from "../types";

interface ContentRailProps {
  space: SpaceData;
  selectedContent: string | null;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSelectItem: (id: string) => void;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  pdf: FileText,
  text: FileText,
  youtube: Youtube,
  website: Globe,
  audio: Mic,
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

export function ContentRail({ space, selectedContent, searchQuery, setSearchQuery, onSelectItem }: ContentRailProps) {
  const filtered = space.contentItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-900 px-4 py-3 text-[11px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
        Library
      </div>

      <label className="border-b border-zinc-900 px-4 py-3 flex items-center gap-3 text-xs text-zinc-400">
        <Search size={14} className="text-zinc-600" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter content"
          className="flex-1 bg-transparent text-[12px] uppercase tracking-[0.2em] text-zinc-200 outline-none"
        />
      </label>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-[12px] text-zinc-500">No materials yet. Add content from the dashboard.</div>
        ) : (
          filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            const isActive = selectedContent === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`w-full px-4 py-4 text-left transition-colors ${
                  isActive ? "bg-zinc-900 text-zinc-50" : "bg-transparent hover:bg-zinc-900/40"
                }`}
              >
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  <Icon size={14} className="text-zinc-600" />
                  <span>{item.type}</span>
                  <span className="ml-auto text-zinc-600">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-[13px] font-medium leading-snug text-zinc-100 line-clamp-2">
                  {item.name}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
