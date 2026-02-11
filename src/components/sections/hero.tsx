import React from "react";

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-[120px] pb-[80px]" id="home">
      <div className="container flex flex-col items-center text-center">
        <div className="mb-8 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-sm transition-all hover:bg-secondary">
          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-[4px] bg-primary">
            <span className="text-primary-foreground font-bold text-[12px]">Y</span>
          </div>
          <span className="text-sm font-medium tracking-tight text-foreground">AI-Powered Learning Platform</span>
        </div>

        <h1 className="mb-6 max-w-[800px] text-[48px] leading-[1.1] font-bold tracking-[-0.03em] text-foreground md:text-[64px]">
          Your personal AI tutor
        </h1>

        <p className="mb-10 max-w-[600px] text-lg leading-[1.6] text-muted-foreground md:text-[20px]">
          Upload any learning material — PDFs, YouTube videos, websites, or audio — and get AI-generated summaries, interactive chat, and quizzes instantly.
        </p>

        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="#features" className="btn-pill inline-flex items-center justify-center bg-secondary text-[18px] text-secondary-foreground hover:opacity-90" style={{ minWidth: "160px", height: "56px" }}>
            See features
          </a>
          <a href="/dashboard" className="btn-pill inline-flex items-center justify-center bg-primary text-[18px] text-primary-foreground hover:opacity-90" style={{ minWidth: "180px", height: "56px" }}>
            Get Started
          </a>
        </div>

        <div className="mb-[80px] flex items-center gap-3">
          <p className="text-[16px] font-medium text-muted-foreground">Upload anything. Learn faster with AI.</p>
        </div>

        <div className="relative w-full max-w-[1000px] overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl">
          <div className="aspect-[1.6/1] w-full">
            <div className="h-full w-full flex flex-col">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                    <span className="text-primary-foreground font-bold text-[10px]">Y</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">YesLearn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-20 rounded-full bg-secondary flex items-center justify-center"><span className="text-[10px] text-muted-foreground">Search...</span></div>
                  <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center"><span className="text-accent-foreground text-[9px] font-bold">AJ</span></div>
                </div>
              </div>
              <div className="flex-1 flex">
                <div className="w-[200px] border-r border-border bg-background p-4 hidden md:flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-secondary"><div className="w-3.5 h-3.5 rounded bg-muted" /><span className="text-[11px] font-medium text-foreground">Home</span></div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary"><div className="w-3.5 h-3.5 rounded bg-muted" /><span className="text-[11px] text-muted-foreground">My Spaces</span></div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary"><div className="w-3.5 h-3.5 rounded bg-muted" /><span className="text-[11px] text-muted-foreground">Settings</span></div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold text-foreground">Biology 101</span>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 rounded-md bg-secondary text-[9px] font-medium text-muted-foreground">Summary</div>
                      <div className="px-2 py-1 rounded-md bg-primary text-[9px] font-medium text-primary-foreground">Chat</div>
                      <div className="px-2 py-1 rounded-md bg-secondary text-[9px] font-medium text-muted-foreground">Quiz</div>
                    </div>
                  </div>
                  <div className="flex gap-4 h-[calc(100%-36px)]">
                    <div className="flex-1 rounded-xl border border-border bg-background p-4 overflow-hidden">
                      <div className="w-full h-3 rounded bg-secondary mb-2" /><div className="w-4/5 h-3 rounded bg-secondary mb-2" /><div className="w-full h-3 rounded bg-secondary mb-2" /><div className="w-3/5 h-3 rounded bg-secondary mb-4" />
                      <div className="w-full h-20 rounded-lg bg-card mb-2" /><div className="w-full h-3 rounded bg-secondary mb-2" /><div className="w-4/5 h-3 rounded bg-secondary" />
                    </div>
                    <div className="w-[220px] rounded-xl border border-border bg-background flex flex-col hidden lg:flex">
                      <div className="p-3 border-b border-border"><span className="text-[10px] font-semibold text-foreground">AI Chat</span></div>
                      <div className="flex-1 p-3 flex flex-col gap-2">
                        <div className="self-end bg-secondary rounded-lg px-3 py-1.5 max-w-[80%]"><span className="text-[9px] text-foreground">What are the key concepts?</span></div>
                        <div className="self-start bg-primary text-primary-foreground rounded-lg px-3 py-1.5 max-w-[90%]"><span className="text-[9px]">The main concepts covered are cell division, DNA replication, and protein synthesis...</span></div>
                      </div>
                      <div className="p-3 border-t border-border"><div className="h-7 rounded-lg bg-card flex items-center px-2"><span className="text-[9px] text-muted-foreground">Ask anything...</span></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
