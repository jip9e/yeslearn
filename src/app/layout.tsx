import React from "react";
import type { Metadata } from "next";
import ThemeInit from "@/components/ThemeInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "YesLearn - AI Tutor Made For You",
  description: "Turn your learning materials into notes, interactive chats, quizzes, and more with YesLearn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
