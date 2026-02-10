import React from 'react';
import Image from 'next/image';

const FeaturesGrid = () => {
  return (
    <section 
      id="features" 
      className="w-full bg-white flex flex-col items-center"
      style={{ padding: '120px 24px' }}
    >
      <div className="container max-w-[1200px] flex flex-col items-center text-center">
        {/* Main Heading Section */}
        <div className="mb-[64px] max-w-[800px]">
          <h2 
            className="font-display text-foreground leading-[1.2] tracking-[-0.01em] mb-[24px]"
            style={{ fontSize: '48px', fontWeight: 600 }}
          >
            Save hours, learn smarter.
          </h2>
          <p 
            className="font-body text-[#666666] leading-[1.6]"
            style={{ fontSize: '18px' }}
          >
            From key takeaways to specific questions, we’ve got you covered.
          </p>
        </div>

        {/* Primary Feature Card */}
        <div 
          className="w-full bg-[#f8f8f8] rounded-[24px] overflow-hidden flex flex-col md:flex-row relative"
          style={{ 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            minHeight: '520px'
          }}
        >
          {/* Card Content Text Wrapper */}
          <div className="flex flex-col text-left p-[40px] md:w-2/5 z-10">
            <h3 
              className="font-display text-foreground mb-[16px] leading-[1.3]"
              style={{ fontSize: '24px', fontWeight: 600 }}
            >
              Summary, quizzes, podcast, and more
            </h3>
            <p 
              className="font-body text-[#666666] leading-[1.6]"
              style={{ fontSize: '16px' }}
            >
              Understand the key points, test your knowledge, get answers with references, and listen to an AI tutor.
            </p>
          </div>

          {/* Screenshot Mockup Section */}
          <div className="md:w-3/5 relative min-h-[300px] md:min-h-full overflow-hidden flex items-end justify-end">
            <div 
              className="absolute bottom-0 right-0 w-[110%] md:w-[120%] h-auto transform translate-x-[5%] translate-y-[5%]"
              style={{
                filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.1))'
              }}
            >
              <div 
                className="rounded-[12px] border-[1px] border-black overflow-hidden bg-black"
                style={{ 
                  aspectRatio: '1908 / 1570',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                }}
              >
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aaae90b8-aa3f-4374-8832-83abe3b64372-youlearn-ai/assets/images/AsHprVUhsmXzQ1wA68OiD1wow9o-3.png"
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

        {/* Feature Highlights Grid (Secondary row placeholders for context) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px] mt-[32px] w-full">
          <div className="bg-[#f8f8f8] rounded-[24px] p-[32px] text-left">
            <h4 className="font-display text-[20px] font-semibold mb-[12px]">Upload any content</h4>
            <p className="text-[#666666] text-[16px] leading-[1.5]">From PDFs and YouTube videos to slides and even recorded lectures, learn everything your way.</p>
          </div>
          <div className="bg-[#f8f8f8] rounded-[24px] p-[32px] text-left">
            <h4 className="font-display text-[20px] font-semibold mb-[12px]">Test your knowledge</h4>
            <p className="text-[#666666] text-[16px] leading-[1.5]">Create personalized exams, get answer breakdowns, and track your progress.</p>
          </div>
          <div className="bg-[#f8f8f8] rounded-[24px] p-[32px] text-left">
            <h4 className="font-display text-[20px] font-semibold mb-[12px]">Talk with an AI Tutor</h4>
            <p className="text-[#666666] text-[16px] leading-[1.5]">Talk to an AI tutor to simplify ideas and receive guidance on the content.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;