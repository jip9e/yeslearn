import Navigation from "@/components/sections/navigation";
import HeroSection from "@/components/sections/hero";
import TrustedBySection from "@/components/sections/trusted-by";
import FeaturesGrid from "@/components/sections/features-grid";
import Testimonials from "@/components/sections/testimonials";
import ComingSoon from "@/components/sections/coming-soon";
import Footer from "@/components/sections/footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TrustedBySection />
      <FeaturesGrid />
      <Testimonials />
      <ComingSoon />

      {/* Final CTA Section */}
      <section className="bg-white py-[120px] px-6">
        <div className="container mx-auto max-w-[1200px] flex flex-col items-center text-center">
          <h2 className="text-[48px] font-semibold leading-[1.2] tracking-[-0.01em] mb-6">
            Learn smarter, faster, easier.
          </h2>
          <p className="text-[#666666] text-lg mb-10 max-w-[500px]">
            Join thousands of learners using YouLearn to study more effectively.
          </p>
          <Link
            href="/dashboard"
            className="btn-pill inline-flex items-center justify-center bg-black text-white text-[18px] hover:opacity-90"
            style={{ minWidth: "180px", height: "56px" }}
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
