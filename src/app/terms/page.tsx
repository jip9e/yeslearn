import React from "react";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[700px] mx-auto prose prose-sm">
          <h1 className="text-[36px] font-bold tracking-tight mb-2">Terms & Conditions</h1>
          <p className="text-[#999] text-[14px] mb-8">Last updated: February 2026</p>

          <div className="space-y-8 text-[14px] text-[#444] leading-[1.8]">
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using YesLearn, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">2. Use License</h2>
              <p>Permission is granted to temporarily use YesLearn for personal, non-commercial educational purposes. This license does not include modifying or copying the materials, using materials for commercial purposes, or attempting to reverse engineer any software.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">4. Content</h2>
              <p>You retain ownership of all content you upload to YesLearn. By uploading content, you grant us a license to process, analyze, and store it for the purpose of providing our services to you.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">5. Limitations</h2>
              <p>YesLearn shall not be held liable for any damages that result from the use of our service. AI-generated content is for educational purposes and should not be considered as professional advice.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
