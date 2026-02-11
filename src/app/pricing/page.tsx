import React from "react";
import Link from "next/link";
import Navigation from "@/components/sections/navigation";
import Footer from "@/components/sections/footer";
import { Check, Star } from "lucide-react";

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
    <div className="min-h-screen bg-white dark:bg-[#0b0b0b] text-gray-900 dark:text-gray-100">
      <Navigation />
      <main className="pt-[120px] pb-[80px] px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-[48px] font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-[18px] text-gray-600 dark:text-gray-400 max-w-[500px] mx-auto">Start free and upgrade when you need more. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.popular
                    ? "bg-black text-white border-2 border-black"
                    : "bg-white dark:bg-[#111] border border-[#e5e5e5] dark:border-[#2a2a2a]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black text-[11px] font-semibold shadow-sm">
                      <Star size={12} /> Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-[20px] font-semibold mb-2">{plan.name}</h3>
                <p className={`text-[13px] mb-6 ${plan.popular ? "text-white/60" : "text-gray-500 dark:text-gray-400"}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className="text-[40px] font-bold">{plan.price}</span>
                  <span className={`text-[14px] ml-1 ${plan.popular ? "text-white/60" : "text-gray-500 dark:text-gray-400"}`}>{plan.period}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-[14px]">
                      <Check size={16} className={plan.popular ? "text-white/60" : "text-green-500"} />
                      <span className={plan.popular ? "text-white/90" : "text-gray-700 dark:text-gray-300"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full py-3 rounded-xl text-[14px] font-medium text-center transition-all block focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    plan.popular
                      ? "bg-white text-black hover:bg-white/90 focus-visible:ring-white"
                      : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 focus-visible:ring-black dark:focus-visible:ring-white"
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
                { q: "Is there a student discount?", a: "We're working on student pricing. Check back soon or contact us for details." },
                { q: "What happens when I hit my free plan limits?", a: "You'll be prompted to upgrade. Your existing content and spaces remain accessible." },
                { q: "Can I cancel my subscription?", a: "Absolutely. Cancel anytime with no questions asked. You'll keep access until the end of your billing period." },
              ].map((faq) => (
                <div key={faq.q} className="bg-[#f8f8f8] dark:bg-[#171717] rounded-2xl p-6 border border-transparent dark:border-[#2a2a2a]">
                  <h4 className="text-[15px] font-semibold mb-2 text-gray-900 dark:text-gray-100">{faq.q}</h4>
                  <p className="text-[14px] text-gray-600 dark:text-gray-400">{faq.a}</p>
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
