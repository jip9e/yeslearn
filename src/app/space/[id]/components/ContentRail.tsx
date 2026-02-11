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
    <div className="flex h-full flex-col bg-card text-foreground">
      <div className="border-b border-border px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Library
      </div>

      <label className="border-b border-border px-4 py-3 flex items-center gap-3 text-xs text-muted-foreground">
        <Search size={14} className="text-muted-foreground/60" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter content..."
          className="flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </label>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-[12px] text-muted-foreground">No materials yet. Add content from the dashboard.</div>
        ) : (
          filtered.map((item) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            const isActive = selectedContent === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`w-full px-4 py-3.5 text-left transition-colors border-b border-border ${
                  isActive ? "bg-secondary text-foreground" : "bg-transparent hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                  <Icon size={13} className="text-muted-foreground/60" />
                  <span className="uppercase tracking-wide">{item.type}</span>
                  <span className="ml-auto text-muted-foreground/50 text-[10px]">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-[13px] font-medium leading-snug text-foreground line-clamp-2">
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
