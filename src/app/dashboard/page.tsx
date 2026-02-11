"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Sparkles,
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
      <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto pl-14 md:pl-8">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 sm:w-80 animate-pulse" />
            <div className="h-5 bg-gray-100 dark:bg-gray-900 rounded w-72 sm:w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto space-y-8 md:space-y-10 pl-14 md:pl-8">
        {/* Welcome Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] sm:text-[32px] font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome to YesLearn
            </h1>
            <Sparkles className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-[16px]">
            {spaces.length > 0
              ? "Continue your learning journey or add new content to your spaces."
              : "Get started by creating your first learning space."}
          </p>
        </motion.div>

        {/* Stats Grid with Stagger Animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {[
            { icon: BookOpen, value: stats?.spaceCount || 0, label: "Active Spaces" },
            { icon: BarChart3, value: stats?.itemCount || 0, label: "Total Items" },
            { icon: Zap, value: stats?.quizCount || 0, label: "Quizzes Completed" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
              className="group relative bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 transition-all duration-300 overflow-hidden"
            >
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <stat.icon 
                    size={22} 
                    className="text-gray-600 dark:text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[24px] sm:text-[28px] font-bold text-gray-900 dark:text-white mb-0.5">
                    {stat.value}
                  </p>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Add Content with Better Spacing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white">Quick Add Content</h2>
            <Link 
              href="/dashboard/add" 
              className="flex items-center gap-1.5 text-[14px] text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
            >
              All types 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {QUICK_ACTIONS.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={action.href}
                  className="group block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <action.icon size={22} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-center">
                      {action.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* My Spaces with Better Organization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white">My Spaces</h2>
            <Link 
              href="/space/new" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium text-[14px] hover:opacity-90 transition-all shadow-sm hover:shadow-md"
            >
              <Plus size={16} /> New Space
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {spaces.map((space, index) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Link
                  href={`/space/${space.id}`}
                  className="group block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-[16px] sm:text-[18px] font-bold">
                      {space.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-[15px] sm:text-[17px] font-semibold text-gray-900 dark:text-white transition-colors flex-1 truncate">
                      {space.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                      <span className="text-[13px] text-gray-600 dark:text-gray-400">
                        {space.itemCount} item{space.itemCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-[12px] text-gray-400 dark:text-gray-500">
                      {timeAgo(space.updatedAt)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + spaces.length * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Link
                href="/space/new"
                className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 min-h-[160px] group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={24} className="text-gray-400 dark:text-gray-600" />
                </div>
                <span className="text-[14px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Create New Space
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Activity with Modern Design */}
        {stats && stats.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-5"
          >
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              {stats.recentActivity.map((item, i) => {
                const IconComponent = TYPE_ICONS[item.type] || FileText;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                  >
                    <Link
                      href={`/space/${item.spaceId}`}
                      className={`flex items-center gap-5 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group ${
                        i < stats.recentActivity.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                        <IconComponent size={20} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] sm:text-[15px] font-medium truncate text-gray-900 dark:text-white transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{item.spaceName}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[12px] px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                          {item.type}
                        </span>
                        <span className="text-[12px] text-gray-400 dark:text-gray-500 w-20 text-right">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
