'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default function CTAFooter() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Upper CTA Section with blue-600 background */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-blue-600 dark:bg-blue-900/80 px-6 py-20 text-center shadow-xl sm:px-12 sm:py-24"
        >
          {/* Full Screen Animated Synapse Logo Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-20 dark:opacity-15 transition-opacity duration-300">
            <svg 
              viewBox="0 0 800 400" 
              className="w-full h-full min-w-[800px] min-h-[400px] scale-105 sm:scale-100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Presynaptic terminal - Red */}
              <path 
                d="M -50 200 C 100 200, 150 100, 200 120 C 250 140, 260 200, 250 250 C 240 300, 200 320, 150 300 C 100 280, -50 200, -50 200" 
                stroke="#ef4444" 
                strokeWidth="2" 
                className="opacity-45 animate-pulse-slow" 
              />
              {/* Presynaptic vesicles (bobbing circles) */}
              <circle cx="100" cy="180" r="7" fill="#ef4444" className="opacity-35 animate-bob-1" />
              <circle cx="150" cy="240" r="9" fill="#ef4444" className="opacity-30 animate-bob-2" />
              <circle cx="170" cy="170" r="5" fill="#ef4444" className="opacity-45 animate-bob-3" />
              <circle cx="130" cy="150" r="8" fill="#ef4444" className="opacity-25 animate-bob-4" />

              {/* Postsynaptic terminal - Blue */}
              <path 
                d="M 850 200 C 700 200, 650 100, 600 120 C 550 140, 540 200, 550 250 C 560 300, 600 320, 650 300 C 700 280, 850 200, 850 200" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                className="opacity-45 animate-pulse-slow" 
              />
              {/* Postsynaptic receptors */}
              <circle cx="700" cy="180" r="7" fill="#3b82f6" className="opacity-35 animate-bob-3" />
              <circle cx="650" cy="240" r="9" fill="#3b82f6" className="opacity-30 animate-bob-1" />
              
              {/* Synaptic Cleft Wavy Pathways - Green */}
              <path 
                d="M 245 165 Q 400 100, 555 165" 
                stroke="#22c55e" 
                strokeWidth="1.5" 
                strokeDasharray="8 8" 
                className="opacity-35 animate-flow-left-to-right" 
              />
              <path 
                d="M 252 200 Q 400 160, 548 200" 
                stroke="#22c55e" 
                strokeWidth="2" 
                strokeDasharray="12 12" 
                className="opacity-50 animate-flow-left-to-right-fast" 
              />
              <path 
                d="M 245 235 Q 400 300, 555 235" 
                stroke="#22c55e" 
                strokeWidth="1.5" 
                strokeDasharray="8 8" 
                className="opacity-35 animate-flow-left-to-right" 
              />

              {/* Transmitting Signal Sparks (green glowing circles traveling down pathways) */}
              <circle cx="0" cy="0" r="4.5" fill="#22c55e" className="opacity-90">
                <animateMotion 
                  path="M 252 200 Q 400 160, 548 200" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <circle cx="0" cy="0" r="3" fill="#22c55e" className="opacity-80">
                <animateMotion 
                  path="M 245 165 Q 400 100, 555 165" 
                  dur="4.5s" 
                  repeatCount="indefinite" 
                  begin="1s"
                />
              </circle>
              <circle cx="0" cy="0" r="3.5" fill="#22c55e" className="opacity-85">
                <animateMotion 
                  path="M 245 235 Q 400 300, 555 235" 
                  dur="3.8s" 
                  repeatCount="indefinite" 
                  begin="0.5s"
                />
              </circle>
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-white sm:text-4xl">
              Building the future of stroke rehabilitation in Indonesia
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100 dark:text-blue-200 leading-relaxed font-light">
              Get in touch for academic collaborations, clinical partnerships, or neuro-engineering research inquiries.
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href="mailto:contact@synaptic.id"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Mail className="h-4 w-4" />
                Contact Our Team
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Links */}
      <div className="border-t border-gray-200/80 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            
            {/* Left: Brand info */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-lg font-bold tracking-widest uppercase font-orbitron text-blue-950 dark:text-blue-100">
                Synaptic
              </span>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                Decoding the Indonesian Mind, One Thought at a Time
              </p>
            </div>

            {/* Center: ISO/Security Badges */}
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" /> Kemenkes Ethics Cleared
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" /> Stroke Awareness ID
              </span>
            </div>

            {/* Right: Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                &copy; {new Date().getFullYear()} Synaptic BCI Initiative. All rights reserved.
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light mt-1 uppercase tracking-widest">
                Universitas Indonesia • RSUPN Dr. Cipto Mangunkusumo
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flow-rgb-foot {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes flow-dash-cleft {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .animate-flow-left-to-right {
          animation: flow-dash-cleft 3s linear infinite;
        }
        .animate-flow-left-to-right-fast {
          animation: flow-dash-cleft 2s linear infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-4px) translateX(2px); }
        }
        .animate-bob-1 { animation: bob 4s ease-in-out infinite; }
        .animate-bob-2 { animation: bob 5s ease-in-out infinite 1s; }
        .animate-bob-3 { animation: bob 3.5s ease-in-out infinite 0.5s; }
        .animate-bob-4 { animation: bob 4.5s ease-in-out infinite 1.5s; }
      ` }} />
      {/* Modern Scientific Thin RGB Line */}
      <div 
        className="h-[1.5px] w-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
        style={{
          backgroundSize: '200% 100%',
          animation: 'flow-rgb-foot 5s linear infinite',
        }}
      />
    </footer>
  );
}
