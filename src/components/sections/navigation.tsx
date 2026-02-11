"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] w-full bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(10,10,10,0.65)] backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
      <div className="mx-auto flex h-[69px] max-w-[1200px] items-center justify-between px-6 lg:px-10">
        
        {/* Left Section: Logo and Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-black">
              <span className="text-white font-bold text-[14px]">Y</span>
            </div>
            <span className="text-[18px] font-semibold tracking-tight text-black dark:text-white">YesLearn</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/#features"
              className="rounded-full px-3 py-2 text-[14px] font-medium text-[#6d6d6d] dark:text-gray-300 font-sans transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              Features
            </Link>
            
            <Link 
              href="/pricing" 
              className="rounded-full px-3 py-2 text-[14px] font-medium text-[#6d6d6d] dark:text-gray-300 font-sans transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              Pricing
            </Link>
            
            <Link 
              href="/careers" 
              className="rounded-full px-3 py-2 text-[14px] font-medium text-[#6d6d6d] dark:text-gray-300 font-sans transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              Careers
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="hidden md:flex h-[37px] items-center justify-center rounded-full bg-black dark:bg-white px-5 text-[14px] font-medium text-white dark:text-black transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Get Started
          </Link>
          <button
            className="md:hidden p-2 text-black dark:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#111] border-t border-[#e5e5e5] dark:border-[#2a2a2a] px-6 py-4 flex flex-col gap-3">
          <Link href="/#features" className="text-[14px] font-medium text-[#6d6d6d] dark:text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link href="/pricing" className="text-[14px] font-medium text-[#6d6d6d] dark:text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/careers" className="text-[14px] font-medium text-[#6d6d6d] dark:text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Careers</Link>
          <Link href="/dashboard" className="text-[14px] font-medium text-white dark:text-black bg-black dark:bg-white rounded-full py-2 px-5 text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

