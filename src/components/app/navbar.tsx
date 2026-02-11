"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  Settings,
  Menu,
  X,
  ChevronDown,
  BookOpen,
} from "lucide-react";

interface Space {
  id: string;
  name: string;
  color: string;
  icon: string;
  itemCount: number;
}

export default function AppNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const spacesRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const isSpaceActive = (id: string) => pathname === `/space/${id}`;

  useEffect(() => {
    fetch("/api/spaces")
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSpacesOpen(false);
  }, [pathname]);

  // Close spaces dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (spacesRef.current && !spacesRef.current.contains(e.target as Node)) {
        setSpacesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[12px]">Y</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground hidden sm:block">
              YesLearn
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                isActive("/dashboard")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Home size={14} />
              Home
            </Link>

            {/* Spaces dropdown */}
            <div ref={spacesRef} className="relative">
              <button
                onClick={() => setSpacesOpen(!spacesOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  spacesOpen || pathname.startsWith("/space/")
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <BookOpen size={14} />
                Spaces
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${spacesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown panel */}
              <div
                className={`absolute top-full left-0 mt-1 w-[260px] rounded-xl border border-border bg-background shadow-lg origin-top transition-all duration-200 ${
                  spacesOpen
                    ? "opacity-100 scale-y-100"
                    : "opacity-0 scale-y-0 pointer-events-none"
                }`}
              >
                <div className="py-1 max-h-[320px] overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-3 text-[12px] text-muted-foreground">Loading...</div>
                  ) : spaces.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] text-muted-foreground">No spaces yet</div>
                  ) : (
                    spaces.map((space) => (
                      <Link
                        key={space.id}
                        href={`/space/${space.id}`}
                        className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${
                          isSpaceActive(space.id)
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                            isSpaceActive(space.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {getInitial(space.name)}
                        </div>
                        <span className="truncate flex-1">{space.name}</span>
                        <span className="text-[11px] text-muted-foreground">{space.itemCount}</span>
                      </Link>
                    ))
                  )}
                </div>
                <div className="border-t border-border">
                  <Link
                    href="/space/new"
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Plus size={14} />
                    New Space
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/space/new"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={13} />
            New Space
          </Link>
          <Link
            href="/settings"
            className={`hidden md:flex items-center p-1.5 rounded-lg transition-colors ${
              isActive("/settings")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings size={16} />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu - slide down */}
      <div
        className={`md:hidden border-t border-border bg-background overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 py-2 space-y-0.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              isActive("/dashboard")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Home size={16} />
            Home
          </Link>

          {/* Mobile spaces */}
          <button
            onClick={() => setSpacesOpen(!spacesOpen)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-3">
              <BookOpen size={16} />
              Spaces
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${spacesOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              spacesOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-6 space-y-0.5 pb-1">
              {loading ? (
                <div className="px-3 py-2 text-[12px] text-muted-foreground">Loading...</div>
              ) : spaces.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-muted-foreground">No spaces yet</div>
              ) : (
                spaces.map((space) => (
                  <Link
                    key={space.id}
                    href={`/space/${space.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      isSpaceActive(space.id)
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold ${
                        isSpaceActive(space.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {getInitial(space.name)}
                    </div>
                    <span className="truncate">{space.name}</span>
                  </Link>
                ))
              )}
              <Link
                href="/space/new"
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground"
              >
                <Plus size={13} />
                New Space
              </Link>
            </div>
          </div>

          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              isActive("/settings")
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings size={16} />
            Settings
          </Link>

          <Link
            href="/space/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-primary"
          >
            <Plus size={16} />
            New Space
          </Link>
        </div>
      </div>
    </nav>
  );
}
