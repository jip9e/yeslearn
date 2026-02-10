import React from 'react';

const comingFeatures = [
  {
    icon: "🎙️",
    title: "AI Podcast Generation",
    description: "Turn your learning materials into audio podcasts you can listen to on the go.",
  },
  {
    icon: "🃏",
    title: "Flashcards",
    description: "Auto-generate spaced-repetition flashcards from your uploaded content.",
  },
  {
    icon: "👥",
    title: "Collaborative Spaces",
    description: "Share learning spaces with classmates and study together in real time.",
  },
  {
    icon: "📱",
    title: "Mobile App",
    description: "Access your learning spaces and study on the go with our upcoming mobile app.",
  },
];

export default function ComingSoon() {
  return (
    <section className="bg-[#fafafa] py-[100px] px-6">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-[64px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 mb-6">
            <span className="text-sm font-medium text-[#666]">Coming Soon</span>
          </div>
          <h2
            className="font-display text-foreground leading-[1.2] tracking-[-0.01em] mb-[16px]"
            style={{ fontSize: '40px', fontWeight: 600 }}
          >
            What&apos;s next for YesLearn
          </h2>
          <p className="text-[#666666] text-lg max-w-[500px] mx-auto">
            We&apos;re building new features to make your learning experience even better.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {comingFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-[20px] border border-[#e5e5e5] p-6 flex flex-col items-start text-left transition-all duration-200 hover:shadow-lg hover:border-[#ccc]"
            >
              <div className="text-[32px] mb-4">{feature.icon}</div>
              <h3 className="text-[18px] font-semibold mb-2">{feature.title}</h3>
              <p className="text-[#666666] text-[15px] leading-[1.5]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
