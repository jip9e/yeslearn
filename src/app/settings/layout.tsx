"use client";
import AppSidebar, { SidebarProvider } from "@/components/app/sidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0a0a0a]">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </SidebarProvider>
    );
}
