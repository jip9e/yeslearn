"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Youtube,
  FileText,
  Globe,
  Mic,
  ArrowRight,
  BookOpen,
  BarChart3,
  Zap,
} from "lucide-react";

interface Space {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
  updatedAt: string;
}

interface Stats {
  spaceCount: number;
  itemCount: number;
  quizCount: number;
  recentActivity: {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    spaceId: string;
    spaceName: string;
  }[];
}

const QUICK_ACTIONS = [
  { label: "YouTube Video", icon: Youtube, href: "/dashboard/add?type=youtube" },
  { label: "PDF / Document", icon: FileText, href: "/dashboard/add?type=pdf" },
  { label: "Website URL", icon: Globe, href: "/dashboard/add?type=website" },
  { label: "Audio / Recording", icon: Mic, href: "/dashboard/add?type=audio" },
];

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
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/spaces").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ])
      .then(([spacesData, statsData]) => {
        setSpaces(spacesData);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-[1100px] mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-1 dark:text-white">
          Welcome to YesLearn
        </h1>
        <p className="text-[#888] dark:text-[#666] text-[15px]">
          {spaces.length > 0
            ? "Continue learning or add new content to your spaces."
            : "Get started by creating your first learning space."}
        </p>
      </div>

      {/* Stats — monochrome */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: BookOpen, value: stats?.spaceCount || 0, label: "Active Spaces" },
          { icon: BarChart3, value: stats?.itemCount || 0, label: "Total Items" },
          { icon: Zap, value: stats?.quizCount || 0, label: "Quizzes Completed" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#111] rounded-xl border border-[#eee] dark:border-[#1a1a1a] p-5 flex items-center gap-4 hover:border-[#ccc] dark:hover:border-[#333] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center">
              <stat.icon size={18} className="text-[#666] dark:text-[#888]" />
            </div>
            <div>
              <p className="text-[24px] font-bold dark:text-white">{stat.value}</p>
              <p className="text-[12px] text-[#999] dark:text-[#666]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add — monochrome */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold dark:text-white">Quick Add Content</h2>
          <Link href="/dashboard/add" className="text-[13px] text-[#999] hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
            All types <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white dark:bg-[#111] rounded-xl border border-[#eee] dark:border-[#1a1a1a] p-4 flex flex-col items-center gap-3 hover:border-[#ccc] dark:hover:border-[#333] hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center group-hover:scale-110 transition-transform">
                <action.icon size={18} className="text-[#555] dark:text-[#888]" />
              </div>
              <span className="text-[13px] font-medium text-[#666] dark:text-[#888] group-hover:text-black dark:group-hover:text-white transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spaces — monochrome */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold dark:text-white">My Spaces</h2>
          <Link href="/space/new" className="text-[13px] text-black dark:text-white font-medium flex items-center gap-1.5 hover:opacity-70">
            <Plus size={14} /> New Space
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/space/${space.id}`}
              className="bg-white dark:bg-[#111] rounded-xl border border-[#eee] dark:border-[#1a1a1a] p-5 hover:border-[#ccc] dark:hover:border-[#333] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center text-[13px] font-semibold text-[#555] dark:text-[#888]">
                  {space.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-[15px] font-semibold dark:text-white group-hover:text-black dark:group-hover:text-white">
                  {space.name}
                </h3>
              </div>
              <div className="flex items-center justify-between text-[12px] text-[#999] dark:text-[#555]">
                <span>{space.itemCount} items</span>
                <span>{timeAgo(space.updatedAt)}</span>
              </div>
            </Link>
          ))}
          <Link
            href="/space/new"
            className="bg-white dark:bg-[#111] rounded-xl border-2 border-dashed border-[#e0e0e0] dark:border-[#222] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#bbb] dark:hover:border-[#444] transition-all min-h-[120px]"
          >
            <Plus size={24} className="text-[#ccc] dark:text-[#444]" />
            <span className="text-[13px] text-[#999] dark:text-[#555]">Create New Space</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity — monochrome */}
      {stats && stats.recentActivity.length > 0 && (
        <div>
          <h2 className="text-[16px] font-semibold mb-4 dark:text-white">Recent Activity</h2>
          <div className="bg-white dark:bg-[#111] rounded-xl border border-[#eee] dark:border-[#1a1a1a] overflow-hidden">
            {stats.recentActivity.map((item, i) => {
              const IconComponent = TYPE_ICONS[item.type] || FileText;
              return (
                <Link
                  key={item.id}
                  href={`/space/${item.spaceId}`}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] dark:hover:bg-[#141414] transition-colors ${i < stats.recentActivity.length - 1 ? "border-b border-[#f0f0f0] dark:border-[#1a1a1a]" : ""
                    }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <IconComponent size={16} className="text-[#666] dark:text-[#888]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate dark:text-white">{item.name}</p>
                    <p className="text-[12px] text-[#999] dark:text-[#666]">{item.spaceName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#666] dark:text-[#888]">{item.type}</span>
                    <p className="text-[11px] text-[#bbb] dark:text-[#444] mt-1">{timeAgo(item.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
