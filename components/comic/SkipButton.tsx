"use client";

import Link from "next/link";

export default function SkipButton() {
  return (
    <Link
      href="/"
      aria-label="Skip the comic - go to the event page"
      className="fixed top-5 right-5 z-[60] bg-white border-2 border-black text-black font-syne font-bold text-sm md:text-base px-5 py-2 rounded-md shadow-[4px_4px_0_rgba(0,0,0,0.85)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.85)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
    >
      Skip
    </Link>
  );
}
