"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Youtube, FileText, Globe, BookOpen, BarChart3, CheckCircle2 } from "lucide-react";

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
];

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  youtube: Youtube,
  pdf: FileText,
  website: Globe,
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
    Promise.all([fetch("/api/spaces").then((r) => r.json()), fetch("/api/stats").then((r) => r.json())])
      .then(([spacesData, statsData]) => {
        setSpaces(spacesData);
        setStats(statsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-[1100px] mx-auto pl-14 md:pl-8" role="status" aria-label="Loading dashboard">
        <div className="space-y-6">
          <div className="h-9 bg-secondary rounded-lg w-72 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: BookOpen, value: stats?.spaceCount || 0, label: "Spaces" },
    { icon: BarChart3, value: stats?.itemCount || 0, label: "Content Items" },
    { icon: CheckCircle2, value: stats?.quizCount || 0, label: "Quizzes Completed" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1100px] mx-auto space-y-8 pl-14 md:pl-8">
      <header className="space-y-1">
        <h1 className="text-[24px] sm:text-[30px] font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-[14px] sm:text-[15px] text-muted-foreground">
          {spaces.length > 0
            ? "Pick up where you left off or add new learning material."
            : "Create your first space to start organizing learning content."}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Overview stats">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon size={18} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground leading-tight">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3" aria-label="Quick add content">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Quick Add</h2>
          <Link href="/dashboard/add" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-xl border border-border bg-card p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <action.icon size={17} className="text-muted-foreground" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-label="Spaces list">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">My Spaces</h2>
          <Link
            href="/space/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus size={15} /> New Space
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/space/${space.id}`}
              className="rounded-xl border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-semibold text-foreground">
                  {space.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-medium text-foreground truncate">{space.name}</h3>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {space.itemCount} item{space.itemCount !== 1 ? "s" : ""}
                </span>
                <span>{timeAgo(space.updatedAt)}</span>
              </div>
            </Link>
          ))}
          <Link
            href="/space/new"
            className="rounded-xl border border-dashed border-border bg-card p-4 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors"
          >
            + Create New Space
          </Link>
        </div>
      </section>

      {stats && stats.recentActivity.length > 0 && (
        <section className="space-y-3" aria-label="Recent activity">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {stats.recentActivity.slice(0, 8).map((item) => {
              const IconComponent = TYPE_ICONS[item.type] || FileText;
              return (
                <Link
                  key={item.id}
                  href={`/space/${item.spaceId}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <IconComponent size={15} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.spaceName}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.createdAt)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
