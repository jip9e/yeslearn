"use client";
import { useEffect } from "react";
import AppNavbar from "@/components/app/navbar";

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
    <div className="flex flex-col h-dvh overflow-hidden bg-background text-foreground">
      <AppNavbar />
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
