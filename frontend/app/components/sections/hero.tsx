'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const BrainCanvas = dynamic(() => import('../ui/brain-canvas'), {
  ssr: false,
});

export default function Hero() {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-between overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950 bg-clinical-grid bg-batik-pattern transition-colors duration-200">
      {/* 8px Stroke Awareness Ribbon at top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-red-500 z-20" />

      {/* Responsive Column Grid: Stacks on mobile, Side-by-side on desktop */}
      <div className="mx-auto flex w-full max-w-7xl flex-grow flex-col md:flex-row items-center justify-between px-4 py-8 sm:px-6 lg:px-8 gap-8">
        
        {/* Left Column: Text Content */}
        <div className="relative z-30 flex flex-col justify-center w-full md:w-1/2 py-6 md:py-16">
          {/* Animated Ribbon / Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex self-start items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-6 border border-blue-100/50 dark:border-blue-900/30"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Clinical Initiative BCI-I1
          </motion.div>

          {/* Main Title - Academic Serif touch */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6.5xl leading-tight"
          >
            Reclaiming Voice <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-900 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
              Through Thought
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base text-gray-700 dark:text-gray-300 sm:text-lg md:text-xl leading-relaxed max-w-2xl font-light"
          >
            Indonesia's first clinical-grade EEG speech brain-computer interface for imagined Bahasa Indonesia speech decoding in post-stroke Broca's aphasia rehabilitation.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button
              onClick={() => handleScroll('problem')}
              className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Explore the Research
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => handleScroll('team')}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-500/50 bg-white dark:bg-gray-900 px-6 py-3.5 text-sm font-semibold text-blue-600 dark:text-blue-400 shadow-sm transition-all hover:bg-blue-50/50 dark:hover:bg-gray-800 hover:shadow-sm"
            >
              <Users className="h-4 w-4" />
              Meet the Team
            </button>
          </motion.div>
        </div>

        {/* Right Column: 3D Interactive Brain Atlas (Non-absolute for clean mobile stacking) */}
        <div className="relative z-20 w-full md:w-1/2 h-[340px] sm:h-[450px] md:h-[580px] flex items-center justify-center">
          <BrainCanvas />
        </div>
      </div>

      {/* Ticker & Bottom Badge Section */}
      <div className="relative z-10 w-full border-t border-gray-200/60 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          {/* Ticker items */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums text-sm">12,847</span> Sessions logged
            </div>
            <div className="hidden sm:block text-gray-300 dark:text-gray-700">•</div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums text-sm">1.8M</span> Trials decoded
            </div>
            <div className="hidden sm:block text-gray-300 dark:text-gray-700">•</div>
            <div className="flex items-center gap-1.5">
              Active since <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2024</span>
            </div>
          </div>

          {/* Made in Indonesia Badge */}
          <div className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">
            <span>🇮🇩</span> Made in Indonesia
          </div>
        </div>
      </div>
    </section>
  );
}
