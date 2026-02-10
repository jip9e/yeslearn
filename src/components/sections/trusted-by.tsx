"use client";
import React from 'react';

const universityLogos = [
  {
    name: 'Michigan State University',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/Rraz1Yy0un7nhSWeQDLU74PqIF0.svg',
  },
  {
    name: 'MIT',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/slaJu5FCk8ml6iolHYMjG24FWQ.svg',
  },
  {
    name: 'University of Michigan',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/xrq9fC8QrjGBT8F80CRFNBqOC4.svg',
  },
  {
    name: 'Princeton',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/bS6ruQgrhGqTghZYdi7FA0sHaek.svg',
  },
  {
    name: 'Stanford',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/JdaS9359rQz6HpbrWPePU5hzL8.svg',
  },
  {
    name: 'Harvard',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/zLq574nPR9gWsWyZdbGpp63KPqw.svg',
  },
  {
    name: 'University of California, Los Angeles',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/YxQlBJ3ahQZ0hwvSXmBDWTOSVrg.svg',
  },
  {
    name: 'University of Pennsylvania',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/coPc0ruPZ3afBNJlGpANIL6eHcU.svg',
  },
  {
    name: 'University of Chicago',
    url: 'https://dj2sofb25vegx.cloudfront.net/landing-page/universities/5zVEY4Masnnk7YzRbn5Er5jXnU.svg',
  },
];

const TrustedBySection: React.FC = () => {
  const scrollingLogos = [...universityLogos, ...universityLogos, ...universityLogos];

  return (
    <section 
      id="trusted" 
      className="py-12 md:py-20 lg:py-24 bg-white overflow-hidden"
    >
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ticker-scroll {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="container mx-auto px-6">
        <div className="w-full text-center mb-10 md:mb-14">
          <p className="text-[#666666] text-lg font-medium leading-[1.6] tracking-tight">
            Trusted by top students all over the world
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex ticker-scroll">
            <ul className="flex items-center min-w-full gap-x-12 md:gap-x-20 shrink-0">
              {scrollingLogos.map((logo, index) => (
                <li key={`${logo.name}-${index}`} className="flex-shrink-0">
                  <div className="h-10 md:h-12 w-auto flex items-center justify-center">
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className="h-full w-auto object-contain university-logo transition-opacity duration-200"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
