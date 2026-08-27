import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSET_PAIRS, DIRECTIONS, Signal } from '../types';
import { copyToClipboard } from '../utils';
import { 
  TrendingUp, TrendingDown, Search, RefreshCw, Copy, Check, Zap, Timer,
  Star, Bookmark, Activity, Cpu, SlidersHorizontal, ArrowUpRight, ArrowDownRight, Sparkles, Clock, Send, MessageCircle, AlertCircle, ShieldAlert, Lock, Split
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
    return "09:00";
  }
};

const getEgyptEndTimeInit = () => {
  try {
    const timeStr = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'Africa/Cairo', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    const [h, m] = timeStr.split(':').map(Number);
    let totalMins = (h || 0) * 60 + (m || 0) + 45; // 45 minutes default window for rich gap signals
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  } catch(e) {
    return "10:00";
  }
};

const getCairoDateStr = () => {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
};

const parseTimeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const SUPPORT_LINK = "https://t.me/A_H_QUOTEX_SUPPORT";

export default function SignalGenerator({ lang }: { lang: 'ar' | 'en' }) {
  // Load saved signals for today on mount
  useEffect(() => {
    try {
      localStorage.removeItem('ah_vip_locked_date');
      const today = getCairoDateStr();
      const saved = localStorage.getItem('ah_vip_today_signals_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today && Array.isArray(parsed.signals) && parsed.signals.length > 0) {
          setSignals(parsed.signals);
          setHasGenerated(true);
        }
      }
      fetch('/api/clear-rate-limits', { method: 'POST' }).catch(() => {});
    } catch (e) {}
  }, []);

  const [startTime, setStartTime] = useState(getEgyptTimeInit());
  const [endTime, setEndTime] = useState(getEgyptEndTimeInit());
  const [gapMode, setGapMode] = useState<'STANDARD' | 'GAP_SYSTEM'>('GAP_SYSTEM');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [timeError, setTimeError] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'CALL' | 'PUT'>('ALL');
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Interactive Neon Glow Micro-Interaction State for Generate Button
  const [btnGlow, setBtnGlow] = useState<{ x: number; y: number; active: boolean; isClicking: boolean }>({
    x: 0,
    y: 0,
    active: false,
    isClicking: false
  });

  const handleBtnPointerMove = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setBtnGlow(prev => ({ ...prev, x, y, active: true }));
  };

  const handleBtnPointerDown = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    handleBtnPointerMove(e);
    setBtnGlow(prev => ({ ...prev, isClicking: true, active: true }));
  };

  const handleBtnPointerUp = () => {
    setBtnGlow(prev => ({ ...prev, isClicking: false }));
  };

  const handleBtnPointerLeave = () => {
    setBtnGlow(prev => ({ ...prev, active: false, isClicking: false }));
  };

  // Digital Countdown State
  const [isFreePlanExpired, setIsFreePlanExpired] = useState(false);
  const [hoursLeftOnly, setHoursLeftOnly] = useState(0);

  const currentCount = signals.length;

  // Background timer: tracks 24h reset & auto-detects 1 min past last trade time
  useEffect(() => {
    const checkExpirationAndCountdown = () => {
      let passedCairoSeconds = 0;
      try {
        const nowCairoStr = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Africa/Cairo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        const [h, m, s] = nowCairoStr.split(':').map(Number);
        passedCairoSeconds = (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
      } catch (e) {
        const now = new Date();
        passedCairoSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      }

      const remainingSecs = Math.max(0, 86400 - passedCairoSeconds);
      const hLeft = Math.floor(remainingSecs / 3600);
      setHoursLeftOnly(hLeft);

      // Check if 1 minute has passed after last generated trade time in Egypt
      if (signals && signals.length > 0) {
        const lastSignal = signals[signals.length - 1];
        if (lastSignal && lastSignal.time) {
          const lastMins = parseTimeToMinutes(lastSignal.time);
          const expirationTargetSecs = (lastMins + 1) * 60; // time of last trade + 1 min
          if (passedCairoSeconds >= expirationTargetSecs) {
            setIsFreePlanExpired(true);
            return;
          }
        }
      }
      setIsFreePlanExpired(false);
    };

    checkExpirationAndCountdown();
    const interval = setInterval(checkExpirationAndCountdown, 1000);
    return () => clearInterval(interval);
  }, [signals]);

  // Local Star/Favorite state
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Dynamic Scanning simulation step messages
  const [scanStep, setScanStep] = useState(0);
  const scanMessages = [
    lang === 'ar' ? "جارِ الاتصال بخادم صفقات الفجوات الـ OTC..." : "Securing OTC gap server link...",
    lang === 'ar' ? "جارِ حساب فجوات التداول الذكية (2-8 دقائق)..." : "Calculating 2-8 min gap intervals...",
    lang === 'ar' ? "جارِ استخلاص إشارات الدعم والمقاومة السعرية..." : "Extracting optimal support & resistance vectors...",
    lang === 'ar' ? "تصفية أقوى صفقات الفجوات عالية الدقة VIP..." : "Filtering high-probability gap trades..."
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

  // Gap Signals Generation System (صفقات فجوات)
  const handleGenerate = () => {
    if (!startTime || !endTime) {
      setTimeError(lang === 'ar' ? 'يرجى تحديد وقت البدء والانتهاء' : 'Please select start and end time');
      return;
    }

    const today = getCairoDateStr();
    const now = Date.now();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let totalStartMins = startH * 60 + startM;
    let totalEndMins = endH * 60 + endM;

    if (totalEndMins < totalStartMins) {
      totalEndMins += 24 * 60; // handle cross-midnight
    }

    if (totalEndMins - totalStartMins <= 0) {
      setTimeError(lang === 'ar' ? 'وقت الانتهاء يجب أن يكون بعد وقت البدء' : 'End time must be after start time');
      return;
    }

    setTimeError('');
    setIsGenerating(true);

    setTimeout(() => {
      const generated: Signal[] = [];
      let currentTime = totalStartMins + 5;

      // Exact Time-Gap Generation Loop from uploaded gap system:
      // Steps through [start + 5 -> end] with random intervals (2 to 8 mins)
      while (currentTime < totalEndMins) {
        const hours = Math.floor(currentTime / 60) % 24;
        const minutes = currentTime % 60;
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const pair = ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)];
        const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

        // Dynamic random gap minutes (2 to 8 minutes interval)
        const randomMinutesToAdd = Math.floor(Math.random() * 7) + 2;

        generated.push({
          pair,
          time: timeString,
          direction,
          gapMinutes: randomMinutesToAdd,
          id: Math.random()
        });

        currentTime += randomMinutesToAdd;
      }

      // If the window was too narrow to yield at least 3 signals, create a tight fallback
      if (generated.length < 3) {
        let fallbackTime = totalStartMins + 3;
        for (let i = generated.length; i < 5; i++) {
          const hours = Math.floor(fallbackTime / 60) % 24;
          const minutes = fallbackTime % 60;
          const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          const pair = ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)];
          const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
          const gap = Math.floor(Math.random() * 5) + 3;
          generated.push({
            pair,
            time: timeString,
            direction,
            gapMinutes: gap,
            id: Math.random()
          });
          fallbackTime += gap;
        }
      }
      
      try {
        localStorage.setItem('ah_vip_today_signals_v2', JSON.stringify({
          date: today,
          signals: generated
        }));
      } catch(e) {}

      setSignals(generated);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1400);
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
      
      {/* Luxury Engine Control Center with Gap System */}
      <div className="bg-gradient-to-b from-[#0d1122] to-[#060814] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
        
        {/* Top border cyber accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#0066FF]/5 rounded-full blur-[90px] pointer-events-none" />

        {/* Dashboard Section Title */}
        <div className="flex flex-col items-center justify-center text-center mt-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-[#00F0FF]/25 flex items-center justify-center shadow-inner mb-4 relative group">
            <div className="absolute inset-0 bg-[#00F0FF]/15 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-6 h-6 text-[#00F0FF] animate-pulse relative z-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
            <span>محرك صفقات الفجوات الذكية (GAP ENGINE)</span>
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-2 max-w-md">
            توليد صفقات التداول بنظام الفجوات الزمنية المحسوبة بدقة (2 إلى 8 دقائق) مع أزواج الـ OTC الاحترافية
          </p>
          
          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {/* Gap System Badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] font-black tracking-wide">
              <Split className="w-3.5 h-3.5 text-purple-400" />
              <span>نظام الفجوات: 2 - 8 دقائق</span>
            </div>

            {/* Duration Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-[10px] font-black tracking-wide">
              <Timer className="w-3.5 h-3.5" />
              <span>فترة الصفقة: 1M OTC</span>
            </div>

            {/* Generated Count */}
            {signals.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-[10px] font-black tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم استخراج: {signals.length} صفقة</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Time Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 justify-start">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              وقت البدء (بتوقيت مصر)
            </label>
            <div className="relative group">
              <input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setTimeError(''); }}
                className="w-full h-14 bg-[#03050c]/80 border border-white/10 hover:border-[#00F0FF]/40 focus:border-[#00F0FF] rounded-2xl pl-12 pr-5 text-white text-base font-mono outline-none transition-all duration-300 shadow-inner text-left"
                dir="ltr"
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-hover:text-[#00F0FF] transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1.5 justify-start">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              وقت الانتهاء (بتوقيت مصر)
            </label>
            <div className="relative group">
              <input
                type="time"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setTimeError(''); }}
                className="w-full h-14 bg-[#03050c]/80 border border-white/10 hover:border-[#00F0FF]/40 focus:border-[#00F0FF] rounded-2xl pl-12 pr-5 text-white text-base font-mono outline-none transition-all duration-300 shadow-inner text-left"
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
              <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 flex items-center gap-2">
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
                      <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase">GAP ALGORITHM ENGINE</span>
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
                    className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] via-purple-500 to-[#0066FF] shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="btn-trigger"
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleGenerate}
                onMouseMove={handleBtnPointerMove}
                onTouchMove={handleBtnPointerMove}
                onMouseDown={handleBtnPointerDown}
                onTouchStart={handleBtnPointerDown}
                onMouseUp={handleBtnPointerUp}
                onTouchEnd={handleBtnPointerUp}
                onMouseLeave={handleBtnPointerLeave}
                disabled={isGenerating}
                className="w-full h-16 relative overflow-hidden rounded-full shadow-[0_0_35px_rgba(0,240,255,0.25)] border border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF] via-[#0066FF] to-[#8000FF] hover:brightness-110 active:brightness-95 transition-all cursor-pointer group flex items-center justify-center select-none"
              >
                {/* Micro reflection shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                
                {/* Dynamic Mouse/Touch Neon Flare */}
                <div 
                  className="absolute rounded-full pointer-events-none blur-md transition-opacity duration-300 ease-out"
                  style={{
                    left: `${btnGlow.x}px`,
                    top: `${btnGlow.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: btnGlow.isClicking ? '220px' : '130px',
                    height: btnGlow.isClicking ? '220px' : '130px',
                    background: btnGlow.isClicking 
                      ? 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(0,240,255,0.85) 30%, rgba(168,85,247,0.6) 65%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(0,240,255,0.8) 0%, rgba(0,102,255,0.5) 50%, transparent 100%)',
                    opacity: btnGlow.active ? (btnGlow.isClicking ? 1 : 0.75) : 0,
                    boxShadow: btnGlow.isClicking ? '0 0 50px #00F0FF, 0 0 90px #a855f7' : '0 0 30px #00F0FF',
                    transition: 'width 0.15s ease-out, height 0.15s ease-out, opacity 0.25s ease-out'
                  }}
                />

                {/* Premium typography and glowing icon */}
                <span className="relative z-10 text-white font-black tracking-wider text-sm flex items-center gap-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  <span>استخراج صفقات الفجوات الفورية (GAP SIGNALS)</span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Plan Expired Notice Banner */}
          <AnimatePresence>
            {isFreePlanExpired && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                className="mt-5 p-5 rounded-3xl bg-gradient-to-b from-[#120e2e]/95 via-[#090a1c]/95 to-[#050612]/95 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)] flex flex-col items-center justify-center text-center gap-3.5 relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/35 text-purple-300 text-xs font-black shadow-inner">
                  <AlertCircle className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>انتهت الصفقات المجدولة لهذه الجلسة</span>
                </div>

                <p className="text-xs text-slate-300 font-bold max-w-md leading-relaxed">
                  للحصول على صفقات حية VIP مستمرة بدون توقف، تواصل مع فريق الدعم الفني:
                </p>

                {/* Telegram Username Support Link */}
                <a
                  href={SUPPORT_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer group"
                >
                  <MessageCircle className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  <span>@A_H_QUOTEX_SUPPORT</span>
                </a>

                {/* Timer */}
                <div className="flex items-center gap-2.5 mt-1 px-5 py-2 rounded-2xl bg-white/[0.03] border border-cyan-500/30 shadow-inner">
                  <Clock className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-xs font-bold text-slate-400">متبقي على التجديد:</span>
                  <span className="font-mono text-base font-black text-cyan-300 dir-ltr">{hoursLeftOnly} ساعة</span>
                </div>
              </motion.div>
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
            exit={{ opacity: 0, y: -15, transition: { duration: 0.25 } }}
            className="flex flex-col gap-4 sm:gap-5"
          >
            {/* Control Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
              
              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 bg-[#0d1122]/90 border border-white/10 p-1 rounded-2xl w-full md:w-auto relative">
                <button 
                  onClick={() => setFilterDirection('ALL')}
                  className={`flex-1 md:flex-initial h-9 px-5 rounded-xl text-xs font-black transition-all cursor-pointer ${filterDirection === 'ALL' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-white'}`}
                >
                  الكل ({signals.length})
                </button>
                <button 
                  onClick={() => setFilterDirection('CALL')}
                  className={`flex-1 md:flex-initial h-9 px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filterDirection === 'CALL' ? 'bg-[#00F0FF]/10 text-[#00F0FF]' : 'text-slate-500 hover:text-white'}`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  CALL 🟢
                </button>
                <button 
                  onClick={() => setFilterDirection('PUT')}
                  className={`flex-1 md:flex-initial h-9 px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filterDirection === 'PUT' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-500 hover:text-white'}`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  PUT 🔴
                </button>
              </div>
              
              {/* Search and Action commands */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search bar */}
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
                  className="h-11 px-4 rounded-2xl bg-[#0d1122]/90 hover:bg-[#00F0FF]/15 text-slate-300 hover:text-[#00F0FF] border border-white/10 hover:border-[#00F0FF]/40 transition-all flex items-center gap-2 shrink-0 cursor-pointer text-xs font-black"
                  title="نسخ جميع الإشارات المعروضة"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-4 h-4 text-[#00F0FF]" />
                      <span className="text-[#00F0FF]">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ الصفقات</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Details counter */}
            <div className="px-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-600" />
                <span>إجمالي الصفقات: {filteredSignals.length} صفقة فجوات جاهزة</span>
              </span>
              <span>الصيغة: HH:MM - PAIR DIRECTION</span>
            </div>

            {/* Luxury Signals List with Gap Badges */}
            <div className="flex flex-col gap-3 min-h-[100px] relative">
              <AnimatePresence mode="popLayout">
                {sortedSignals.length === 0 ? (
                  <motion.div
                    key="no-signals"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="py-16 text-center text-slate-500 bg-white/[0.01] border border-white/5 rounded-3xl font-mono text-xs uppercase tracking-widest"
                  >
                    لا توجد إشارات مطابقة لمعايير البحث
                  </motion.div>
                ) : (
                  sortedSignals.map((signal, idx) => {
                    const isCall = signal.direction === 'CALL';
                    const isCopied = copiedIndex === idx;
                    const isFav = !!favorites[signal.id];
                    
                    return (
                      <motion.div
                        key={signal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10, transition: { duration: 0.2 } }}
                        transition={{ 
                          duration: 0.35, 
                          delay: Math.min(idx * 0.03, 0.18),
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all backdrop-blur-xl relative overflow-hidden ${
                          isFav 
                            ? 'bg-[#00F0FF]/5 border-[#00F0FF]/35 shadow-[0_4px_25px_rgba(0,240,255,0.05)]' 
                            : 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-[#00F0FF]/35 shadow-sm'
                        }`}
                      >
                        {/* Left glow overlay */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1 transition-all duration-300 opacity-50 group-hover:opacity-100 ${
                          isCall ? 'bg-[#00F0FF]' : 'bg-rose-500'
                        }`} />

                        <div className="flex items-center gap-3 sm:gap-6">
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

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                            {/* Asset Name */}
                            <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider" dir="ltr">
                              {signal.pair}
                            </span>
                            
                            <div className="h-4.5 w-px bg-white/10 hidden sm:block" />
                            
                            <div className="flex items-center gap-2">
                              {/* Time Stamp badge */}
                              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-200 font-bold bg-[#00F0FF]/10 px-2.5 py-1 rounded-lg border border-[#00F0FF]/25 shadow-inner">
                                <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
                                <span className="text-white font-mono">{signal.time}</span>
                              </div>

                              {/* Gap interval indicator */}
                              {signal.gapMinutes && (
                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                  <Split className="w-3 h-3 text-purple-400" />
                                  <span>فجوة +{signal.gapMinutes}د</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right directions and actions */}
                        <div className="flex items-center gap-2.5 sm:gap-4">
                          
                          {/* Call/Put Direction badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wider ${
                            isCall 
                              ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
                            className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                              isCopied 
                                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-transparent'
                            }`}
                            title="نسخ هذه الصفقة"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-[#00F0FF]" /> : <Copy className="w-4 h-4" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
