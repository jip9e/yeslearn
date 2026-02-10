import React from "react";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const JOBS = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "San Francisco / Remote", type: "Full-time" },
  { title: "ML Engineer - NLP", team: "AI", location: "San Francisco", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time" },
  { title: "Growth Marketing Manager", team: "Marketing", location: "New York / Remote", type: "Full-time" },
  { title: "Backend Engineer", team: "Engineering", location: "San Francisco / Remote", type: "Full-time" },
  { title: "Customer Success Lead", team: "Operations", location: "Remote", type: "Full-time" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-[48px] font-bold tracking-tight mb-4">Join YesLearn</h1>
            <p className="text-[18px] text-[#666] max-w-[500px] mx-auto">Help us build the future of learning. We&apos;re looking for passionate people to join our team.</p>
          </div>

          <div className="space-y-3">
            {JOBS.map((job) => (
              <div
                key={job.title}
                className="flex items-center justify-between p-5 rounded-2xl border border-[#e5e5e5] bg-white hover:border-[#ccc] hover:shadow-sm transition-all group cursor-pointer"
              >
                <div>
                  <h3 className="text-[15px] font-semibold group-hover:text-black">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[12px] text-[#999] flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span className="text-[12px] text-[#999] flex items-center gap-1"><Clock size={11} />{job.type}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f1f1] text-[#666]">{job.team}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#ccc] group-hover:text-black transition-colors" />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-[#f8f8f8] rounded-2xl p-8">
            <h3 className="text-[18px] font-semibold mb-2">Don&apos;t see a role that fits?</h3>
            <p className="text-[14px] text-[#666] mb-4">We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.</p>
            <Link href="/contact" className="inline-flex px-6 py-2.5 rounded-xl bg-black text-white text-[13px] font-medium hover:opacity-90">
              Get in Touch
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
