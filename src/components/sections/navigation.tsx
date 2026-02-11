"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-[100] w-full bg-background/70 dark:bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto flex h-[69px] max-w-[1200px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[28px] w-[28px] items-center justify-center rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-[14px]">Y</span>
            </div>
            <span className="text-[18px] font-semibold tracking-tight text-foreground">YesLearn</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {[
              ["/#features", "Features"],
              ["/pricing", "Pricing"],
              ["/careers", "Careers"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden md:flex h-[37px] items-center justify-center rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Get Started
          </Link>
          <button
            className="md:hidden p-2 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-4 flex flex-col gap-3">
          <Link href="/#features" className="text-[14px] font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link href="/pricing" className="text-[14px] font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/careers" className="text-[14px] font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Careers</Link>
          <Link href="/dashboard" className="text-[14px] font-medium text-primary-foreground bg-primary rounded-full py-2 px-5 text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
