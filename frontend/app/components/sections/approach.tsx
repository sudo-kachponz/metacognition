'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Layers, HeartPulse, Activity } from 'lucide-react';

const pillars = [
  {
    num: '01',
    title: 'First-in-Indonesia BCI',
    desc: 'Specifically designed, calibrated, and optimized for Bahasa Indonesia\'s unique syllabic structure and phonetic imagination.',
    icon: Brain,
    theme: 'red',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.08)] group-hover:border-red-500/30',
    badge: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200/20 dark:border-red-900/20',
  },
  {
    num: '02',
    title: 'Three DNN Paradigms',
    desc: 'Unifying neural decoding strategies into a single robust hybrid decoder leveraging multi-paradigm learning approaches.',
    icon: Layers,
    theme: 'green',
    glow: 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.08)] group-hover:border-green-500/30',
    badge: 'text-green-500 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200/20 dark:border-green-900/20',
    badges: [
      { text: 'Supervised', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/30' },
      { text: 'Unsupervised', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/30' },
      { text: 'RL', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/30' },
    ],
  },
  {
    num: '03',
    title: 'Therapeutic BCI Protocol',
    desc: 'Engineered as active neuro-rehab rather than simple text assistance, driving targeted neuroplasticity in damaged Broca regions.',
    icon: HeartPulse,
    theme: 'blue',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] group-hover:border-blue-500/30',
    badge: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/20 dark:border-blue-900/20',
  },
  {
    num: '04',
    title: '18k-Trial N-of-1 Study',
    desc: 'Deep longitudinal mapping tracing individual neuro-dynamics across months of intensive, high-resolution EEG speech calibration.',
    icon: Activity,
    theme: 'red',
    glow: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.08)] group-hover:border-red-500/30',
    badge: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200/20 dark:border-red-900/20',
  },
];

export default function Approach() {
  return (
    <section id="approach" className="relative bg-gray-50/50 dark:bg-gray-950/30 py-24 sm:py-32 bg-clinical-grid transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              What Makes This Novel
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our clinical protocol introduces a paradigm shift in post-stroke rehabilitation, fusing advanced computing with restorative neurology.
            </p>
          </motion.div>
        </div>

        {/* 2x2 Grid */}
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex flex-col justify-between clinical-card relative overflow-hidden group cursor-pointer transition-all duration-300 border-l-4 bg-white dark:bg-gray-900/50 p-8 border-t border-r border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-r-xl ${
                    pillar.theme === 'red' ? 'border-l-red-500' :
                    pillar.theme === 'green' ? 'border-l-green-500' :
                    pillar.theme === 'blue' ? 'border-l-blue-500' :
                    'border-l-purple-500'
                  } ${pillar.glow}`}
                >
                  <div className="relative z-10">
                    {/* Top Header inside Card */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold tracking-wider ${pillar.badge}`}>
                        {pillar.num}
                      </span>
                      <div className={`rounded-lg p-2.5 transition-all duration-350 ${pillar.bg} group-hover:bg-blue-600 group-hover:text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-6 text-xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-900 dark:group-hover:text-blue-400">
                      {pillar.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>

                  {/* Badges for Paradigm Card */}
                  {pillar.badges && (
                    <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 relative z-10">
                      {pillar.badges.map((badge) => (
                        <span
                          key={badge.text}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badge.color}`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Decorative background synapse logo (similar to the company brand logo) */}
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-200/40 dark:text-slate-800/40 pointer-events-none transition-all duration-500 group-hover:scale-115 group-hover:rotate-12 group-hover:opacity-100">
                    <svg 
                      viewBox="0 0 24 24" 
                      className={`w-full h-full fill-none transition-colors duration-500 ${
                        pillar.theme === 'red' ? 'group-hover:text-red-500/10 dark:group-hover:text-red-500/10' :
                        pillar.theme === 'green' ? 'group-hover:text-green-500/10 dark:group-hover:text-green-500/10' :
                        pillar.theme === 'blue' ? 'group-hover:text-blue-500/10 dark:group-hover:text-blue-500/10' :
                        'group-hover:text-purple-500/10 dark:group-hover:text-purple-500/10'
                      }`}
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      {/* Presynaptic node */}
                      <path d="M2 12h5" />
                      <circle cx="8" cy="12" r="2" />

                      {/* Postsynaptic node */}
                      <circle cx="16" cy="12" r="2" />
                      <path d="M17 12h5" />

                      {/* Synaptic cleft signals */}
                      <circle cx="12" cy="12" r="1" className="fill-current stroke-none" />
                      <path d="M11 9.5a1.5 1.5 0 0 1 2 0" />
                      <path d="M11 14.5a1.5 1.5 0 0 0 2 0" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
