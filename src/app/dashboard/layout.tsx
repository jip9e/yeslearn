"use client";
import AppNavbar from "@/components/app/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
