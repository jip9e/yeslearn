import React from "react";

const useCases = [
  {
    emoji: "📄",
    title: "Lecture PDFs",
    description: "Upload lecture slides or textbook chapters and get AI-generated summaries and quiz questions in seconds.",
  },
  {
    emoji: "🎥",
    title: "YouTube Videos",
    description: "Paste a YouTube link — YesLearn extracts the transcript and lets you chat with the content or generate notes.",
  },
  {
    emoji: "🌐",
    title: "Web Articles",
    description: "Save any web page to a learning space. The AI reads it for you and answers questions grounded in the text.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-background py-[120px] px-6 overflow-hidden">
      <div className="container mx-auto max-w-[1200px]">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-semibold tracking-tight mb-3 text-foreground">How people use YesLearn</h2>
          <p className="text-muted-foreground text-[16px]">Real workflows, no fluff.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((item, index) => (
            <div key={index} className="bg-card border border-border rounded-[24px] p-8 flex flex-col justify-between shadow-air transition-all duration-200 hover:shadow-lg h-full min-h-[240px]">
              <div>
                <span className="text-[32px] block mb-4">{item.emoji}</span>
                <h3 className="text-[18px] font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-[16px] leading-[1.6]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
