"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderOpen,
  Clock,
  Plus,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  BookOpen,
} from "lucide-react";

const SAMPLE_SPACES = [
  { id: "bio-101", name: "Biology 101", color: "bg-blue-400", items: 12 },
  { id: "ml-research", name: "ML Research", color: "bg-green-400", items: 8 },
  { id: "history-notes", name: "History Notes", color: "bg-purple-400", items: 5 },
  { id: "physics-201", name: "Physics 201", color: "bg-orange-400", items: 15 },
  { id: "cs-algorithms", name: "CS Algorithms", color: "bg-red-400", items: 7 },
];

const RECENT_ITEMS = [
  { name: "Cell Division Lecture", type: "YouTube", spaceId: "bio-101" },
  { name: "Neural Networks Paper", type: "PDF", spaceId: "ml-research" },
  { name: "World War II Notes", type: "Notes", spaceId: "history-notes" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-[#e5e5e5] flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e5e5e5]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-black">
            <span className="text-white font-bold text-[13px]">Y</span>
          </div>
          <span className="text-[16px] font-semibold tracking-tight">YesLearn</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f5f5f5] text-[#999]">
          <Search size={14} />
          <span className="text-[13px]">Search...</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="px-3 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              isActive("/dashboard")
                ? "bg-[#f1f1f1] text-black"
                : "text-[#666] hover:bg-[#f8f8f8] hover:text-black"
            }`}
          >
            <Home size={16} />
            Home
          </Link>

          {/* Spaces section */}
          <div className="mt-4">
            <button
              onClick={() => setSpacesOpen(!spacesOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-[#999] uppercase tracking-wider hover:text-[#666]"
            >
              <span>My Spaces</span>
              {spacesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            {spacesOpen && (
              <div className="flex flex-col gap-0.5 mt-1">
                {SAMPLE_SPACES.map((space) => (
                  <Link
                    key={space.id}
                    href={`/space/${space.id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors group ${
                      pathname === `/space/${space.id}`
                        ? "bg-[#f1f1f1] text-black font-medium"
                        : "text-[#666] hover:bg-[#f8f8f8] hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-sm ${space.color}`} />
                      <span className="truncate max-w-[140px]">{space.name}</span>
                    </div>
                    <span className="text-[11px] text-[#bbb] group-hover:text-[#999]">
                      {space.items}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/space/new"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#999] hover:bg-[#f8f8f8] hover:text-black transition-colors"
                >
                  <Plus size={14} />
                  <span>New Space</span>
                </Link>
              </div>
            )}
          </div>

          {/* Recent section */}
          <div className="mt-4">
            <button
              onClick={() => setRecentOpen(!recentOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-[#999] uppercase tracking-wider hover:text-[#666]"
            >
              <span>Recent</span>
              {recentOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            {recentOpen && (
              <div className="flex flex-col gap-0.5 mt-1">
                {RECENT_ITEMS.map((item, i) => (
                  <Link
                    key={i}
                    href={`/space/${item.spaceId}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#666] hover:bg-[#f8f8f8] hover:text-black transition-colors"
                  >
                    <Clock size={14} className="text-[#bbb] shrink-0" />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto text-[10px] text-[#ccc] shrink-0">{item.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#e5e5e5] px-3 py-3 flex flex-col gap-0.5">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
            isActive("/settings")
              ? "bg-[#f1f1f1] text-black font-medium"
              : "text-[#666] hover:bg-[#f8f8f8] hover:text-black"
          }`}
        >
          <Settings size={16} />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">AJ</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium truncate">Alex Johnson</span>
            <span className="text-[11px] text-[#999] truncate">alex@example.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
