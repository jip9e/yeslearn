import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-[#0f0f0f] border-t border-[#e5e5e5] dark:border-[#2a2a2a] py-[80px]">
      <div className="max-w-[1200px] mx-auto px-6 w-full flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* Left Section: Logo and Copyright */}
        <div className="flex flex-col items-start gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-black">
              <span className="text-white font-bold text-[14px]">Y</span>
            </div>
            <span className="text-[18px] font-semibold tracking-tight text-black dark:text-white">YesLearn</span>
          </Link>
          <p className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 font-sans">
            © Copyright 2026 YesLearn Inc.
          </p>
        </div>

        {/* Right Section: Multi-column Navigation */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-12 md:gap-x-32">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <Link 
              href="/dashboard" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Dashboard
            </Link>
            <Link 
              href="/pricing" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Pricing
            </Link>
            <Link 
              href="/careers" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Careers
            </Link>
            <Link 
              href="/#features" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Features
            </Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            <Link 
              href="/terms" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Terms & Conditions
            </Link>
            <Link 
              href="/privacy" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/contact" 
              className="text-[14px] leading-[21px] text-[#6d6d6d] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-sans"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

