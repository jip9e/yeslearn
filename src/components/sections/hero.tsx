import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white pt-[120px] pb-[80px]" id="home">
      <div className="container flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 shadow-sm transition-all hover:bg-gray-50">
          <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-[4px] bg-black">
            <span className="text-white font-bold text-[12px]">Y</span>
          </div>
          <span className="text-sm font-medium tracking-tight text-[#000000]">
            AI-Powered Learning Platform
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 max-w-[800px] text-[48px] leading-[1.1] font-bold tracking-[-0.03em] text-[#000000] md:text-[64px]">
          Your personal AI tutor
        </h1>

        {/* Subtext */}
        <p className="mb-10 max-w-[600px] text-lg leading-[1.6] text-[#666666] md:text-[20px]">
          Upload any learning material — PDFs, YouTube videos, websites, or audio — and get AI-generated summaries, interactive chat, and quizzes instantly.
        </p>

        {/* CTA Buttons */}
        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="#features"
            className="btn-pill inline-flex items-center justify-center bg-[#F1F1F1] text-[18px] text-black hover:bg-[#E5E5E5]"
            style={{ minWidth: '160px', height: '56px' }}
          >
            See features
          </a>
          <a
            href="/dashboard"
            className="btn-pill inline-flex items-center justify-center bg-[#000000] text-[18px] text-white hover:opacity-90"
            style={{ minWidth: '180px', height: '56px' }}
          >
            Start Learning
          </a>
        </div>

        {/* User Social Proof */}
        <div className="mb-[80px] flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400'].map((color, i) => (
              <div
                key={i}
                className={`relative h-10 w-10 overflow-hidden rounded-full border-2 border-white ring-1 ring-black/5 ${color} flex items-center justify-center`}
              >
                <span className="text-white text-xs font-bold">
                  {['AJ', 'MK', 'SR', 'PL'][i]}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[16px] font-medium text-[#666666]">
            Loved by learners everywhere
          </p>
        </div>

        {/* Main Device Mockup - App Preview */}
        <div className="relative w-full max-w-[1000px] overflow-hidden rounded-[24px] border-[1.5px] border-[#000000] bg-[#fafafa] shadow-2xl">
          <div className="aspect-[1.6/1] w-full">
            {/* Simulated App Interface */}
            <div className="h-full w-full flex flex-col">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#e5e5e5] bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black">
                    <span className="text-white font-bold text-[10px]">Y</span>
                  </div>
                  <span className="text-sm font-semibold">YouLearn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-20 rounded-full bg-[#f1f1f1] flex items-center justify-center">
                    <span className="text-[10px] text-[#666]">Search...</span>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">AJ</span>
                  </div>
                </div>
              </div>
              {/* Content area */}
              <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-[200px] border-r border-[#e5e5e5] bg-white p-4 hidden md:flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#f1f1f1]">
                    <div className="w-3.5 h-3.5 rounded bg-black/10" />
                    <span className="text-[11px] font-medium">Home</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f8f8f8]">
                    <div className="w-3.5 h-3.5 rounded bg-black/10" />
                    <span className="text-[11px] text-[#666]">My Spaces</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f8f8f8]">
                    <div className="w-3.5 h-3.5 rounded bg-black/10" />
                    <span className="text-[11px] text-[#666]">Settings</span>
                  </div>
                  <div className="mt-4 border-t border-[#e5e5e5] pt-4">
                    <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">Spaces</span>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                        <span className="text-[10px] text-[#666]">Biology 101</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-green-400" />
                        <span className="text-[10px] text-[#666]">ML Research</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
                        <span className="text-[10px] text-[#666]">History Notes</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-semibold">Biology 101</span>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 rounded-md bg-[#f1f1f1] text-[9px] font-medium text-[#666]">Summary</div>
                      <div className="px-2 py-1 rounded-md bg-black text-[9px] font-medium text-white">Chat</div>
                      <div className="px-2 py-1 rounded-md bg-[#f1f1f1] text-[9px] font-medium text-[#666]">Quiz</div>
                    </div>
                  </div>
                  <div className="flex gap-4 h-[calc(100%-36px)]">
                    {/* Content viewer */}
                    <div className="flex-1 rounded-xl border border-[#e5e5e5] bg-white p-4 overflow-hidden">
                      <div className="w-full h-3 rounded bg-[#f1f1f1] mb-2" />
                      <div className="w-4/5 h-3 rounded bg-[#f1f1f1] mb-2" />
                      <div className="w-full h-3 rounded bg-[#f1f1f1] mb-2" />
                      <div className="w-3/5 h-3 rounded bg-[#f1f1f1] mb-4" />
                      <div className="w-full h-20 rounded-lg bg-[#f8f8f8] mb-2" />
                      <div className="w-full h-3 rounded bg-[#f1f1f1] mb-2" />
                      <div className="w-4/5 h-3 rounded bg-[#f1f1f1]" />
                    </div>
                    {/* Chat panel */}
                    <div className="w-[220px] rounded-xl border border-[#e5e5e5] bg-white flex flex-col hidden lg:flex">
                      <div className="p-3 border-b border-[#e5e5e5]">
                        <span className="text-[10px] font-semibold">AI Chat</span>
                      </div>
                      <div className="flex-1 p-3 flex flex-col gap-2">
                        <div className="self-end bg-[#f1f1f1] rounded-lg px-3 py-1.5 max-w-[80%]">
                          <span className="text-[9px]">What are the key concepts?</span>
                        </div>
                        <div className="self-start bg-black text-white rounded-lg px-3 py-1.5 max-w-[90%]">
                          <span className="text-[9px]">The main concepts covered are cell division, DNA replication, and protein synthesis...</span>
                        </div>
                      </div>
                      <div className="p-3 border-t border-[#e5e5e5]">
                        <div className="h-7 rounded-lg bg-[#f8f8f8] flex items-center px-2">
                          <span className="text-[9px] text-[#999]">Ask anything...</span>
                        </div>
                      </div>
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
