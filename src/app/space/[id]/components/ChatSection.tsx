"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, FileText, Copy, ChevronRight, Send, Loader2, X } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatSectionProps {
  messages: ChatMessage[];
  sendingChat: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: (override?: string) => void;
  quotedText: string | null;
  setQuotedText: (val: string | null) => void;
  followUps: string[];
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatSection({
  messages,
  sendingChat,
  chatInput,
  setChatInput,
  handleSendMessage,
  quotedText,
  setQuotedText,
  followUps,
  chatEndRef,
}: ChatSectionProps) {
  const renderContentWithSources = (text: string) => {
    return text.replace(/\[Source (\d+)\]/g, "**⟨Source $1⟩**");
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollBehavior: "smooth" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-16">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Sparkles size={32} className="text-zinc-900 dark:text-zinc-100" />
            </div>
            <div className="text-center">
              <p className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2">How can I help you today?</p>
              <p className="text-[13px] text-muted-foreground max-w-[280px] leading-relaxed">
                Ask questions about your documents, get summaries, or explore key concepts in depth.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-[360px]">
              {["Explain the key concepts", "Summarize the main points", "Create a quick quiz"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setChatInput(chip);
                    handleSendMessage(chip);
                  }}
                  className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[12px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isLast = idx === messages.length - 1;
            const hasQuote = msg.content.startsWith("> ");
            const quotePart = hasQuote ? msg.content.split("\n\n")[0].replace(/^> /, "") : null;
            const mainContent = hasQuote ? msg.content.split("\n\n").slice(1).join("\n\n") : msg.content;

            return (
              <div key={msg.id} className={`${isLast ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}`}>
                {isUser ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%]">
                      {quotePart && (
                        <div className="mb-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border-l-2 border-zinc-400 dark:border-zinc-500 ml-auto max-w-fit">
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic">
                            {quotePart}
                          </p>
                        </div>
                      )}
                      <div className="px-4 py-3 rounded-2xl rounded-br-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <p className="text-[13px] leading-relaxed">{mainContent}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right pr-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 border border-zinc-200 dark:border-zinc-700">
                      <Sparkles size={14} className="text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                        Assistant
                      </p>
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm">
                        <div className="text-[13px] leading-[1.8] [&_strong]:font-semibold [&_a]:text-zinc-600 dark:[&_a]:text-zinc-400 [&_a]:underline [&_h1]:text-[16px] [&_h2]:text-[15px] [&_h3]:text-[14px] [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:space-y-1 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:text-[12px] [&_code]:bg-zinc-200 dark:[&_code]:bg-zinc-700/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre]:bg-zinc-200 dark:[&_pre]:bg-zinc-900 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:overflow-x-auto [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 dark:[&_blockquote]:border-zinc-600 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {renderContentWithSources(msg.content)}
                          </ReactMarkdown>
                        </div>

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.sources.map((src) => (
                              <div
                                key={src.index}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-200/50 dark:bg-zinc-900/50 border border-border text-[11px] text-muted-foreground font-medium hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors cursor-default"
                              >
                                <FileText size={11} className="shrink-0" />
                                <span className="truncate max-w-[150px]">{src.name}</span>
                                <span className="opacity-60 text-[10px] shrink-0">
                                  Source {src.index}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Copy"
                          aria-label="Copy AI response"
                        >
                          <Copy size={12} className="text-muted-foreground" />
                        </button>
                      </div>

                      {isLast && !sendingChat && (msg.followUpQuestions?.length || followUps.length > 0) && (
                        <div className="mt-6 space-y-2">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                            Suggested follow-ups
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(msg.followUpQuestions?.length ? msg.followUpQuestions : followUps).map((q, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setChatInput(q);
                                  handleSendMessage(q);
                                }}
                                className="px-4 py-2 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[12px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-left focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <span className="line-clamp-1">{q}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {sendingChat && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
              <Sparkles size={14} className="text-zinc-900 dark:text-zinc-100" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800 border border-border/50 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Composer */}
      <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl shrink-0">
        {quotedText && (
          <div className="mb-3 p-3 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-border flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-1">
            <div className="flex-1 min-w-0 flex items-start gap-3">
              <div className="w-1 self-stretch rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Selected text</p>
                <p className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">{quotedText}</p>
              </div>
            </div>
            <button
              onClick={() => setQuotedText(null)}
              aria-label="Remove selected text quote"
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        )}

        <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 shadow-sm focus-within:shadow-md transition-all duration-300">
          <textarea
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask anything..."
            disabled={sendingChat}
            rows={1}
            className="w-full pl-5 pr-14 py-4 rounded-2xl bg-transparent text-[14px] outline-none resize-none disabled:opacity-50 text-zinc-900 dark:text-zinc-100 placeholder:text-muted-foreground/50 leading-relaxed"
            style={{ minHeight: "56px", maxHeight: "160px" }}
          />
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
            <button
              onClick={() => handleSendMessage()}
              disabled={!chatInput.trim() || sendingChat}
              aria-label="Send chat message"
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                chatInput.trim()
                  ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-md hover:scale-105 active:scale-95"
                  : "text-muted-foreground/30"
              } disabled:cursor-not-allowed`}
            >
              {sendingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 text-center opacity-70">
          AI may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
