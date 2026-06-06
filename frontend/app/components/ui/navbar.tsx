'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme state on client
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setTheme('light');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // navbar height offset
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
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 transition-colors duration-200">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow-rgb-nav {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      ` }} />
      {/* Modern Scientific Thin RGB Line */}
      <div 
        className="h-[1.5px] w-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
        style={{
          backgroundSize: '200% 100%',
          animation: 'flow-rgb-nav 5s linear infinite',
        }}
      />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand Wordmark */}
          <div className="flex items-center gap-2">
            <Link 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-50 group"
            >
              <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/40 p-1.5 transition-colors group-hover:bg-blue-100/50 dark:group-hover:bg-blue-900/40 flex items-center justify-center">
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-6 w-6 fill-none transition-transform duration-300 group-hover:scale-105" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {/* Presynaptic node - Red */}
                  <path d="M2 12h5" className="stroke-red-500 dark:stroke-red-400" />
                  <circle cx="8" cy="12" r="2" className="stroke-red-500 dark:stroke-red-400 fill-red-500/20" />

                  {/* Postsynaptic node - Blue */}
                  <circle cx="16" cy="12" r="2" className="stroke-blue-500 dark:stroke-blue-400 fill-blue-500/20" />
                  <path d="M17 12h5" className="stroke-blue-500 dark:stroke-blue-400" />

                  {/* Synaptic cleft signals - Green */}
                  <circle cx="12" cy="12" r="1.5" className="fill-green-500 dark:fill-green-400 stroke-none animate-ping" style={{ animationDuration: '1.8s' }} />
                  <circle cx="12" cy="12" r="1" className="fill-green-500 dark:fill-green-400 stroke-none animate-pulse" />
                  <path d="M11.5 9.5a1.5 1.5 0 0 1 1 0" className="stroke-green-500 dark:stroke-green-400 animate-pulse" />
                  <path d="M11.5 14.5a1.5 1.5 0 0 0 1 0" className="stroke-green-500 dark:stroke-green-400 animate-pulse" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-widest uppercase font-orbitron text-blue-950 dark:text-blue-100 group-hover:text-blue-900 dark:group-hover:text-blue-200 transition-colors">
                Synaptic
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
            <button
              onClick={() => scrollToSection('problem')}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Research
            </button>
            <button
              onClick={() => scrollToSection('approach')}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Protocol
            </button>
            <button
              onClick={() => scrollToSection('vocabulary')}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Vocabulary
            </button>
            <button
              onClick={() => scrollToSection('team')}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Team
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact
            </button>
          </div>

          {/* Right: Theme Toggle + CTA button */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              View Live Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
