"use client";
import React, { useState, FormEvent } from "react";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import { Send, Mail, MessageSquare, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSending(true);

    // Keep current feature behavior (local success state), but provide async UI feedback.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b0b] text-gray-900 dark:text-gray-100">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[36px] font-bold tracking-tight mb-4">Contact Us</h1>
            <p className="text-[16px] text-gray-500 dark:text-gray-400">Have a question or feedback? We&apos;d love to hear from you.</p>
          </div>

          {sent ? (
            <div className="bg-[#f8f8f8] dark:bg-[#171717] rounded-2xl p-10 text-center" role="status" aria-live="polite">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Send size={22} className="text-green-600" />
              </div>
              <h3 className="text-[18px] font-semibold mb-2">Message Sent!</h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-8">
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2" role="alert" aria-live="polite">
                  {formError}
                </div>
              )}

              <p className="sr-only" role="status" aria-live="polite">
                {sending ? "Sending your message" : ""}
              </p>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-[13px] font-medium mb-2">
                      Name <span className="text-red-600" aria-label="required">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      aria-required="true"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-[14px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus:border-[#ccc] dark:focus:border-[#3a3a3a] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white placeholder:text-[#aaa] dark:placeholder:text-[#666]"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-[13px] font-medium mb-2">
                      Email <span className="text-red-600" aria-label="required">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      aria-required="true"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-[14px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus:border-[#ccc] dark:focus:border-[#3a3a3a] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white placeholder:text-[#aaa] dark:placeholder:text-[#666]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-[13px] font-medium mb-2">
                    Subject <span className="text-red-600" aria-label="required">*</span>
                  </label>
                  <select
                    id="contact-subject"
                    required
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    aria-required="true"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-[14px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
                  >
                    <option>General Inquiry</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Billing Question</option>
                    <option>Partnership</option>
                    <option>Press</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-[13px] font-medium mb-2">
                    Message <span className="text-red-600" aria-label="required">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    required
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    aria-required="true"
                    className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111] text-[14px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 focus:border-[#ccc] dark:focus:border-[#3a3a3a] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white resize-none placeholder:text-[#aaa] dark:placeholder:text-[#666]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  aria-disabled={sending}
                  aria-label={sending ? "Sending message" : "Send message"}
                  className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="flex justify-center gap-8 mt-10 text-[13px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2"><Mail size={14} /> hello@yeslearn.ai</div>
            <div className="flex items-center gap-2"><MessageSquare size={14} /> Live chat available</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

