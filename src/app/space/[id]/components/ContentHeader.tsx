"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Loader2, Youtube, FileText, Globe, Mic } from "lucide-react";
import { ContentItem } from "../types";

interface ContentHeaderProps {
  item: ContentItem;
  spaceId: string;
  onBack: () => void;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "youtube": return <Youtube size={14} />;
    case "pdf": return <FileText size={14} />;
    case "website": return <Globe size={14} />;
    case "audio": return <Mic size={14} />;
    default: return <FileText size={14} />;
  }
};

export function ContentHeader({ item, spaceId, onBack, onDelete, deletingId }: ContentHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-muted-foreground hover:text-foreground"
          title="Back to content list"
          aria-label="Back to content list"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-border/50">
          <span className="text-muted-foreground">{getTypeIcon(item.type)}</span>
          <h2 className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-[400px]">{item.name}</h2>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Link
          href={`/dashboard/add?spaceId=${spaceId}`}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-muted-foreground hover:text-foreground"
          title="Add Content"
          aria-label="Add content"
        >
          <Plus size={18} />
        </Link>
        <button
          onClick={() => onDelete(item.id, item.name)}
          disabled={deletingId === item.id}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-muted-foreground hover:text-red-500"
          aria-label={`Delete ${item.name}`}
        >
          {deletingId === item.id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
