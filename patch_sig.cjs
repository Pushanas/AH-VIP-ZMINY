const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSET_PAIRS, DIRECTIONS, Signal } from '../types';
import { copyToClipboard } from '../utils';
import { 
  TrendingUp, TrendingDown, Clock, Search, RefreshCw, Copy, Check, Filter
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

  useEffect(() => {
    // Generate initial dummy data for demo purposes
    setSignals([
      { pair: 'USD/CAD OTC', time: '3:12 AM', direction: 'PUT', id: 1 },
      { pair: 'USD/EGP OTC', time: '3:16 AM', direction: 'PUT', id: 2 },
      { pair: 'USD/CAD OTC', time: '3:22 AM', direction: 'PUT', id: 3 },
      { pair: 'USD/EGP OTC', time: '3:29 AM', direction: 'CALL', id: 4 },
      { pair: 'USD/EGP OTC', time: '3:33 AM', direction: 'CALL', id: 5 },
    ]);
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
    }, 1500);
  };

  const filteredSignals = signals.filter(s => {
    const matchesSearch = s.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection = filterDirection === 'ALL' || s.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  const handleCopyAll = () => {
    if (filteredSignals.length === 0) return;
    const textToCopy = filteredSignals.map(s => \`\${s.pair} - \${s.time} - \${s.direction === 'CALL' ? 'صعود 🟢' : 'هبوط 🔴'}\`).join('\\n');
    copyToClipboard(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (signal: Signal, idx: number) => {
    const textToCopy = \`\${signal.pair} - \${signal.time} - \${signal.direction === 'CALL' ? 'صعود 🟢' : 'هبوط 🔴'}\`;
    copyToClipboard(textToCopy);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* 1. Setup Card */}
      <div className="bg-[#111827] rounded-3xl p-5 sm:p-6 border border-white/5 shadow-2xl relative overflow-hidden">
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#00F0FF]" />
          إعداد الإشارات
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400">وقت البدء (بتوقيت مصر)</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setTimeError(''); }}
              className="w-full bg-[#0B101E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
              dir="ltr"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400">وقت الانتهاء</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setTimeError(''); }}
              className="w-full bg-[#0B101E] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
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
              className="text-xs text-rose-400 font-bold mb-4"
            >
              {timeError}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#00F0FF] hover:bg-[#00D0FF] text-[#0B101E] font-extrabold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>جاري تحليل السوق...</span>
            </>
          ) : (
            <span>توليد الإشارات</span>
          )}
        </button>
      </div>

      {/* 2. Stats Row */}
      {signals.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 mb-1">الإجمالي</span>
            <span className="text-xl font-black text-white">{signals.length}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-emerald-400/80 mb-1">صعود</span>
            <span className="text-xl font-black text-emerald-400">{signals.filter(s => s.direction === 'CALL').length}</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-rose-400/80 mb-1">هبوط</span>
            <span className="text-xl font-black text-rose-400">{signals.filter(s => s.direction === 'PUT').length}</span>
          </div>
        </motion.div>
      )}

      {/* 3. Output Card */}
      <div className="bg-[#111827] rounded-3xl border border-white/5 shadow-2xl flex flex-col overflow-hidden min-h-[300px]">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#151F32]/30 sticky top-0 z-20 backdrop-blur-md">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن زوج عملات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B101E] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white focus:border-[#00F0FF]/50 outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-1 bg-[#0B101E] border border-white/10 p-1 rounded-xl">
              <button 
                onClick={() => setFilterDirection('ALL')}
                className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${filterDirection === 'ALL' ? 'bg-[#151F32] text-white' : 'text-slate-400 hover:text-white'}\`}
              >
                الكل
              </button>
              <button 
                onClick={() => setFilterDirection('CALL')}
                className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${filterDirection === 'CALL' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}\`}
              >
                صعود
              </button>
              <button 
                onClick={() => setFilterDirection('PUT')}
                className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${filterDirection === 'PUT' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white'}\`}
              >
                هبوط
              </button>
            </div>
            
            <button
              onClick={handleCopyAll}
              disabled={filteredSignals.length === 0}
              className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/5 hover:bg-[#00F0FF]/10 text-slate-300 hover:text-[#00F0FF] border border-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              title="نسخ جميع الإشارات"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="text-xs font-bold hidden sm:inline">{copiedAll ? 'تم النسخ' : 'نسخ الكل'}</span>
            </button>
          </div>
        </div>

        {/* Signals List */}
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          {isGenerating ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={\`h-[68px] w-full rounded-2xl bg-white/5 animate-pulse opacity-\${100 - i*15}\`} />
              ))}
            </div>
          ) : filteredSignals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-sm text-slate-400 font-bold">لا توجد إشارات في هذه الفترة</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredSignals.map((signal, idx) => {
                const isCall = signal.direction === 'CALL';
                const isCopied = copiedIndex === idx;
                
                return (
                  <motion.div
                    key={signal.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                    className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#0B101E] border border-white/5 hover:border-white/10 transition-colors gap-3 sm:gap-0"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-4 flex-1">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="font-mono text-[13px] sm:text-sm font-bold text-white whitespace-nowrap bg-white/5 px-2.5 py-1 rounded-lg" dir="ltr">
                          {signal.pair}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-400 whitespace-nowrap" dir="ltr">
                          {signal.time}
                        </span>
                      </div>
                      
                      {/* Mobile Direction Badge (shows up on the right for mobile, hidden on sm) */}
                      <div className="sm:hidden">
                        <span className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide \${isCall ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}\`}>
                          {isCall ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isCall ? 'صعود' : 'هبوط'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-none">
                      {/* Desktop Direction Badge */}
                      <span className={\`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide \${isCall ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}\`}>
                        {isCall ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isCall ? 'صعود' : 'هبوط'}
                      </span>
                      
                      <button
                        onClick={() => handleCopySingle(signal, idx)}
                        className={\`p-2 sm:p-2.5 rounded-xl flex items-center gap-2 transition-colors w-full sm:w-auto justify-center \${isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-slate-300'}\`}
                        title="نسخ الإشارة"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="text-xs font-bold sm:hidden">{isCopied ? 'تم النسخ' : 'نسخ الإشارة'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/SignalGenerator.tsx', code);
