import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-border py-[80px]">
      <div className="max-w-[1200px] mx-auto px-6 w-full flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col items-start gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-[14px]">Y</span>
            </div>
            <span className="text-[18px] font-semibold tracking-tight text-foreground">YesLearn</span>
          </Link>
          <p className="text-[14px] leading-[21px] text-muted-foreground font-sans">© Copyright 2026 YesLearn Inc.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-12 md:gap-x-32">
          <div className="flex flex-col gap-4">
            {[["/dashboard", "Dashboard"], ["/pricing", "Pricing"], ["/careers", "Careers"], ["/#features", "Features"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-[14px] leading-[21px] text-muted-foreground hover:text-foreground transition-colors font-sans">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {[["/terms", "Terms & Conditions"], ["/privacy", "Privacy Policy"], ["/contact", "Contact Us"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-[14px] leading-[21px] text-muted-foreground hover:text-foreground transition-colors font-sans">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
