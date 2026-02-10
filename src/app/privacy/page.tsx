import React from "react";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-[36px] font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-[#999] text-[14px] mb-8">Last updated: February 2026</p>

          <div className="space-y-8 text-[14px] text-[#444] leading-[1.8]">
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">Information We Collect</h2>
              <p>We collect information you provide directly, such as your name, email, and uploaded learning materials. We also collect usage data to improve our services.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">How We Use Your Information</h2>
              <p>Your information is used to provide and improve YesLearn services, including generating AI-powered summaries, quizzes, and chat responses from your uploaded content.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">Data Storage & Security</h2>
              <p>All data is encrypted in transit and at rest. Your uploaded content is stored securely and is only accessible to you. We do not sell your personal data to third parties.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">Your Rights</h2>
              <p>You have the right to access, modify, or delete your personal data at any time through your account settings. You can also request a full export of all your data.</p>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-black mb-3">Contact</h2>
              <p>For any privacy-related questions, please contact us at privacy@yeslearn.ai.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
