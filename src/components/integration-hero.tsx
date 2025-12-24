"use client";

import { Button } from "@/components/ui/button";
import React from "react";

const ICONS_ROW1 = [
  "https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/3/34/EY_logo_2019.svg",
  "https://cdn.simpleicons.org/stripe",
  "https://cdn.simpleicons.org/paypal",
  "https://cdn.simpleicons.org/visa",
  "https://cdn.simpleicons.org/chase",
];

const ICONS_ROW2 = [
  "https://cdn.simpleicons.org/google",
  "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  "https://cdn.simpleicons.org/apple",
  "https://cdn.simpleicons.org/meta",
  "https://cdn.simpleicons.org/netflix",
  "https://cdn.simpleicons.org/tesla",
  "https://cdn.simpleicons.org/spacex",
];

// Utility to repeat icons enough times
const repeatedIcons = (icons: string[], repeat = 4) => Array.from({ length: repeat }).flatMap(() => icons);

export default function IntegrationHero() {
  return (
    <section className="relative py-24 overflow-hidden bg-white dark:bg-black/50">
      {/* Light grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <span className="inline-block px-3 py-1 mb-4 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white">
          🚀 Top Companies
        </span>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Trusted by Industry Leaders
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          From fast-growing startups to Fortune 500 enterprises, thousands rely on HireNest.
        </p>

        {/* Carousel */}
        <div className="mt-12 overflow-hidden relative pb-2">
          {/* Row 1 */}
          <div className="flex gap-10 whitespace-nowrap animate-scroll-left">
            {repeatedIcons(ICONS_ROW1, 4).map((src, i) => (
              <div key={i} className="h-16 w-16 flex-shrink-0 rounded-full bg-white dark:bg-gray-300 shadow-md flex items-center justify-center">
                <img src={src} alt="icon" className="h-10 w-10 object-contain" />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex gap-10 whitespace-nowrap mt-6 animate-scroll-right">
            {repeatedIcons(ICONS_ROW2, 4).map((src, i) => (
              <div key={i} className="h-16 w-16 flex-shrink-0 rounded-full bg-white dark:bg-gray-300 shadow-md flex items-center justify-center">
                <img src={src} alt="icon" className="h-10 w-10 object-contain" />
              </div>
            ))}
          </div>

          {/* Fade overlays */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white dark:from-black to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white dark:from-black to-transparent pointer-events-none" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
