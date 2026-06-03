'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, Calendar } from 'lucide-react';

const categories = {
  Affirmation: [
    { ind: 'Ya', eng: 'Yes', audio: true },
    { ind: 'Tidak', eng: 'No', audio: true },
    { ind: 'Bisa', eng: 'Able to / Can', audio: false },
    { ind: 'Mengerti', eng: 'Understand', audio: true },
  ],
  'Basic Needs': [
    { ind: 'Minum', eng: 'Drink', audio: true },
    { ind: 'Makan', eng: 'Eat', audio: true },
    { ind: 'Tidur', eng: 'Sleep', audio: false },
    { ind: 'Kamar Mandi', eng: 'Restroom / Toilet', audio: true },
  ],
  Verbs: [
    { ind: 'Mau', eng: 'Want / Wish', audio: false },
    { ind: 'Bantu', eng: 'Help', audio: true },
    { ind: 'Ambil', eng: 'Take / Fetch', audio: false },
    { ind: 'Dengar', eng: 'Listen / Hear', audio: false },
  ],
  Directions: [
    { ind: 'Kiri', eng: 'Left', audio: false },
    { ind: 'Kanan', eng: 'Right', audio: false },
    { ind: 'Atas', eng: 'Up', audio: false },
    { ind: 'Bawah', eng: 'Down', audio: false },
  ],
  People: [
    { ind: 'Saya', eng: 'I / Me', audio: false },
    { ind: 'Ibu', eng: 'Mother', audio: true },
    { ind: 'Bapak', eng: 'Father', audio: true },
    { ind: 'Dokter', eng: 'Doctor', audio: false },
  ],
  Feelings: [
    { ind: 'Sakit', eng: 'Pain / Hurt', audio: true },
    { ind: 'Lelah', eng: 'Tired / Fatigued', audio: false },
    { ind: 'Senang', eng: 'Happy', audio: false },
    { ind: 'Nyaman', eng: 'Comfortable', audio: true },
  ],
  Social: [
    { ind: 'Halo', eng: 'Hello', audio: true },
    { ind: 'Terima Kasih', eng: 'Thank You', audio: true },
    { ind: 'Permisi', eng: 'Excuse me', audio: false },
  ],
};

export default function Vocabulary() {
  const [activeTab, setActiveTab] = useState<keyof typeof categories>('Affirmation');
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const triggerAudioPlaceholder = (word: string) => {
    setPlayingWord(word);
    
    // Web Speech API generator
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingWord(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingWord(null), 1000);
    }
  };

  return (
    <section id="vocabulary" className="relative bg-gray-50/50 dark:bg-gray-950/30 py-24 sm:py-32 bg-clinical-grid transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Timeline Expansion Ribbon */}
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-6 shadow-sm">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-950 p-2 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    Vocabulary Expansion Timeline
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Target imagined speech dictionary size in N-of-1 patient protocols.
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex flex-col sm:flex-row w-full items-center justify-between max-w-md text-xs font-semibold text-gray-500 dark:text-gray-400 gap-4 sm:gap-1">
                <div className="flex flex-col items-center text-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Months 1-4</span>
                  <span className="mt-1 rounded bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] text-blue-800 dark:text-blue-300">10 Words</span>
                </div>
                <div className="hidden sm:block h-[2px] flex-grow bg-blue-200 dark:bg-blue-900/50 mx-2" />
                <div className="flex flex-col items-center text-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Months 4-12</span>
                  <span className="mt-1 rounded bg-blue-100 dark:bg-blue-950 px-2 py-0.5 text-[10px] text-blue-800 dark:text-blue-300">30 Words</span>
                </div>
                <div className="hidden sm:block h-[2px] flex-grow bg-blue-200 dark:bg-blue-900/50 mx-2" />
                <div className="flex flex-col items-center text-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Months 12-24</span>
                  <span className="mt-1 rounded bg-green-100 dark:bg-green-950 px-2 py-0.5 text-[10px] text-green-800 dark:text-green-300 font-bold">50 Words</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="mx-auto mt-16 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              "50 Words of Hope"
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              A curated vocabulary of imagined Bahasa Indonesia speech categories mapped to decoders, helping patients re-establish critical wicara loops.
            </p>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200/80 dark:border-gray-800 pb-4">
            {Object.keys(categories).map((catName) => (
              <button
                key={catName}
                onClick={() => setActiveTab(catName as keyof typeof categories)}
                className={`rounded-full px-4.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === catName
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {catName}
              </button>
            ))}
          </div>

          {/* Cards Carousel Grid */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-4 sm:grid-cols-4"
              >
                {categories[activeTab].map((word) => (
                  <div
                    key={word.ind}
                    className="relative flex flex-col justify-between clinical-card p-5 group overflow-hidden bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 shadow-sm rounded-xl"
                  >
                    <div>
                      {/* Animating Waveform overlay in top right corner if playing */}
                      {playingWord === word.ind && (
                        <div className="absolute top-4 right-4 flex items-end gap-0.5">
                          <div className="waveform-bar" />
                          <div className="waveform-bar" />
                          <div className="waveform-bar" />
                          <div className="waveform-bar" />
                          <div className="waveform-bar" />
                        </div>
                      )}
                      
                      {/* Indonesian word (large, blue-600) */}
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight block">
                        {word.ind}
                      </span>
                      {/* English translation (small, gray-500) */}
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-1">
                        {word.eng}
                      </span>
                    </div>

                    {/* Audio Synthesis play trigger */}
                    {word.audio && (
                      <div className="mt-6 flex items-center justify-between">
                        <button
                          onClick={() => triggerAudioPlaceholder(word.ind)}
                          className={`rounded-full p-2 transition-all ${
                            playingWord === word.ind
                              ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 animate-pulse'
                              : 'bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 group-hover:text-green-700 dark:group-hover:text-green-300'
                          }`}
                        >
                          <Play className="h-3 w-3 fill-current" />
                        </button>
                        <span className="text-[9px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-0.5">
                          <Volume2 className="h-3 w-3" /> {playingWord === word.ind ? 'Playing Audio' : 'Synthesis Ready'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
