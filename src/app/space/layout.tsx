"use client";
import { useEffect } from "react";
import AppSidebar, { SidebarProvider } from "@/components/app/sidebar";

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);
  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <AppSidebar />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
