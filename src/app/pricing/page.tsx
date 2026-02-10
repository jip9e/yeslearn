import React from "react";
import Link from "next/link";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import { Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics",
    features: [
      "5 spaces",
      "20 uploads per month",
      "500 AI chat messages",
      "30 quiz generations",
      "Basic summaries",
      "Community support",
    ],
    cta: "Get Started",
    href: "/dashboard",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For serious learners",
    features: [
      "Unlimited spaces",
      "Unlimited uploads",
      "Unlimited AI chat",
      "Unlimited quizzes",
      "Advanced summaries & podcasts",
      "Priority support",
      "Custom AI tutor personality",
      "Export to Notion, Anki, PDF",
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
    popular: true,
  },
  {
    name: "Team",
    price: "$8",
    period: "per user / month",
    description: "For study groups and classrooms",
    features: [
      "Everything in Pro",
      "Shared spaces & collaboration",
      "Team analytics dashboard",
      "Admin controls",
      "SSO authentication",
      "Dedicated support",
      "Custom integrations",
      "API access",
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-[48px] font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-[18px] text-[#666] max-w-[500px] mx-auto">Start free and upgrade when you need more. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.popular
                    ? "bg-black text-white border-2 border-black"
                    : "bg-white border border-[#e5e5e5]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold shadow-sm">
                      <Sparkles size={12} /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-[20px] font-semibold mb-2">{plan.name}</h3>
                <p className={`text-[13px] mb-6 ${plan.popular ? "text-white/60" : "text-[#999]"}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className="text-[40px] font-bold">{plan.price}</span>
                  <span className={`text-[14px] ml-1 ${plan.popular ? "text-white/60" : "text-[#999]"}`}>{plan.period}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-[14px]">
                      <Check size={16} className={plan.popular ? "text-white/60" : "text-green-500"} />
                      <span className={plan.popular ? "text-white/90" : "text-[#666]"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl text-[14px] font-medium text-center transition-all ${
                    plan.popular
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:opacity-90"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-[700px] mx-auto">
            <h2 className="text-[24px] font-semibold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Can I switch plans anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
                { q: "Is there a student discount?", a: "Yes! Students with a valid .edu email get 50% off Pro plans." },
                { q: "What happens when I hit my free plan limits?", a: "You'll be prompted to upgrade. Your existing content and spaces remain accessible." },
                { q: "Can I cancel my subscription?", a: "Absolutely. Cancel anytime with no questions asked. You'll keep access until the end of your billing period." },
              ].map((faq) => (
                <div key={faq.q} className="bg-[#f8f8f8] rounded-2xl p-6">
                  <h4 className="text-[15px] font-semibold mb-2">{faq.q}</h4>
                  <p className="text-[14px] text-[#666]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
