'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from '../ui/count-up';

const stats = [
  {
    id: 1,
    value: 10.9,
    decimals: 1,
    suffix: '',
    prefix: '',
    subValue: 'per 1,000',
    title: 'Stroke Prevalence',
    desc: 'Indonesian adults experiencing stroke, representing a severe public health burden.',
    source: 'RISKESDAS 2018',
    theme: 'red',
  },
  {
    id: 2,
    value: 500000,
    decimals: 0,
    suffix: '+',
    prefix: '',
    subValue: 'cases/year',
    title: 'New Stroke Cases',
    desc: 'Occurring annually in Indonesia, making stroke the leading cause of disability.',
    source: 'Indonesian Stroke Association',
    theme: 'green',
  },
  {
    id: 3,
    value: 70,
    decimals: 0,
    suffix: '%',
    prefix: '60-',
    subValue: 'communication loss',
    title: 'Broca\'s Aphasia Rate',
    desc: 'Survivors facing chronic language impairment, isolating them from their families.',
    source: 'Clinical Statistics',
    theme: 'blue',
  },
  {
    id: 4,
    value: 1,
    decimals: 0,
    suffix: '%',
    prefix: '<',
    subValue: 'neurological rehab',
    title: 'Active BCI Access',
    desc: 'Traditional therapies do not actively engage or retrain real-time cortical wicara loops.',
    source: 'Neuro-rehab Studies',
    theme: 'red',
  },
];

export default function Problem() {
  return (
    <section id="problem" className="relative bg-white dark:bg-gray-950 py-24 sm:py-32 bg-clinical-grid transition-colors duration-200">
      {/* Red Ribbon divider above title */}
      <div className="mx-auto max-w-xs px-4">
        <div className="red-ribbon-divider" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Why This Matters
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Behind every scientific milestone is a human narrative. In Indonesia, stroke remains a leading cause of physical and communicative separation.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="mx-auto mt-20 max-w-6xl">
          <dl className="grid grid-cols-1 gap-12 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
            {stats.map((stat, index) => (
              <div key={stat.id} className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col justify-between clinical-card bg-white dark:bg-gray-900/40 p-6 border border-gray-200/60 dark:border-gray-800/60 shadow-sm rounded-2xl group transition-all duration-300 min-h-[260px] overflow-hidden ${
                    stat.theme === 'red' ? 'hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.06)]' :
                    stat.theme === 'green' ? 'hover:border-green-500/40 hover:shadow-[0_0_25px_rgba(34,197,94,0.06)]' :
                    'hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.06)]'
                  }`}
                >
                  {/* Top-Right Neuron Soma Node */}
                  <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-110 ${
                    stat.theme === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]' :
                    stat.theme === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]' :
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]'
                  }`} />

                  {/* Background Dendrite SVG inside card */}
                  <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-[0.03] group-hover:opacity-15 dark:group-hover:opacity-[0.08] transition-opacity duration-500 overflow-hidden">
                    <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" className="scale-110 group-hover:scale-125 transition-transform duration-700">
                      {/* Core soma */}
                      <circle cx="50" cy="50" r="3.5" className={`fill-current ${
                        stat.theme === 'red' ? 'text-red-500' :
                        stat.theme === 'green' ? 'text-green-500' :
                        'text-blue-500'
                      }`} />
                      
                      {/* Radiating branched dendrites */}
                      <path 
                        d="M 50,50 C 45,35 30,30 20,25 M 30,30 C 25,25 28,15 25,10 M 20,25 C 12,25 8,18 5,15" 
                        className={`stroke-current ${
                          stat.theme === 'red' ? 'text-red-500' :
                          stat.theme === 'green' ? 'text-green-500' :
                          'text-blue-500'
                        }`}
                        strokeWidth="0.75" 
                      />
                      <path 
                        d="M 50,50 C 60,40 70,35 80,30 M 70,35 C 75,25 72,15 75,10 M 80,30 C 88,30 92,22 95,20" 
                        className={`stroke-current ${
                          stat.theme === 'red' ? 'text-red-500' :
                          stat.theme === 'green' ? 'text-green-500' :
                          'text-blue-500'
                        }`}
                        strokeWidth="0.75" 
                      />
                      <path 
                        d="M 50,50 C 45,65 35,75 25,85 M 35,75 C 30,80 32,90 30,95 M 25,85 C 18,85 15,92 10,95" 
                        className={`stroke-current ${
                          stat.theme === 'red' ? 'text-red-500' :
                          stat.theme === 'green' ? 'text-green-500' :
                          'text-blue-500'
                        }`}
                        strokeWidth="0.75" 
                      />
                      <path 
                        d="M 50,50 C 60,60 75,65 85,75 M 75,65 C 80,70 78,80 80,85 M 85,75 C 92,75 95,82 98,85" 
                        className={`stroke-current ${
                          stat.theme === 'red' ? 'text-red-500' :
                          stat.theme === 'green' ? 'text-green-500' :
                          'text-blue-500'
                        }`}
                        strokeWidth="0.75" 
                      />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {stat.title}
                    </dt>
                    <dd className={`mt-4 flex flex-baseline items-baseline justify-start ${
                      stat.theme === 'red' ? 'text-red-500 dark:text-red-400' :
                      stat.theme === 'green' ? 'text-green-500 dark:text-green-400' :
                      'text-blue-500 dark:text-blue-400'
                    }`}>
                      <span className="text-4xl font-extrabold tracking-tight sm:text-5xl font-sans">
                        <CountUp
                          end={stat.value}
                          decimals={stat.decimals}
                          prefix={stat.prefix}
                          suffix={stat.suffix}
                        />
                      </span>
                      {stat.subValue && (
                        <span className="ml-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                          {stat.subValue}
                        </span>
                      )}
                    </dd>
                    <p className="mt-4 text-sm text-gray-650 dark:text-gray-300 leading-relaxed font-light">
                      {stat.desc}
                    </p>
                  </div>
                  <div className="relative z-10 mt-6 border-t border-gray-100 dark:border-gray-800 pt-3 text-[9px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                    Source: {stat.source}
                  </div>
                </motion.div>

                {/* Dendrite connection to next card (Desktop only) */}
                {index < stats.length - 1 && (
                  <div className="absolute left-[98%] top-[40%] -translate-y-1/2 w-8 h-16 hidden lg:block z-0 pointer-events-none">
                    <svg viewBox="0 0 32 64" width="100%" height="100%" fill="none" className="overflow-visible">
                      {/* Organic branching dendrite paths */}
                      <path 
                        d="M 0,32 C 12,32 15,16 18,16 C 21,16 23,40 32,40" 
                        className="stroke-slate-200 dark:stroke-slate-800/80" 
                        strokeWidth="1.5" 
                      />
                      <path 
                        d="M 0,32 C 10,32 15,48 20,48 C 25,48 27,32 32,32" 
                        className="stroke-slate-200 dark:stroke-slate-800/80" 
                        strokeWidth="1.5" 
                      />
                      {/* Branch offshoots */}
                      <path 
                        d="M 8,32 C 10,32 12,12 10,8" 
                        className="stroke-slate-200/40 dark:stroke-slate-800/40" 
                        strokeWidth="1" 
                      />
                      <path 
                        d="M 18,48 C 20,48 22,58 24,60" 
                        className="stroke-slate-200/40 dark:stroke-slate-800/40" 
                        strokeWidth="1" 
                      />
                      {/* Flowing RGB potential dots */}
                      <circle cx="18" cy="16" r="1.2" className="fill-green-500 animate-pulse" />
                      <circle cx="20" cy="48" r="1.2" className="fill-red-500 animate-pulse" />
                    </svg>
                  </div>
                )}

                {/* Dendrite connection to next card (Mobile/Tablet vertical stacking) */}
                {index < stats.length - 1 && (
                  <div className="absolute top-[96%] left-1/2 -translate-x-1/2 h-12 w-16 lg:hidden z-0 pointer-events-none">
                    <svg viewBox="0 0 64 32" width="100%" height="100%" fill="none" className="overflow-visible">
                      <path 
                        d="M 32,0 C 32,12 16,15 16,18 C 16,21 40,23 40,32" 
                        className="stroke-slate-200 dark:stroke-slate-800/80" 
                        strokeWidth="1.5" 
                      />
                      <path 
                        d="M 32,0 C 32,10 48,15 48,20 C 48,25 32,27 32,32" 
                        className="stroke-slate-200 dark:stroke-slate-800/80" 
                        strokeWidth="1.5" 
                      />
                      <circle cx="16" cy="18" r="1.2" className="fill-blue-500 animate-pulse" />
                      <circle cx="48" cy="20" r="1.2" className="fill-green-500 animate-pulse" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
