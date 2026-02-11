import React from "react";
import Image from "next/image";

const FeaturesGrid = () => {
  return (
    <section id="features" className="w-full bg-background flex flex-col items-center" style={{ padding: "120px 24px" }}>
      <div className="container max-w-[1200px] flex flex-col items-center text-center">
        <div className="mb-[64px] max-w-[800px]">
          <h2 className="font-display text-foreground leading-[1.2] tracking-[-0.01em] mb-[24px]" style={{ fontSize: "48px", fontWeight: 600 }}>
            Save hours, learn smarter.
          </h2>
          <p className="font-body text-muted-foreground leading-[1.6]" style={{ fontSize: "18px" }}>
            Upload your content, and YesLearn handles the rest — from summaries to quizzes to AI chat.
          </p>
        </div>

        <div className="w-full bg-card rounded-[24px] overflow-hidden flex flex-col md:flex-row relative border border-border" style={{ boxShadow: "var(--shadow-air)", minHeight: "520px" }}>
          <div className="flex flex-col text-left p-[40px] md:w-2/5 z-10">
            <h3 className="font-display text-foreground mb-[16px] leading-[1.3]" style={{ fontSize: "24px", fontWeight: 600 }}>
              Summary, quizzes, AI chat, and more
            </h3>
            <p className="font-body text-muted-foreground leading-[1.6]" style={{ fontSize: "16px" }}>
              Get AI-generated summaries of your content, test your knowledge with auto-generated quizzes, and chat with an AI tutor that understands your materials.
            </p>
          </div>

          <div className="md:w-3/5 relative min-h-[300px] md:min-h-full overflow-hidden flex items-end justify-end">
            <div className="absolute bottom-0 right-0 w-[110%] md:w-[120%] h-auto transform translate-x-[5%] translate-y-[5%]" style={{ filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.1))" }}>
              <div className="rounded-[12px] border border-border overflow-hidden bg-background" style={{ aspectRatio: "1908 / 1570", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aaae90b8-aa3f-4374-8832-83abe3b64372-yeslearn-ai/assets/images/AsHprVUhsmXzQ1wA68OiD1wow9o-3.png"
                  alt="AI tutor interface showing summary, key dilemmas, and video integration"
                  width={1908}
                  height={1570}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] mt-[32px] w-full">
          {[
            ["Upload any content", "Support for PDFs, YouTube videos, websites, and audio recordings. Organize everything into learning spaces."],
            ["Auto-generated quizzes", "AI creates multiple-choice quizzes from your materials so you can test your understanding instantly."],
            ["Chat with your content", "Ask questions about your uploaded materials and get accurate answers grounded in your content."],
          ].map(([title, description]) => (
            <div key={title} className="bg-card border border-border rounded-[24px] p-[32px] text-left">
              <h4 className="font-display text-[20px] font-semibold mb-[12px] text-foreground">{title}</h4>
              <p className="text-muted-foreground text-[16px] leading-[1.5]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
