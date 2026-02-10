import React from 'react';

const testimonials = [
  {
    quote: "YesLearn is awesome, just used it to learn from a biotech roundtable discussion!",
    name: "Rohan Robinson",
    title: "Software Engineer",
    initials: "RR",
    color: "bg-blue-500",
  },
  {
    quote: "This YesLearn site, with features like 'Chat with PDF,' has become an integral part of our daily workflow. It's streamlined our process of understanding videos and PDFs.",
    name: "Jason Patel",
    title: "Writer",
    initials: "JP",
    color: "bg-green-500",
  },
  {
    quote: "I use YesLearn on a daily basis now. It's streamlined my processes and improved how I learn materials.",
    name: "Kate Doe",
    title: "Content Manager",
    initials: "KD",
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
