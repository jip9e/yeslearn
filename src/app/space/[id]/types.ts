import React from "react";

export interface ContentItem {
  id: string;
  name: string;
  type: string;
  sourceUrl?: string;
  extractedText?: string;
  metadata?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  createdAt: string;
  sources?: { index: number; name: string }[];
  followUpQuestions?: string[];
}

export interface Summary {
  id: string;
  title: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SpaceData {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  contentItems: ContentItem[];
  chatMessages: ChatMessage[];
  summaries: Summary[];
  quizQuestions: QuizQuestion[];
}

export type AIPanelTab = "learn" | "chat";

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface UIState {
  isAIPanelOpen: boolean;
  aiPanelWidth: number;
  activeTab: AIPanelTab;
  isCommandCenterOpen: boolean;
}
