"use client";
import React, { useState } from "react";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import { Send, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[36px] font-bold tracking-tight mb-4">Contact Us</h1>
            <p className="text-[16px] text-[#666]">Have a question or feedback? We&apos;d love to hear from you.</p>
          </div>

          {sent ? (
            <div className="bg-[#f8f8f8] rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Send size={22} className="text-green-600" />
              </div>
              <h3 className="text-[18px] font-semibold mb-2">Message Sent!</h3>
              <p className="text-[14px] text-[#666]">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8">
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-2">Name</label>
                    <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-2">Email</label>
                    <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] placeholder:text-[#ccc]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-2">Subject</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10">
                    <option>General Inquiry</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Billing Question</option>
                    <option>Partnership</option>
                    <option>Press</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-2">Message</label>
                  <textarea rows={5} placeholder="Tell us what's on your mind..." className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#ccc] resize-none placeholder:text-[#ccc]" />
                </div>
                <button
                  onClick={() => setSent(true)}
                  className="w-full py-3 rounded-xl bg-black text-white text-[14px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Send Message
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-8 mt-10 text-[13px] text-[#999]">
            <div className="flex items-center gap-2"><Mail size={14} /> hello@yeslearn.ai</div>
            <div className="flex items-center gap-2"><MessageSquare size={14} /> Live chat available</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
