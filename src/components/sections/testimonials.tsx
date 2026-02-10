import React from 'react';

const testimonials = [
  {
    quote: "YouLearn transformed how I study. I upload my lecture PDFs and get instant summaries and quizzes — it saves me hours every week.",
    name: "Alex Johnson",
    title: "Computer Science Student",
    initials: "AJ",
    color: "bg-blue-500",
  },
  {
    quote: "The AI chat feature is incredible. I can ask questions about my uploaded materials and get accurate, referenced answers instantly.",
    name: "Maria Kim",
    title: "Biology Researcher",
    initials: "MK",
    color: "bg-green-500",
  },
  {
    quote: "Being able to upload YouTube videos and get auto-generated notes and quizzes has completely changed my learning workflow.",
    name: "Sam Rivera",
    title: "Graduate Student",
    initials: "SR",
    color: "bg-purple-500",
  }
];

export default function Testimonials() {
  return (
    <section className="bg-white py-[120px] px-6 overflow-hidden">
      <div className="container mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-[24px] p-8 flex flex-col justify-between shadow-air transition-all duration-200 hover:shadow-lg h-full min-h-[300px]"
              style={{
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
              }}
            >
              <div className="mb-8">
                <p className="text-[#666666] text-[18px] leading-[1.6] font-body">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`w-[48px] h-[48px] rounded-full ${testimonial.color} flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">{testimonial.initials}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-black text-[16px] font-semibold leading-tight">
                    {testimonial.name}
                  </span>
                  <span className="text-[#666666] text-[14px] leading-normal">
                    {testimonial.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
