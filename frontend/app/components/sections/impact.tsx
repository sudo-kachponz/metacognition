'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const metrics = [
  {
    label: 'Intensive Patient Rehabilitation',
    val: '24 Months',
    width: 'w-3/5', // 60%
    desc: 'Continuous bi-weekly closed-loop speech recovery sessions targeting motor-imagery neural pathway retraining.',
  },
  {
    label: 'Total Clinical Longitudinal Study',
    val: '40 Months',
    width: 'w-full', // 100%
    desc: 'Extended clinical monitoring to trace long-term retention of cortical wicara and speech mapping stability.',
  },
  {
    label: 'Labelled Imagined Speech EEG Epochs',
    val: '18,000 Trials',
    width: 'w-4/5', // 80%
    desc: 'Ultra-high resolution database containing calibrated temporal patterns for complex phonetic classification.',
  },
];

export default function Impact() {
  return (
    <section id="impact" className="relative bg-white dark:bg-gray-950 py-24 sm:py-32 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left: Editorial / Pull Quote Typography */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="h-[2px] w-12 bg-red-500" />
            <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Research Impact & Protocol
            </h2>
            
            <blockquote className="mt-6 border-l-4 border-blue-600 dark:border-blue-500 pl-6">
              <p className="text-2xl font-serif font-semibold italic text-blue-600 dark:text-blue-400 tracking-tight leading-relaxed">
                "75 trials per class per session — exceeding 95% statistical power from day one."
              </p>
              <footer className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                — NeuroPidjar Calibration Protocol v1.0
              </footer>
            </blockquote>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">
              By deploying rigorous N-of-1 longitudinal clinical protocols, we maximize computational learning rates. Standardizing 75 structured classification tasks ensures our DNN decoders construct robust cortical classifiers, minimizing variance.
            </p>
          </motion.div>

          {/* Right: Metrics & Timelines */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-8 shadow-sm"
          >
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Protocol Scope & Datasets
            </h3>

            <div className="space-y-6">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">{metric.label}</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{metric.val}</span>
                  </div>

                  {/* Horizontal Bar background */}
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      whileInView={{ width: metric.width.replace('w-', '') }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{
                        width: metric.width === 'w-3/5' ? '60%' : metric.width === 'w-full' ? '100%' : '80%',
                      }}
                    />
                  </div>

                  {/* Checkmark and small details */}
                  <div className="flex items-start gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                    <div className="rounded-full bg-green-50 dark:bg-green-950/80 p-0.5 text-green-600 dark:text-green-300 mt-0.5 border border-green-200 dark:border-green-900/50">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{metric.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
