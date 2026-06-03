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
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col justify-between clinical-card border-t-4 border-t-red-500 bg-white dark:bg-gray-900/50 p-6 border-l border-r border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-b-xl"
              >
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </dt>
                  <dd className="mt-4 flex flex-baseline items-baseline justify-center text-blue-600 dark:text-blue-400">
                    <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                      <CountUp
                        end={stat.value}
                        decimals={stat.decimals}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </span>
                    {stat.subValue && (
                      <span className="ml-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {stat.subValue}
                      </span>
                    )}
                  </dd>
                  <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                    {stat.desc}
                  </p>
                </div>
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-3 text-[10px] font-medium tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                  Source: {stat.source}
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
