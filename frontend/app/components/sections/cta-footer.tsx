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
          {/* Inner abstract decoration lines resembling brain patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-white sm:text-4xl">
              Building the future of stroke rehabilitation in Indonesia
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100 dark:text-blue-200 leading-relaxed font-light">
              Get in touch for academic collaborations, clinical partnerships, or neuro-engineering research inquiries.
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href="mailto:contact@neuropidjar.id"
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
              <span className="text-lg font-bold tracking-tight text-blue-900 dark:text-white">
                Neuro<span className="text-blue-600 dark:text-blue-400">Pidjar</span>
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
                &copy; {new Date().getFullYear()} NeuroPidjar BCI Initiative. All rights reserved.
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light mt-1 uppercase tracking-widest">
                Universitas Indonesia • RSUPN Dr. Cipto Mangunkusumo
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Stroke Awareness Red Ribbon Motif (Thin line) */}
      <div className="h-[8px] w-full bg-red-600" />
    </footer>
  );
}
