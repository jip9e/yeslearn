"use client";
import React, { useState } from "react";
import { Copy, Check, Lightbulb, FileText, MessageSquare, Brain } from "lucide-react";

interface SelectionToolbarProps {
  position: { x: number; y: number };
  text: string;
  onAction: (action: string, text: string) => void;
  onClose: () => void;
}

export function SelectionToolbar({ position, text, onAction, onClose }: SelectionToolbarProps) {
  const [copied, setCopied] = useState(false);
  const actions = [
    { id: "explain", label: "Explain", icon: <Lightbulb size={13} /> },
    { id: "summarize", label: "Summarize", icon: <FileText size={13} /> },
    { id: "chat", label: "Chat", icon: <MessageSquare size={13} /> },
    { id: "quiz", label: "Quiz", icon: <Brain size={13} /> },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const toolbarHeight = 44;
  const gap = 12;
  const rawY = position.y - toolbarHeight - gap;
  const clampedX = Math.max(8, Math.min(position.x, window.innerWidth - 420));
  const clampedY = Math.max(8, rawY);

  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 bg-zinc-950/90 backdrop-blur-xl rounded-full shadow-2xl border border-zinc-800 px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200"
      style={{ left: clampedX, top: clampedY }}
    >
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <div className="w-px h-4 bg-zinc-800" />
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => {
            onAction(a.id, text);
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-zinc-500 group-hover:text-zinc-100">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
}
