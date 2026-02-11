"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface Space {
  id: string;
  name: string;
  color: string;
  icon: string;
  itemCount: number;
}

// Context for sidebar collapse state
const SidebarContext = createContext<{ collapsed: boolean; toggle: () => void; mobileOpen: boolean; closeMobile: () => void }>({
  collapsed: false,
  toggle: () => { },
  mobileOpen: false,
  closeMobile: () => { },
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    // On mobile, toggle the overlay
    if (window.innerWidth < 768) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => {
        localStorage.setItem("sidebar-collapsed", String(!c));
        return !c;
      });
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, mobileOpen, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebar();
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Close mobile sidebar on navigation
  useEffect(() => {
    closeMobile();
  }, [pathname]);

  // Get initial letter for space icon
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={toggle}
        className="fixed top-3 left-3 z-30 p-2 rounded-lg bg-white dark:bg-[#0a0a0a] border border-[#eee] dark:border-[#1a1a1a] shadow-sm md:hidden"
      >
        <PanelLeftOpen size={16} className="text-[#888]" />
      </button>

      <aside
        className={`
          h-screen bg-white dark:bg-[#0a0a0a] border-r border-[#eee] dark:border-[#1a1a1a] flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out
          ${collapsed ? "w-[60px]" : "w-[240px]"}
          max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[260px] max-md:shadow-2xl
          ${mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
        `}
      >
      {/* Header */}
      <div className="px-3 py-3 flex items-center justify-between shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-[12px]">Y</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight dark:text-white">YesLearn</span>
          </Link>
        )}
        <button
          onClick={toggle}
          className={`p-1.5 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] transition-colors text-[#888] ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#141414] text-[#999]">
            <Search size={13} />
            <span className="text-[12px]">Search...</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="px-2 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive("/dashboard")
                ? "bg-[#f0f0f0] dark:bg-[#1a1a1a] text-black dark:text-white"
                : "text-[#666] dark:text-[#888] hover:bg-[#f5f5f5] dark:hover:bg-[#141414] hover:text-black dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
          >
            <Home size={16} />
            {!collapsed && "Home"}
          </Link>

          {/* Spaces */}
          <div className="mt-3">
            {!collapsed && (
              <button
                onClick={() => setSpacesOpen(!spacesOpen)}
                className="flex items-center justify-between w-full px-2.5 py-1.5 text-[10px] font-semibold text-[#aaa] dark:text-[#555] uppercase tracking-widest hover:text-[#666] dark:hover:text-[#888]"
              >
                <span>Spaces</span>
                {spacesOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              </button>
            )}

            {(collapsed || spacesOpen) && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {loading ? (
                  <div className={`px-2.5 py-2 text-[11px] text-[#ccc] ${collapsed ? "text-center" : ""}`}>
                    {collapsed ? "..." : "Loading..."}
                  </div>
                ) : spaces.length === 0 ? (
                  <div className={`px-2.5 py-2 text-[11px] text-[#ccc] ${collapsed ? "text-center" : ""}`}>
                    {collapsed ? "—" : "No spaces yet"}
                  </div>
                ) : (
                  spaces.map((space) => (
                    <Link
                      key={space.id}
                      href={`/space/${space.id}`}
                      title={collapsed ? space.name : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 group ${isSpaceActive(space.id)
                          ? "bg-[#f0f0f0] dark:bg-[#1a1a1a] text-black dark:text-white font-medium"
                          : "text-[#666] dark:text-[#888] hover:bg-[#f5f5f5] dark:hover:bg-[#141414] hover:text-black dark:hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold shrink-0 ${isSpaceActive(space.id)
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#666] dark:text-[#888]"
                        }`}>
                        {getInitial(space.name)}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{space.name}</span>
                          <span className="text-[10px] text-[#ccc] dark:text-[#444] group-hover:text-[#999]">
                            {space.itemCount}
                          </span>
                        </>
                      )}
                    </Link>
                  ))
                )}
                <Link
                  href="/space/new"
                  title={collapsed ? "New Space" : undefined}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#aaa] dark:text-[#555] hover:bg-[#f5f5f5] dark:hover:bg-[#141414] hover:text-black dark:hover:text-white transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
                >
                  <Plus size={14} />
                  {!collapsed && <span>New Space</span>}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#eee] dark:border-[#1a1a1a] px-2 py-2 flex flex-col gap-0.5">
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${isActive("/settings")
              ? "bg-[#f0f0f0] dark:bg-[#1a1a1a] text-black dark:text-white font-medium"
              : "text-[#666] dark:text-[#888] hover:bg-[#f5f5f5] dark:hover:bg-[#141414] hover:text-black dark:hover:text-white"
            } ${collapsed ? "justify-center" : ""}`}
        >
          <Settings size={16} />
          {!collapsed && "Settings"}
        </Link>
      </div>
    </aside>
    </>
  );
}
