"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Upload,
  Youtube,
  FileText,
  Globe,
  Mic,
  TrendingUp,
  BookOpen,
  Clock,
  ArrowRight,
  BarChart3,
  Zap,
} from "lucide-react";

const SPACES = [
  { id: "bio-101", name: "Biology 101", color: "bg-blue-400", items: 12, lastActive: "2 hours ago", progress: 75 },
  { id: "ml-research", name: "ML Research", color: "bg-green-400", items: 8, lastActive: "Yesterday", progress: 45 },
  { id: "history-notes", name: "History Notes", color: "bg-purple-400", items: 5, lastActive: "3 days ago", progress: 90 },
  { id: "physics-201", name: "Physics 201", color: "bg-orange-400", items: 15, lastActive: "1 week ago", progress: 30 },
  { id: "cs-algorithms", name: "CS Algorithms", color: "bg-red-400", items: 7, lastActive: "Just now", progress: 60 },
];

const RECENT_ACTIVITY = [
  { name: "Cell Division Lecture", type: "YouTube", space: "Biology 101", time: "2 hours ago", icon: Youtube },
  { name: "Neural Networks Paper.pdf", type: "PDF", space: "ML Research", time: "Yesterday", icon: FileText },
  { name: "World War II Overview", type: "Website", space: "History Notes", time: "3 days ago", icon: Globe },
  { name: "Quantum Physics Lecture", type: "Audio", space: "Physics 201", time: "1 week ago", icon: Mic },
];

const QUICK_ACTIONS = [
  { label: "YouTube Video", icon: Youtube, color: "text-red-500", bg: "bg-red-50", href: "/dashboard/add?type=youtube" },
  { label: "PDF / Document", icon: FileText, color: "text-blue-500", bg: "bg-blue-50", href: "/dashboard/add?type=pdf" },
  { label: "Website URL", icon: Globe, color: "text-green-500", bg: "bg-green-50", href: "/dashboard/add?type=website" },
  { label: "Audio / Recording", icon: Mic, color: "text-purple-500", bg: "bg-purple-50", href: "/dashboard/add?type=audio" },
];

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Welcome back, Alex</h1>
        <p className="text-[#666] text-[15px]">Continue learning or add new content to your spaces.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <BookOpen size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[24px] font-bold">5</p>
            <p className="text-[12px] text-[#999]">Active Spaces</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <BarChart3 size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-[24px] font-bold">47</p>
            <p className="text-[12px] text-[#999]">Total Items</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Zap size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-[24px] font-bold">12</p>
            <p className="text-[12px] text-[#999]">Quizzes Completed</p>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">Quick Add Content</h2>
          <Link href="/dashboard/add" className="text-[13px] text-[#999] hover:text-black flex items-center gap-1">
            All types <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white rounded-2xl border border-[#e5e5e5] p-4 flex flex-col items-center gap-3 hover:border-[#ccc] hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon size={18} className={action.color} />
              </div>
              <span className="text-[13px] font-medium text-[#666] group-hover:text-black">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* My Spaces */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold">My Spaces</h2>
          <Link href="/space/new" className="text-[13px] text-black font-medium flex items-center gap-1.5 hover:opacity-70">
            <Plus size={14} /> New Space
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPACES.map((space) => (
            <Link
              key={space.id}
              href={`/space/${space.id}`}
              className="bg-white rounded-2xl border border-[#e5e5e5] p-5 hover:border-[#ccc] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded ${space.color}`} />
                <h3 className="text-[15px] font-semibold group-hover:text-black">{space.name}</h3>
              </div>
              <div className="flex items-center justify-between text-[12px] text-[#999] mb-3">
                <span>{space.items} items</span>
                <span>{space.lastActive}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#f1f1f1] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${space.color}`}
                  style={{ width: `${space.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-[#bbb] mt-1.5">{space.progress}% mastery</p>
            </Link>
          ))}
          <Link
            href="/space/new"
            className="bg-white rounded-2xl border-2 border-dashed border-[#e0e0e0] p-5 flex flex-col items-center justify-center gap-2 hover:border-[#bbb] hover:bg-[#fafafa] transition-all min-h-[140px]"
          >
            <Plus size={24} className="text-[#ccc]" />
            <span className="text-[13px] text-[#999]">Create New Space</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-[16px] font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
          {RECENT_ACTIVITY.map((item, i) => (
            <Link
              key={i}
              href={`/space/${SPACES.find((s) => s.name === item.space)?.id || "bio-101"}`}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors ${
                i < RECENT_ACTIVITY.length - 1 ? "border-b border-[#f0f0f0]" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-[#666]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium truncate">{item.name}</p>
                <p className="text-[12px] text-[#999]">{item.space}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] px-2 py-1 rounded-full bg-[#f5f5f5] text-[#666]">{item.type}</span>
                <p className="text-[11px] text-[#bbb] mt-1">{item.time}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
