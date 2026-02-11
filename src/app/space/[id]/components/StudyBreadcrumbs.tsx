"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight, Home, LayoutGrid } from "lucide-react";

interface StudyBreadcrumbsProps {
  spaceName: string;
  sourceName?: string;
  onDashboardClick?: () => void;
  onSpaceClick?: () => void;
}

export function StudyBreadcrumbs({
  spaceName,
  sourceName,
}: StudyBreadcrumbsProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className="flex items-center gap-1.5 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg shadow-black/5 pointer-events-auto">
        <Link 
          href="/dashboard"
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          title="Dashboard"
        >
          <Home size={14} className="text-zinc-500" />
        </Link>
        
        <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-700" />
        
        <button className="px-2 py-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
          {spaceName}
        </button>

        {sourceName && (
          <>
            <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-700" />
            <div className="px-2 py-0.5 text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
              {sourceName}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
