'use client';

import React, { useState, useEffect } from 'react';
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

function TerminalHUD({ activeLayer, isMobile = false }: { activeLayer: number; isMobile?: boolean }) {
  const [eegValues, setEegValues] = useState({ fp1: -12.4, fp2: 14.8, f3: -8.1, f4: 3.2 });
  const [decoderProbs, setDecoderProbs] = useState({ supervised: 0.82, unsupervised: 0.78, rl: 0.89 });
  const [llmOutput, setLlmOutput] = useState("");
  
  // Layer 1 values generator
  useEffect(() => {
    if (activeLayer !== 1) return;
    const interval = setInterval(() => {
      setEegValues({
        fp1: +(Math.sin(Date.now() * 0.005) * 15 + Math.random() * 2).toFixed(2),
        fp2: +(Math.cos(Date.now() * 0.003) * 18 + Math.random() * 2).toFixed(2),
        f3: +(Math.sin(Date.now() * 0.007) * 10 + Math.random() * 1).toFixed(2),
        f4: +(Math.cos(Date.now() * 0.004) * 8 + Math.random() * 1.5).toFixed(2),
      });
    }, 150);
    return () => clearInterval(interval);
  }, [activeLayer]);

  // Layer 3 confidence generator
  useEffect(() => {
    if (activeLayer !== 3) return;
    const interval = setInterval(() => {
      setDecoderProbs({
        supervised: +(0.8 + Math.sin(Date.now() * 0.004) * 0.12 + Math.random() * 0.04).toFixed(2),
        unsupervised: +(0.75 + Math.cos(Date.now() * 0.003) * 0.15 + Math.random() * 0.03).toFixed(2),
        rl: +(0.85 + Math.sin(Date.now() * 0.005) * 0.08 + Math.random() * 0.02).toFixed(2),
      });
    }, 800);
    return () => clearInterval(interval);
  }, [activeLayer]);

  // Layer 4 Typing simulator
  useEffect(() => {
    if (activeLayer !== 4) return;
    const phrases = [
      { in: "sa ya ma kan na si", out: "Saya makan nasi." },
      { in: "se la mat pa gi", out: "Selamat pagi." },
      { in: "ter i ma ka sih", out: "Terima kasih." }
    ];
    let idx = 0;
    let typeInterval: NodeJS.Timeout;
    
    const cycle = () => {
      const current = phrases[idx];
      setLlmOutput("");
      let charIdx = 0;
      typeInterval = setInterval(() => {
        setLlmOutput(current.out.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx >= current.out.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            idx = (idx + 1) % phrases.length;
            cycle();
          }, 2500);
        }
      }, 70);
    };
    
    cycle();
    return () => {
      clearInterval(typeInterval);
    };
  }, [activeLayer]);

  const getVisualBar = (val: number) => {
    const percent = Math.min(100, Math.max(0, ((val + 30) / 60) * 100));
    return (
      <div className="w-24 h-1.5 bg-gray-200/20 dark:bg-slate-800/40 rounded-full overflow-hidden inline-block ml-3 align-middle">
        <div className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-150" style={{ width: `${percent}%` }} />
      </div>
    );
  };

  const getProbBar = (val: number) => {
    const percent = Math.min(100, Math.max(0, val * 100));
    return (
      <div className="w-24 h-1.5 bg-gray-200/20 dark:bg-slate-800/40 rounded-full overflow-hidden inline-block ml-3 align-middle">
        <div className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeLayer) {
      case 1:
        return (
          <div className="space-y-2.5 font-mono text-[9px] sm:text-[10px]">
            <div className="text-gray-400 dark:text-gray-500 italic"># Streaming active electrode potentials</div>
            <div className="flex items-center justify-between">
              <span>[CH 01] Fp1: <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{eegValues.fp1.toFixed(2)} uV</span></span>
              {getVisualBar(eegValues.fp1)}
            </div>
            <div className="flex items-center justify-between">
              <span>[CH 02] Fp2: <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{eegValues.fp2.toFixed(2)} uV</span></span>
              {getVisualBar(eegValues.fp2)}
            </div>
            <div className="flex items-center justify-between">
              <span>[CH 03] F3:  <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{eegValues.f3.toFixed(2)} uV</span></span>
              {getVisualBar(eegValues.f3)}
            </div>
            <div className="flex items-center justify-between">
              <span>[CH 04] F4:  <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{eegValues.f4.toFixed(2)} uV</span></span>
              {getVisualBar(eegValues.f4)}
            </div>
            <div className="mt-4 pt-3 border-t border-blue-500/10 dark:border-blue-500/20 text-gray-500 flex justify-between">
              <span>LSL Ingest: <span className="text-green-500">500 Hz</span></span>
              <span>Buffer: <span className="text-green-500">64 ch x 12</span></span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="font-mono text-[9px] sm:text-[10px] leading-relaxed text-gray-750 dark:text-gray-300">
            <div><span className="text-gray-400 dark:text-gray-500 italic"># Common Average Referencing Filter</span></div>
            <div><span className="text-purple-600 dark:text-purple-400 font-medium">def</span> <span className="text-blue-600 dark:text-blue-400">preprocess_eeg</span>(raw_signal):</div>
            <div><span className="pl-4 text-gray-400 dark:text-gray-500 italic"># Bandpass 8.0 - 45.0 Hz</span></div>
            <div><span className="pl-4">filtered = butter_bandpass(raw_signal, 8.0, 45.0)</span></div>
            <div><span className="pl-4 text-gray-400 dark:text-gray-500 italic"># Subtract average across 64 channels</span></div>
            <div><span className="pl-4">car_signal = filtered - np.mean(filtered, axis=0)</span></div>
            <div><span className="pl-4 text-gray-400 dark:text-gray-500 italic"># Spatial ICA EOG projection rejection</span></div>
            <div><span className="pl-4">clean_eeg = spatial_ica_reconstruct(car_signal)</span></div>
            <div><span className="pl-4 text-purple-600 dark:text-purple-400 font-medium">return</span> clean_eeg</div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3 font-mono text-[9px] sm:text-[10px]">
            <div className="text-gray-400 dark:text-gray-500 italic"># Model confidence ensembles</div>
            <div className="flex items-center justify-between">
              <span>EEGFormer: <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{(decoderProbs.supervised * 100).toFixed(0)}%</span></span>
              {getProbBar(decoderProbs.supervised)}
            </div>
            <div className="flex items-center justify-between">
              <span>EEGMAE: <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{(decoderProbs.unsupervised * 100).toFixed(0)}%</span></span>
              {getProbBar(decoderProbs.unsupervised)}
            </div>
            <div className="flex items-center justify-between">
              <span>DecisionT: <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{(decoderProbs.rl * 100).toFixed(0)}%</span></span>
              {getProbBar(decoderProbs.rl)}
            </div>
            <div className="mt-4 pt-3 border-t border-blue-500/10 dark:border-blue-500/20 text-gray-400 flex items-center justify-between">
              <span>Decoded Syllable:</span>
              <span className="text-blue-500 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded animate-pulse">"ma"</span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3 font-mono text-[9px] sm:text-[10px]">
            <div className="text-gray-400 dark:text-gray-500 italic"># Contextual Auto-Correction (vLLM)</div>
            <div className="space-y-1 bg-black/5 dark:bg-black/20 p-2.5 rounded-lg border border-blue-500/5 dark:border-blue-500/10">
              <div className="text-gray-500">&gt;&gt; Raw Syllables:</div>
              <div className="text-amber-600 dark:text-amber-400 font-semibold pl-2">"sa - ya - ma - kan - na - si"</div>
            </div>
            <div className="space-y-1 bg-black/5 dark:bg-black/20 p-2.5 rounded-lg border border-blue-500/5 dark:border-blue-500/10">
              <div className="text-gray-500">&gt;&gt; LLM Correction Output:</div>
              <div className="text-green-600 dark:text-green-400 font-semibold pl-2 min-h-[1.5em] flex items-center">
                {llmOutput}
                <span className="ml-1 w-1 h-3.5 bg-green-500 animate-pulse" />
              </div>
            </div>
            <div className="text-gray-500 text-[8.5px] flex justify-between">
              <span>Model: Llama-3.1-8B-BCI</span>
              <span>Temp: 0.1</span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-3 font-mono text-[9px] sm:text-[10px]">
            <div className="text-gray-400 dark:text-gray-500 italic"># Speech synthesis & feedforward UI</div>
            <div className="text-gray-500 leading-snug">
              $ piper --model id_ID.onnx \<br />
              <span className="pl-4">--input "Saya makan nasi"</span><br />
              <span className="pl-4">--output_file /tmp/output.wav</span>
            </div>
            <div className="text-blue-500 dark:text-blue-400 font-semibold">
              &gt;&gt; Playback status: AUDIO_STREAMING
            </div>
            
            <div className="flex items-center gap-1.5 h-10 justify-center border border-blue-500/10 dark:border-blue-500/25 bg-blue-500/5 rounded-lg py-2">
              <div className="w-1 bg-blue-500 dark:bg-blue-400 rounded animate-pulse-wave" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 bg-blue-500 dark:bg-blue-400 rounded animate-pulse-wave" style={{ animationDelay: '0.3s' }} />
              <div className="w-1 bg-blue-500 dark:bg-blue-400 rounded animate-pulse-wave" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 bg-blue-500 dark:bg-blue-400 rounded animate-pulse-wave" style={{ animationDelay: '0.5s' }} />
              <div className="w-1 bg-blue-500 dark:bg-blue-400 rounded animate-pulse-wave" style={{ animationDelay: '0.4s' }} />
              <div className="w-1 bg-blue-500 dark:bg-blue-400 rounded animate-pulse-wave" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const windowTitle = () => {
    switch (activeLayer) {
      case 1: return "acquisition_stream.py";
      case 2: return "realtime_filter.py";
      case 3: return "ensemble_decoder.py";
      case 4: return "context_corrector.py";
      case 5: return "audio_piper.sh";
      default: return "pipeline.log";
    }
  };

  const statusLabel = () => {
    switch (activeLayer) {
      case 1: return "STREAMING";
      case 2: return "FILTERING";
      case 3: return "DECODING";
      case 4: return "CORRECTING";
      case 5: return "SYNTHESIZING";
      default: return "IDLE";
    }
  };

  return (
    <div 
      className={`rounded-xl border border-blue-500/15 dark:border-blue-500/20 bg-white/45 dark:bg-slate-950/45 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-500 ${
        isMobile ? "w-full border-blue-500/30" : "animate-float-arch"
      }`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-100/40 dark:bg-slate-900/50 border-b border-blue-500/10 dark:border-blue-500/20">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <span className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
        <div className="text-[9.5px] font-mono font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          {windowTitle()}
        </div>
        <div className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {statusLabel()}
        </div>
      </div>
      
      {/* Terminal content */}
      <div className="p-4 bg-white/10 dark:bg-slate-950/20">
        {renderContent()}
      </div>
    </div>
  );
}

export default function Architecture() {
  const [activeLayer, setActiveLayer] = useState<number>(1);

  return (
    <section id="architecture" className="relative bg-white dark:bg-gray-950 py-24 sm:py-32 bg-clinical-grid transition-colors duration-200">
      {/* Inject custom animations CSS inline */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-arch {
          0%, 100% {
            transform: perspective(1000px) rotateY(10deg) rotateX(4deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateY(12deg) rotateX(6deg) translateY(-6px);
          }
        }
        .animate-float-arch {
          animation: float-arch 7s ease-in-out infinite;
        }
        @keyframes pulse-wave {
          0%, 100% { height: 6px; }
          50% { height: 26px; }
        }
        .animate-pulse-wave {
          animation: pulse-wave 0.8s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        @keyframes brainwave-1 {
          0%, 100% { transform: translateX(-1.5px); }
          50% { transform: translateX(1.5px); }
        }
        @keyframes brainwave-2 {
          0%, 100% { transform: translateX(2px); }
          50% { transform: translateX(-2px); }
        }
        @keyframes brainwave-3 {
          0%, 100% { transform: translateX(-1px); }
          50% { transform: translateX(1px); }
        }
        .animate-brainwave-1 {
          animation: brainwave-1 4s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-brainwave-2 {
          animation: brainwave-2 5s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-brainwave-3 {
          animation: brainwave-3 3s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes flow-down {
          from { stroke-dashoffset: 80; }
          to { stroke-dashoffset: 0; }
        }
        .flow-signal {
          stroke-dasharray: 15, 35;
          animation: flow-down 2s linear infinite;
        }
      ` }} />

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

        {/* 2-Column Grid Layout */}
        <div className="mx-auto mt-20 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Timeline Pipeline (col-span 7) */}
            <div className="relative lg:col-span-7 space-y-10">
              {/* Vertical Moving Brainwave Connecting Line */}
              <div className="absolute left-5 top-8 bottom-8 w-6 hidden md:block pointer-events-none z-0">
                <svg viewBox="0 0 40 1000" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                  {/* Wave 1: Red */}
                  <path 
                    d="M20,0 C10,50 30,100 20,150 C10,200 30,250 20,300 C10,350 30,400 20,450 C10,500 30,550 20,600 C10,650 30,700 20,750 C10,800 30,850 20,900 L20,1000" 
                    className="stroke-red-500/25 dark:stroke-red-500/15 animate-brainwave-1" 
                    strokeWidth="2" 
                    fill="none" 
                  />
                  {/* Wave 2: Green */}
                  <path 
                    d="M20,0 C30,40 10,90 20,130 C30,180 10,230 20,270 C30,320 10,370 20,410 C30,460 10,510 20,550 C30,600 10,650 20,695 C30,740 10,795 20,840 L20,1000" 
                    className="stroke-green-500/25 dark:stroke-green-500/15 animate-brainwave-2" 
                    strokeWidth="1.5" 
                    fill="none" 
                  />
                  {/* Wave 3: Blue */}
                  <path 
                    d="M20,0 C15,60 25,120 20,180 C15,240 25,300 20,360 C15,420 25,480 20,540 C15,600 25,660 20,720 C15,780 25,840 20,900 L20,1000" 
                    className="stroke-blue-500/35 dark:stroke-blue-400/25 animate-brainwave-3" 
                    strokeWidth="2.5" 
                    fill="none" 
                  />

                  {/* Flowing signal dash overlaying the blue wave */}
                  <path 
                    d="M20,0 C15,60 25,120 20,180 C15,240 25,300 20,360 C15,420 25,480 20,540 C15,600 25,660 20,720 C15,780 25,840 20,900 L20,1000" 
                    className="stroke-blue-500 dark:stroke-blue-400 animate-brainwave-3 flow-signal" 
                    strokeWidth="2.5" 
                    fill="none" 
                  />
                </svg>
              </div>

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
                    <div className={`absolute left-3.5 top-1.5 hidden h-9 w-9 items-center justify-center rounded-full text-white border-4 border-white dark:border-gray-950 shadow md:flex z-10 transition-all duration-300 ${
                      activeLayer === layer.num ? 'bg-blue-600 scale-110' : 'bg-gray-400 dark:bg-gray-800'
                    }`}>
                      <span className="text-xs font-bold">{layer.num}</span>
                    </div>

                    {/* Card content */}
                    <div 
                      onMouseEnter={() => setActiveLayer(layer.num)}
                      onClick={() => setActiveLayer(layer.num)}
                      className={`p-6 relative overflow-hidden group cursor-pointer transition-all duration-300 border rounded-xl ${
                        activeLayer === layer.num
                          ? "bg-blue-50/10 dark:bg-blue-950/20 border-blue-500/40 dark:border-blue-500/40 shadow-[0_4px_20px_rgba(59,130,246,0.08)] scale-[1.01]"
                          : "bg-white dark:bg-gray-900/50 border-gray-200/50 dark:border-gray-800/50 shadow-sm"
                      }`}
                    >
                      {/* Left vertical border stripe */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${
                        activeLayer === layer.num
                          ? "bg-blue-500"
                          : "bg-transparent group-hover:bg-blue-500/30"
                      }`} />
                      
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Left Header */}
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 transition-all duration-300 ${
                            activeLayer === layer.num ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                          }`}>
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

                      {/* Mobile Inline HUD (Visible only when this card is active) */}
                      {activeLayer === layer.num && (
                        <div className="mt-6 lg:hidden block animate-fadeIn">
                          <TerminalHUD activeLayer={activeLayer} isMobile />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Terminal Telemetry HUD (Desktop only, sticky) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-28 select-none">
              <TerminalHUD activeLayer={activeLayer} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
