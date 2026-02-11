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

  // position.y is the top of the selection (viewport coords from getBoundingClientRect)
  const toolbarHeight = 44;
  const gap = 12;
  // Try to place above the selection; if not enough room, place below
  const above = position.y - toolbarHeight - gap;
  const clampedX = Math.max(8, Math.min(position.x, window.innerWidth - 420));
  const clampedY = above >= 8 ? above : position.y + gap + 24; // below the selection if no room above

  return (
    <div
      className="fixed z-[60] flex items-center gap-0.5 bg-popover backdrop-blur-xl rounded-full shadow-2xl border border-border px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200 select-none"
      style={{ left: clampedX, top: clampedY, WebkitTouchCallout: "none" }}
      onPointerDown={(e) => e.preventDefault()}
    >
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <div className="w-px h-4 bg-border" />
      {actions.map((a) => (
        <button
          key={a.id}
          onClick={() => {
            onAction(a.id, text);
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-muted-foreground/70 group-hover:text-foreground">{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
}
