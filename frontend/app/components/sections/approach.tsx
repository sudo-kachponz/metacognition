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
  },
  {
    num: '02',
    title: 'Three DNN Paradigms',
    desc: 'Unifying neural decoding strategies into a single robust hybrid decoder leveraging multi-paradigm learning approaches.',
    icon: Layers,
    badges: [
      { text: 'Supervised', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900' },
      { text: 'Unsupervised', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900' },
      { text: 'RL', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900' },
    ],
  },
  {
    num: '03',
    title: 'Therapeutic BCI Protocol',
    desc: 'Engineered as active neuro-rehab rather than simple text assistance, driving targeted neuroplasticity in damaged Broca regions.',
    icon: HeartPulse,
  },
  {
    num: '04',
    title: '18k-Trial N-of-1 Study',
    desc: 'Deep longitudinal mapping tracing individual neuro-dynamics across months of intensive, high-resolution EEG speech calibration.',
    icon: Activity,
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
                  className="flex flex-col justify-between clinical-card border-l-4 border-l-blue-600 bg-white dark:bg-gray-900/50 p-8 border-t border-r border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-r-xl"
                >
                  <div>
                    {/* Top Header inside Card */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                        {pillar.num}
                      </span>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/60 p-2.5 text-blue-600 dark:text-blue-400">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-6 text-xl font-serif font-bold text-gray-900 dark:text-white">
                      {pillar.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>

                  {/* Badges for Paradigm Card */}
                  {pillar.badges && (
                    <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
