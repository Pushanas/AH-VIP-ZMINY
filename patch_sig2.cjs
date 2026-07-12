const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSET_PAIRS, DIRECTIONS, Signal } from '../types';
import { copyToClipboard } from '../utils';
import { 
  TrendingUp, TrendingDown, Search, RefreshCw, Copy, Check, Zap, Timer
} from 'lucide-react';

const getEgyptTimeInit = () => {
  try {
    const egyptTimeStr = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'Africa/Cairo', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    return egyptTimeStr.slice(0, 5);
  } catch(e) {
    return "00:00";
  }
};

const formatMinutesTo12Hour = (totalMins: number) => {
  let m = totalMins % (24 * 60);
  if (m < 0) m += 24 * 60;
  let hours = Math.floor(m / 60);
  const minutes = m % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const mStr = minutes < 10 ? '0' + minutes : minutes;
  return \`\${hours}:\${mStr} \${ampm}\`;
};

export default function SignalGenerator({ lang }: { lang: 'ar' | 'en' }) {
  const [startTime, setStartTime] = useState(getEgyptTimeInit());
  const [endTime, setEndTime] = useState('');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'CALL' | 'PUT'>('ALL');
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    // Start with empty signals for clean state. No dummy data.
  }, []);

  const handleGenerate = () => {
    if (!startTime || !endTime) {
      setTimeError(lang === 'ar' ? 'يرجى تحديد وقت البدء والانتهاء' : 'Please select start and end time');
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let totalStartMins = startH * 60 + startM;
    let totalEndMins = endH * 60 + endM;

    if (totalEndMins < totalStartMins) {
      totalEndMins += 24 * 60; // next day
    }

    if (totalEndMins - totalStartMins <= 0) {
      setTimeError(lang === 'ar' ? 'وقت الانتهاء يجب أن يكون بعد وقت البدء' : 'End time must be after start time');
      return;
    }

    setTimeError('');
    setIsGenerating(true);

    setTimeout(() => {
      const generated: Signal[] = [];
      const numSignals = Math.floor(Math.random() * 5) + 3; // 3 to 7 signals
      let currentMin = totalStartMins;
      
      for (let i = 0; i < numSignals; i++) {
        currentMin += Math.floor(Math.random() * 15) + 5;
        if (currentMin > totalEndMins) break;
        
        generated.push({
          pair: ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)],
          time: formatMinutesTo12Hour(currentMin),
          direction: DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
          id: Math.random()
        });
      }
      
      setSignals(generated);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1500);
  };

  const filteredSignals = signals.filter(s => {
    const matchesSearch = s.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection = filterDirection === 'ALL' || s.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  const handleCopyAll = () => {
    if (filteredSignals.length === 0) return;
    const textToCopy = filteredSignals.map(s => \`\${s.pair} - \${s.time} - \${s.direction === 'CALL' ? 'صعود 🟢' : 'هبوط 🔴'} - دقيقة\`).join('\\n');
    copyToClipboard(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (signal: Signal, idx: number) => {
    const textToCopy = \`\${signal.pair} - \${signal.time} - \${signal.direction === 'CALL' ? 'صعود 🟢' : 'هبوط 🔴'} - دقيقة\`;
    copyToClipboard(textToCopy);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* 2300 Aesthetic: Core Engine Card */}
      <div className="bg-transparent border border-[#00F0FF]/10 rounded-[32px] p-6 sm:p-8 relative overflow-hidden backdrop-blur-3xl shadow-[0_0_80px_rgba(0,240,255,0.03)]">
        
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00F0FF]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
            <Zap className="w-6 h-6 text-[#00F0FF]" />
            AH VIP CORE
          </h2>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00F0FF]/20 bg-[#00F0FF]/5">
            <Timer className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs font-bold text-[#00F0FF] tracking-wide">مدة الصفقات: 1 دقيقة</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          <div className="flex-1 flex flex-col gap-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">وقت البدء (بتوقيت مصر)</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setTimeError(''); }}
              className="w-full bg-white/[0.02] border border-white/5 hover:border-[#00F0FF]/30 rounded-2xl px-5 py-4 text-white text-lg font-mono focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 outline-none transition-all duration-300"
              dir="ltr"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">وقت الانتهاء (بتوقيت مصر)</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setTimeError(''); }}
              className="w-full bg-white/[0.02] border border-white/5 hover:border-[#00F0FF]/30 rounded-2xl px-5 py-4 text-white text-lg font-mono focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 outline-none transition-all duration-300"
              dir="ltr"
            />
          </div>
        </div>

        <AnimatePresence>
          {timeError && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-rose-400 font-bold mb-5 px-2"
            >
              {timeError}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full relative group overflow-hidden rounded-2xl p-[1px]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#0066FF] opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-[#0B101E] px-6 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-transparent disabled:bg-[#0B101E]">
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 text-[#00F0FF] animate-spin" />
                <span className="text-white font-extrabold tracking-wide">SYSTEM PROCESSING...</span>
              </>
            ) : (
              <span className="text-white font-extrabold tracking-wide group-hover:text-[#0B101E] transition-colors duration-300">بدء التحليل واستخراج الإشارات</span>
            )}
          </div>
        </button>
      </div>

      {/* Output Stream */}
      <AnimatePresence mode="wait">
        {hasGenerated && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Minimal Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
              <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setFilterDirection('ALL')}
                  className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${filterDirection === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}\`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setFilterDirection('CALL')}
                  className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${filterDirection === 'CALL' ? 'bg-[#00F0FF]/10 text-[#00F0FF]' : 'text-slate-500 hover:text-white'}\`}
                >
                  CALL
                </button>
                <button 
                  onClick={() => setFilterDirection('PUT')}
                  className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all \${filterDirection === 'PUT' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-500 hover:text-white'}\`}
                >
                  PUT
                </button>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search pair..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-2 pr-10 pl-4 text-sm text-white focus:border-[#00F0FF]/50 outline-none transition-colors font-mono"
                    dir="ltr"
                  />
                </div>
                
                <button
                  onClick={handleCopyAll}
                  disabled={filteredSignals.length === 0}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-[#00F0FF]/10 text-slate-400 hover:text-[#00F0FF] border border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              {filteredSignals.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-sm uppercase tracking-widest">
                  No signals match criteria
                </div>
              ) : (
                filteredSignals.map((signal, idx) => {
                  const isCall = signal.direction === 'CALL';
                  const isCopied = copiedIndex === idx;
                  
                  return (
                    <motion.div
                      key={signal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                      className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#00F0FF]/20 transition-all backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-5 sm:gap-8">
                        <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider w-24 sm:w-32" dir="ltr">
                          {signal.pair}
                        </span>
                        
                        <div className="h-4 w-px bg-white/10 hidden sm:block" />
                        
                        <span className="font-mono text-sm sm:text-base text-slate-400 font-medium" dir="ltr">
                          {signal.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className={\`font-mono text-xs sm:text-sm font-bold tracking-widest \${isCall ? 'text-[#00F0FF]' : 'text-rose-400'}\`}>
                          {isCall ? 'CALL 🟢' : 'PUT 🔴'}
                        </span>
                        
                        <button
                          onClick={() => handleCopySingle(signal, idx)}
                          className={\`w-10 h-10 rounded-xl flex items-center justify-center transition-all \${isCopied ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'}\`}
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
`;

fs.writeFileSync('src/components/SignalGenerator.tsx', code);
