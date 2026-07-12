import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSET_PAIRS, DIRECTIONS, Signal } from '../types';
import { copyToClipboard } from '../utils';
import { 
  TrendingUp, TrendingDown, Search, RefreshCw, Copy, Check, Zap, Timer,
  Star, Bookmark, Activity, Cpu, SlidersHorizontal, ArrowUpRight, ArrowDownRight, Sparkles, Clock
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
  
  // Interactive feature: Local Star/Favorite state for specific signals
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Dynamic Scanning simulation step messages
  const [scanStep, setScanStep] = useState(0);
  const scanMessages = [
    lang === 'ar' ? "جارِ الاتصال بخادم البورصة الآمن..." : "Securing exchange server link...",
    lang === 'ar' ? "جارِ تحليل قنوات السيولة وتدفقات الـ OTC..." : "Analyzing liquidity pool & OTC flow...",
    lang === 'ar' ? "جارِ استخلاص خوارزميات الدعم والمقاومة الذكية..." : "Calculating support & resistance vectors...",
    lang === 'ar' ? "تصفية إشارات الـ VIP عالية الاحتمالية..." : "Filtering optimal high-probability signals..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

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
      let currentMin = totalStartMins + 5;
      
      while (currentMin < totalEndMins) {
        const hours = Math.floor(currentMin / 60) % 24;
        const minutes = currentMin % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        generated.push({
          pair: ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)],
          time: timeString,
          direction: DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
          id: Math.random()
        });
        
        const randomMinutesToAdd = Math.floor(Math.random() * 7) + 2;
        currentMin += randomMinutesToAdd;
      }
      
      setSignals(generated);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1600);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredSignals = signals.filter(s => {
    const matchesSearch = s.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection = filterDirection === 'ALL' || s.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  // Sort signals: Favorites always bubble to the top for convenient trading access
  const sortedSignals = [...filteredSignals].sort((a, b) => {
    const aFav = favorites[a.id] ? 1 : 0;
    const bFav = favorites[b.id] ? 1 : 0;
    return bFav - aFav;
  });

  const handleCopyAll = () => {
    if (filteredSignals.length === 0) return;
    const textToCopy = filteredSignals.map(s => `${s.time} - ${s.pair} ${s.direction}`).join('\n');
    copyToClipboard(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopySingle = (signal: Signal, idx: number) => {
    const textToCopy = `${signal.time} - ${signal.pair} ${signal.direction}`;
    copyToClipboard(textToCopy);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-full">
      
      {/* Redesigned Luxury Engine Control Center */}
      <div className="bg-gradient-to-b from-[#0d1122] to-[#060814] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        
        {/* Subtle top border accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/25 to-transparent" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#0066FF]/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Dashboard Section Title - Center Aligned & Balanced */}
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center shadow-inner mb-4">
            <Zap className="w-6 h-6 text-[#00F0FF] animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">وحدة استخراج الإشارات الذكية</h2>
          <p className="text-xs font-semibold text-slate-400 mt-2 max-w-md">توليد أقوى إشارات التداول الذكية بدقة متناهية بالاعتماد على خوارزميات AH VIP المتطورة</p>
          
          {/* Duration Badge - Centered & Reduced Height */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-[10px] font-black tracking-wide mt-4">
            <Timer className="w-3.5 h-3.5 animate-pulse" />
            <span>فترة تداول الصفقة: دقيقة واحدة (1M)</span>
          </div>
        </div>
        
        {/* Inputs row - Identical, balanced, structured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 justify-start">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              وقت البدء (بتوقيت مصر)
            </label>
            <div className="relative group">
              <input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setTimeError(''); }}
                className="w-full h-14 bg-[#03050c]/80 border border-white/10 hover:border-[#00F0FF]/30 focus:border-[#00F0FF]/80 rounded-2xl pl-12 pr-5 text-white text-base font-mono outline-none transition-all duration-300 shadow-inner text-left"
                dir="ltr"
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-hover:text-[#00F0FF] transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 justify-start">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              وقت الانتهاء (بتوقيت مصر)
            </label>
            <div className="relative group">
              <input
                type="time"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setTimeError(''); }}
                className="w-full h-14 bg-[#03050c]/80 border border-white/10 hover:border-[#00F0FF]/30 focus:border-[#00F0FF]/80 rounded-2xl pl-12 pr-5 text-white text-base font-mono outline-none transition-all duration-300 shadow-inner text-left"
                dir="ltr"
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-hover:text-[#00F0FF] transition-colors" />
            </div>
          </div>
        </div>

        {/* Error presentation */}
        <AnimatePresence>
          {timeError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3.5 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400 rotate-45 shrink-0" />
                <span className="text-xs text-rose-300 font-bold">{timeError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate triggers with state feedback */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full bg-[#03050c] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden"
              >
                {/* Advanced Tech Radar visual wave */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00F0FF]/10 overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_10px_#00F0FF]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
                      <Cpu className="w-4.5 h-4.5 text-[#00F0FF] animate-spin" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">AI ALGORITHMIC DISPATCH</span>
                      <span className="text-xs font-black text-[#00F0FF] mt-0.5 tracking-wide">
                        {scanMessages[scanStep]}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-1 rounded-lg">
                    {Math.min(100, Math.round((scanStep + 1) * 25))}%
                  </span>
                </div>

                {/* Simulated live telemetry bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${(scanStep + 1) * 25}%` }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0066FF] shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="btn-trigger"
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-16 relative overflow-hidden rounded-full shadow-[0_0_30px_rgba(0,240,255,0.25)] border border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF] via-[#0066FF] to-[#8000FF] hover:brightness-110 active:brightness-95 transition-all cursor-pointer group flex items-center justify-center"
              >
                {/* Micro reflection shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                
                {/* Premium typography and glowing icon */}
                <span className="text-white font-black tracking-wider text-sm flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  <span>بدء استخراج الإشارات الفورية VIP</span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Output Stream Content Area */}
      <AnimatePresence mode="wait">
        {hasGenerated && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:gap-5"
          >
            {/* Minimal Luxury Control Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
              
              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 bg-[#0d1122]/90 border border-white/10 p-1 rounded-2xl w-full md:w-auto relative">
                <button 
                  onClick={() => setFilterDirection('ALL')}
                  className={`flex-1 md:flex-initial h-9 px-5 rounded-xl text-xs font-black transition-all cursor-pointer ${filterDirection === 'ALL' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}
                >
                  الكل
                </button>
                <button 
                  onClick={() => setFilterDirection('CALL')}
                  className={`flex-1 md:flex-initial h-9 px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filterDirection === 'CALL' ? 'bg-[#00F0FF]/10 text-[#00F0FF]' : 'text-slate-500 hover:text-white'}`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  CALL
                </button>
                <button 
                  onClick={() => setFilterDirection('PUT')}
                  className={`flex-1 md:flex-initial h-9 px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filterDirection === 'PUT' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-500 hover:text-white'}`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  PUT
                </button>
              </div>
              
              {/* Search and Action commands */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Modern Command Search bar */}
                <div className="relative flex-1 md:w-56">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="ابحث عن زوج العملات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 bg-[#0d1122]/90 border border-white/10 focus:border-[#00F0FF]/40 rounded-2xl pr-10 pl-4 text-xs font-bold text-white outline-none transition-all font-mono placeholder:font-sans placeholder:text-slate-600"
                    dir="rtl"
                  />
                </div>
                
                {/* Bulk Action Copy Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyAll}
                  disabled={filteredSignals.length === 0}
                  className="w-11 h-11 rounded-2xl bg-[#0d1122]/90 hover:bg-[#00F0FF]/10 text-slate-400 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/30 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="نسخ جميع الإشارات المعروضة"
                >
                  {copiedAll ? <Check className="w-4.5 h-4.5 text-[#00F0FF]" /> : <Copy className="w-4.5 h-4.5" />}
                </motion.button>
              </div>
            </div>

            {/* Micro details counter */}
            <div className="px-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-600" />
                <span>نتائج التصفية: {filteredSignals.length} إشارة تداول جاهزة</span>
              </span>
              <span>انقر فوق النجمة لتثبيت الإشارة في الأعلى</span>
            </div>

            {/* Redesigned Luxury Signals List */}
            <div className="flex flex-col gap-3">
              {sortedSignals.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-white/[0.01] border border-white/5 rounded-3xl font-mono text-xs uppercase tracking-widest">
                  No signals found matching search criteria
                </div>
              ) : (
                sortedSignals.map((signal, idx) => {
                  const isCall = signal.direction === 'CALL';
                  const isCopied = copiedIndex === idx;
                  const isFav = !!favorites[signal.id];
                  
                  return (
                    <motion.div
                      key={signal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.45, type: "spring", bounce: 0.2 }}
                      className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all backdrop-blur-xl relative overflow-hidden ${
                        isFav 
                          ? 'bg-[#00F0FF]/5 border-[#00F0FF]/35 shadow-[0_4px_25px_rgba(0,240,255,0.05)]' 
                          : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-[#00F0FF]/35 shadow-sm'
                      }`}
                    >
                      {/* Left glow overlay on active hover */}
                      <div className={`absolute top-0 bottom-0 left-0 w-1 transition-all duration-300 opacity-50 group-hover:opacity-100 ${
                        isCall ? 'bg-[#00F0FF]' : 'bg-rose-500'
                      }`} />

                      <div className="flex items-center gap-4 sm:gap-6">
                        {/* Favorite Star action */}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => toggleFavorite(signal.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            isFav 
                              ? 'text-[#00F0FF] bg-[#00F0FF]/10' 
                              : 'text-slate-600 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
                        </motion.button>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6">
                          {/* Asset Name with spaced look */}
                          <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider" dir="ltr">
                            {signal.pair}
                          </span>
                          
                          <div className="h-4.5 w-px bg-white/10 hidden sm:block" />
                          
                          {/* Time Stamp badge */}
                          <div className="flex items-center gap-1 text-xs font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{signal.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right directions and actions */}
                      <div className="flex items-center gap-3 sm:gap-5">
                        
                        {/* Call/Put Direction badging with vector icons */}
                        <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wider ${
                          isCall 
                            ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/10' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                        }`}>
                          {isCall ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '2.5s' }} />
                              <span>CALL 🟢</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '2.5s' }} />
                              <span>PUT 🔴</span>
                            </>
                          )}
                        </div>
                        
                        {/* Copy specific line item */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopySingle(signal, idx)}
                          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                            isCopied 
                              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-transparent'
                          }`}
                        >
                          {isCopied ? <Check className="w-4 h-4 text-[#00F0FF]" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
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
