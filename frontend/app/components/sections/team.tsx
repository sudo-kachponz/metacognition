'use client';

import React from 'react';
import { motion } from 'framer-motion';

const team = [
  {
    initials: 'NA',
    name: 'Nathania',
    role: 'Clinical Lead Neurologist',
    bio: 'Lead computational neuroscientist directing neural decoder architecture and clinical BCI protocol design.',
    focus: 'Universitas Airlangga',
  },
  {
    initials: 'FP',
    name: 'Firania',
    role: 'Machine Learning Engineer',
    bio: 'Stroke neurology specialist overseeing patient safety, ethical compliance, and functional clinical assessments.',
    focus: 'Clinical Neurology',
  },
  {
    initials: 'RW',
    name: 'Maulana A Empitu',
    role: 'Speech-Language Pathologist',
    bio: 'Aphasia rehabilitation expert adapting semantic consent systems and communicative motor-imagery drills.',
    focus: 'Universitas Airlangga',
  },
  {
    initials: 'BU',
    name: 'Bagas Utama, M.Sc.',
    role: 'ML Engineer — Decoders',
    bio: 'Builds real-time EEG feature embedding decoders leveraging supervised, unsupervised, and RL models.',
    focus: 'Deep Learning',
  },
  {
    initials: 'AL',
    name: 'Annisa Lestari, Ph.D.',
    role: 'ML Engineer — Language Models',
    bio: 'Implements lightweight local LLM pipelines for grammatical syllabic auto-correction and intent prediction.',
    focus: 'NLP / LLMs',
  },
  {
    initials: 'DA',
    name: 'dr. Dewa Putu Agung, M.Biomed',
    role: 'Research Coordinator',
    bio: 'Directs longitudinal patient calibration compliance, database integrity, and institutional ethics panels.',
    focus: 'Research Operations',
  },
];

export default function Team() {
  return (
    <section id="team" className="relative bg-gray-50/50 dark:bg-gray-950/40 py-24 sm:py-32 bg-clinical-grid transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              The Researchers
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our multidisciplinary team bridges the gap between state-of-the-art computational algorithms and patient-centered clinical care.
            </p>
          </motion.div>
        </div>

        {/* Card Grid */}
        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex flex-col justify-between clinical-card p-6 bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-xl"
              >
                <div>
                  {/* Top Avatar Row */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900 font-bold tracking-tight">
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                        {member.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mt-1 block">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-6 text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                    {member.bio}
                  </p>
                </div>

                {/* Focus Area Tag */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="inline-flex items-center rounded bg-green-50 dark:bg-green-950/80 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wider border border-green-200 dark:border-green-900/50">
                    {member.focus}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    NP-RESEARCH
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
