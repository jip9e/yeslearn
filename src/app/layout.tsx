import React from "react";
import type { Metadata } from "next";
import ThemeInit from "@/components/ThemeInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouLearn - AI Tutor Made For You",
  description: "Turn your learning materials into notes, interactive chats, quizzes, and more with YouLearn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
