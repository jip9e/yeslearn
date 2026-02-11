"use client";
import React, { useEffect } from "react";
import { Command } from "cmdk";
import { 
  Search, 
  FileText, 
  Youtube, 
  MessageSquare, 
  BookOpen, 
  Settings,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentItem } from "../types";

interface CommandCenterProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sources: ContentItem[];
  onSelectSource: (id: string) => void;
  onAction: (action: string) => void;
}

export function CommandCenter({
  isOpen,
  setIsOpen,
  sources,
  onSelectSource,
  onAction,
}: CommandCenterProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[640px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <Command className="flex flex-col h-full">
                <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-4">
                  <Search className="mr-3 h-4 w-4 shrink-0 text-zinc-400" />
                  <Command.Input
                    placeholder="Search sources, actions, or ask AI..."
                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-[15px] outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-none">
                  <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                    No results found.
                  </Command.Empty>
                  
                  <Command.Group heading="Navigation" className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    <Command.Item
                      onSelect={() => {
                        window.location.href = `/dashboard/add?spaceId=${sources[0]?.id || ''}`;
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                        <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-zinc-900 dark:text-zinc-100 font-medium">Add Content</span>
                        <span className="text-[12px] text-zinc-500">Upload PDF, YouTube, or Website</span>
                      </div>
                    </Command.Item>
                  </Command.Group>

                  <Command.Separator className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />

                  <Command.Group heading="Sources" className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {sources.map((source) => (
                      <Command.Item
                        key={source.id}
                        onSelect={() => {
                          onSelectSource(source.id);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 transition-colors"
                      >
                        {source.type === "pdf" ? (
                          <FileText className="h-4 w-4 text-zinc-500" />
                        ) : (
                          <Youtube className="h-4 w-4 text-zinc-500" />
                        )}
                        <span className="text-[14px] text-zinc-700 dark:text-zinc-300 font-medium truncate">
                          {source.name}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>

                  <Command.Separator className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />

                  <Command.Group heading="AI Actions" className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    <Command.Item
                      onSelect={() => {
                        onAction("chat");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-zinc-100 dark:text-zinc-900" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-zinc-900 dark:text-zinc-100 font-medium">Chat with AI</span>
                        <span className="text-[12px] text-zinc-500">Ask questions about your sources</span>
                      </div>
                    </Command.Item>
                    
                    <Command.Item
                      onSelect={() => {
                        onAction("learn");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        <BookOpen className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-zinc-900 dark:text-zinc-100 font-medium">Study Guide</span>
                        <span className="text-[12px] text-zinc-500">Generate summaries and quizzes</span>
                      </div>
                    </Command.Item>
                  </Command.Group>
                </Command.List>

                <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-sans">↵</kbd>
                      <span>to select</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-sans">esc</kbd>
                      <span>to close</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                    <GraduationCap size={12} className="text-zinc-400" />
                    Study OS
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
