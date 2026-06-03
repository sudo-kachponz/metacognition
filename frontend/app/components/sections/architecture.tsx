'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Eye, Zap, MessageSquare, Radio } from 'lucide-react';

const layers = [
  {
    num: 1,
    name: 'EEG Acquisition',
    tech: '64-ch BrainProducts LiveAmp',
    latency: '<1ms',
    icon: Radio,
    desc: 'High-density, low-noise active electrode caps feeding streaming microvolt potentials directly into the ingestion ring.',
  },
  {
    num: 2,
    name: 'Real-time Pre-processing',
    tech: 'MNE-Python, pylsl, Real-time CAR filters',
    latency: '<5ms',
    icon: Cpu,
    desc: 'Instant artifact ejection (EOG/EMG), bandpass filtering (8-45Hz), and common average referencing to isolate speech intent.',
  },
  {
    num: 3,
    name: 'Three-DNN Decoder',
    tech: 'Hybrid Convoluted EEG Transformer Pipeline',
    latency: '<20ms',
    icon: Zap,
    desc: 'Parallel classification of imagined speech syllables leveraging three learning paradigms.',
    subItems: [
      { text: 'Supervised Learning', color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50' },
      { text: 'Unsupervised Autoencoding', color: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/50' },
      { text: 'Reinforcement Learning Tuning', color: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/50' },
    ],
  },
  {
    num: 4,
    name: 'Local Language Model',
    tech: 'Qwen3-8B / Llama 3.1 8B (vLLM local)',
    latency: '<50ms',
    icon: MessageSquare,
    desc: 'Contextual auto-correction of raw decoded syllables into coherent Bahasa Indonesia sentences with patient intent.',
  },
  {
    num: 5,
    name: 'Visual & Auditory Feedback',
    tech: 'Piper TTS engine + Next.js interactive UI',
    latency: '<100ms total',
    icon: Eye,
    desc: 'Vocal output via localized low-latency speech synthesizer and interactive visual confirmation cue on screen.',
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="relative bg-white dark:bg-gray-950 py-24 sm:py-32 bg-clinical-grid transition-colors duration-200">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-clinical-grid opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              System Architecture
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our 5-layer low-latency ingestion and decoding pipeline processes thoughts into words in under 100 milliseconds.
            </p>
          </motion.div>
        </div>

        {/* Timeline Pipeline */}
        <div className="relative mx-auto mt-20 max-w-3xl">
          {/* Vertical Connecting Line */}
          <div className="absolute left-8 top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500 via-green-500 to-red-500 hidden md:block" />

          <div className="space-y-12">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <motion.div
                  key={layer.num}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative md:pl-20"
                >
                  {/* Timeline Node Icon (Desktop only) */}
                  <div className="absolute left-3.5 top-1.5 hidden h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white border-4 border-white dark:border-gray-950 shadow md:flex z-10">
                    <span className="text-xs font-bold">{layer.num}</span>
                  </div>

                  {/* Card content */}
                  <div className="clinical-card p-6 relative overflow-hidden group bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-xl">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 md:hidden" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Left Header */}
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/60 p-2 text-blue-600 dark:text-blue-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="md:hidden text-blue-600">#{layer.num}</span> {layer.name}
                          </h3>
                          <code className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono tracking-tight mt-0.5 block">
                            {layer.tech}
                          </code>
                        </div>
                      </div>

                      {/* Right Latency Badge */}
                      <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950/50 px-3 py-0.5 text-xs font-semibold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/50">
                        {layer.latency}
                      </span>
                    </div>

                    {/* Desc */}
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                      {layer.desc}
                    </p>

                    {/* Sub-items for DNN paradigm */}
                    {layer.subItems && (
                      <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                        {layer.subItems.map((sub) => (
                          <span
                            key={sub.text}
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sub.color}`}
                          >
                            {sub.text}
                          </span>
                        ))}
                      </div>
                    )}
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
