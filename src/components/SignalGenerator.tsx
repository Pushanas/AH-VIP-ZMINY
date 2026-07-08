import { motion, AnimatePresence } from "motion/react";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.032-2.766-.86c-.604-.19-.617-.604.126-.894l10.816-4.172c.504-.19.95.122.82.855z" />
  </svg>
);

import { useState, useEffect } from 'react';
import { ASSET_PAIRS, DIRECTIONS, Signal } from '../types';
import { copyToClipboard } from '../utils';
import { 
  TrendingUp, TrendingDown, Clock, Sparkles, Copy, Check, 
  Search, RefreshCw, KeyRound, ExternalLink, HelpCircle,
  ChevronDown, AlertTriangle
} from 'lucide-react';

// Helper to get current Egypt time parts for defaults
const getEgyptTimeInit = () => {
  try {
    const egyptTimeStr = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'Africa/Cairo', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    const match = egyptTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      const startH = match[1];
      const startM = String(Math.floor(parseInt(match[2]) / 5) * 5).padStart(2, '0');
      const startAp = match[3].toUpperCase() as 'AM' | 'PM';

      // Compute end time (1 hour later)
      let endHNum = parseInt(startH) + 1;
      let endAp = startAp;
      if (endHNum === 12) {
        endAp = startAp === 'AM' ? 'PM' : 'AM';
      } else if (endHNum > 12) {
        endHNum = endHNum - 12;
      }
      const endH = String(endHNum).padStart(2, '0');

      return {
        start: { hour: startH, minute: startM, ampm: startAp },
        end: { hour: endH, minute: startM, ampm: endAp }
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    start: { hour: '09', minute: '00', ampm: 'AM' as const },
    end: { hour: '10', minute: '00', ampm: 'AM' as const }
  };
};

const initialTimes = getEgyptTimeInit();

// Helper to map letters and digits to stylized mathematical monospace unicode blocks
const stylizeText = (text: string): string => {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    // Uppercase A-Z: 65 to 90 -> Math Sans-Serif Monospace A-Z (Starts at 0x1D670)
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(0x1D670 + (code - 65));
    }
    // Lowercase a-z: 97 to 122 -> Math Sans-Serif Monospace a-z (Starts at 0x1D68A)
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(0x1D68A + (code - 97));
    }
    // Digits 0-9: 48 to 57 -> Math Sans-Serif Monospace 0-9 (Starts at 0x1D7F6)
    if (code >= 48 && code <= 57) {
      return String.fromCodePoint(0x1D7F6 + (code - 48));
    }
    return char;
  }).join('');
};


const parseTimeStrToMinutes = (timeStr: string) => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (h === 12) h = ampm === 'AM' ? 0 : 12;
  else if (ampm === 'PM') h += 12;
  return h * 60 + m;
};

const getEgyptCurrentMinutes = () => {
  const egyptTimeStr = new Date().toLocaleTimeString('en-US', { 
     timeZone: 'Africa/Cairo', 
     hour: '2-digit', 
     minute: '2-digit', 
     hour12: true 
   });
   return parseTimeStrToMinutes(egyptTimeStr);
};

const getEgyptDateString = () => {
  return new Date().toLocaleDateString('en-US', { timeZone: 'Africa/Cairo' });
};

interface SignalGeneratorProps {
  lang: "ar" | "en";
}
export default function SignalGenerator({ lang }: SignalGeneratorProps) {
  // Setup default start and end hours/minutes based on Egypt Time
  const [startHour, setStartHour] = useState(initialTimes.start.hour);
  const [startMinute, setStartMinute] = useState(initialTimes.start.minute);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>(initialTimes.start.ampm);

  const [endHour, setEndHour] = useState(initialTimes.end.hour);
  const [endMinute, setEndMinute] = useState(initialTimes.end.minute);
  const [endAmPm, setEndAmPm] = useState<'AM' | 'PM'>(initialTimes.end.ampm);

  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const saved = localStorage.getItem('ah_vip_daily_session');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const today = getEgyptDateString();
          if (data.date === today) {
            setSignals(data.signals);
            if (data.signals && data.signals.length > 0) {
              const lastSignal = data.signals[data.signals.length - 1];
              const lastSignalMinutes = parseTimeStrToMinutes(lastSignal.time);
              const currentMinutes = getEgyptCurrentMinutes();
              if (currentMinutes > lastSignalMinutes) {
                setIsExpired(true);
              }
            }
          }
        } catch(e) {}
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, []);


  const t = {
    ar: {
      title: 'مولّد إشارات AH VIP',
      sub: 'نظام ذكاء اصطناعي متطور لتوليد صفقات الخيارات الثنائية فائقة الدقة',
      startTime: 'وقت البداية',
      endTime: 'وقت النهاية',
      genBtn: 'توليد إشارات VIP الحصرية',
      generating: 'جاري الحساب وتحليل السوق...',
      activeCode: 'الرمز النشط الحصري:',
      logoutBtn: 'قفل الجلسة الخروج',
      emptySignals: 'اضبط مواقيت البداية والنهاية ثم انقر على توليد الإشارات.',
      copyAll: 'نسخ منشور تليجرام بالكامل 📋',
      copiedAll: 'تم نسخ المنشور بنجاح! 🎉',
      searchPlaceholder: 'تصفية حسب الزوج أو الاتجاه...',
      tableTime: 'التوقيت',
      tableAsset: 'زوج العملات (OTC)',
      tableDirection: 'الاتجاه / الحركة',
      call: 'شراء / صعود CALL',
      put: 'بيع / هبوط PUT',
      copySingle: 'نسخ الإشارة',
      footerText: 'نظام إشارات AH VIP الفاخر | جميع الحقوق محفوظة',
      telegramSupport: 'قناة التليجرام الرسمية للأدمن',
      howItWorks: 'يتم توليد صفقات دورية بفواصل زمنية عشوائية مدروسة (من 2 إلى 9 دقائق) لتحقيق أعلى درجات الأمان وإدارة المخاطر.',
      errorTime: 'يرجى اختيار وقت نهاية لاحق لوقت البداية.'
    },
    en: {
      title: 'AH VIP Signals Machine',
      sub: 'Advanced neural system generating premium precision binary options signals',
      startTime: 'Start Frame Time',
      endTime: 'End Frame Time',
      genBtn: 'Generate Exclusive Signals',
      generating: 'Scanning & computing market indices...',
      activeCode: 'Exclusive Session Key:',
      logoutBtn: 'Lock & Expire Session',
      emptySignals: 'Configure your start & end timeframe to calculate premium predictions.',
      copyAll: 'Copy Full Telegram Post 📋',
      copiedAll: 'Telegram Post Copied! 🎉',
      searchPlaceholder: 'Filter by asset or call/put...',
      tableTime: 'Trigger Time',
      tableAsset: 'Asset Pair (OTC Indexed)',
      tableDirection: 'Directional Target',
      call: 'CALL / BUY',
      put: 'PUT / SELL',
      copySingle: 'Copy Signal',
      footerText: 'AH VIP Premium Signals Generator | All Rights Reserved',
      telegramSupport: 'Official Telegram Channel',
      howItWorks: 'Signals are distributed periodically at randomized strict ranges (2 to 9 min) to simulate organic premium trades.',
      errorTime: 'End time must be chronological to the start time.'
    }
  };

  const currentT = t[lang];

  const CustomSelect = ({ value, onChange, options, label, colorClass = "brand-primary" }: any) => {
    const borderColorHover = colorClass === "brand-accent" ? "hover:border-brand-accent/50" : "hover:border-brand-primary/50";
    const borderColorFocus = colorClass === "brand-accent" ? "focus:border-brand-accent" : "focus:border-brand-primary";
    const shadowFocus = colorClass === "brand-accent" ? "focus:shadow-[0_0_15px_rgba(255,47,146,0.25)]" : "focus:shadow-[0_0_15px_rgba(36,232,255,0.25)]";
    const textGroupHover = colorClass === "brand-accent" ? "group-hover:text-brand-accent" : "group-hover:text-brand-primary";
    const borderBase = colorClass === "brand-accent" ? "border-brand-accent/20" : "border-brand-primary/20";
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="relative group w-full">
          <select
            value={value}
            onChange={onChange}
            className={`w-full appearance-none bg-brand-bg/60 border ${borderBase} ${borderColorHover} ${borderColorFocus} rounded-[16px] py-3 pl-4 pr-8 text-center text-sm font-mono font-bold cursor-pointer transition-all duration-300 text-white focus:outline-none shadow-sm ${shadowFocus} group-hover:bg-brand-bg/80`}
          >
            {options.map((opt: any) => (
              <option key={opt.value} value={opt.value} className="bg-brand-card text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 ${textGroupHover} transition-colors`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <span className="text-[10px] text-gray-400 font-sans px-1 font-semibold text-center transition-colors group-hover:text-gray-300">{label}</span>
      </div>
    );
  };

  // Convert hours/minutes/AM-PM to total minutes from midnight
  const getMinutesFromMidnight = (hourStr: string, minStr: string, amPm: 'AM' | 'PM') => {
    let h = parseInt(hourStr);
    const m = parseInt(minStr);
    
    if (amPm === 'PM' && h !== 12) h += 12;
    if (amPm === 'AM' && h === 12) h = 0;
    
    return h * 60 + m;
  };

  // Convert minutes from midnight to HH:MM AM/PM string
  const formatMinutesTo12Hour = (totalMinutes: number) => {
    let hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes} ${suffix}`;
  };

  const handleGenerate = () => {
    setTimeError(null);
    const startTimeMinutes = getMinutesFromMidnight(startHour, startMinute, startAmPm);
    let endTimeMinutes = getMinutesFromMidnight(endHour, endMinute, endAmPm);

    if (startTimeMinutes === endTimeMinutes) {
      setTimeError(currentT.errorTime);
      return;
    }

    setIsGenerating(true);
    setSignals([]);

    setTimeout(() => {
      const saved = localStorage.getItem('ah_vip_daily_session');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const today = getEgyptDateString();
          if (data.date === today && data.signals && data.signals.length > 0) {
            setSignals(data.signals);
            setIsGenerating(false);
            return;
          }
        } catch(e) {}
      }

      // If end time is less than start time, assume next day
      if (endTimeMinutes < startTimeMinutes) {
        endTimeMinutes += 24 * 60; // 24 hours rollover
      }

      if (endTimeMinutes - startTimeMinutes > 6 * 60) {
         setTimeError(lang === 'ar' ? 'المدة أطول من اللازم. أقصى مدة هي 6 ساعات لضمان الجودة.' : 'Duration too long. Max duration is 6 hours for optimal quality.');
         setIsGenerating(false);
         return;
      }

      const generated: Signal[] = [];
      const duration = endTimeMinutes - startTimeMinutes;
      const maxSignals = 10;
      let currentTime = startTimeMinutes + 3;
      
      const avgGap = Math.max(3, Math.floor(duration / maxSignals));

      for (let i = 0; i < maxSignals && currentTime < endTimeMinutes; i++) {
        const timeStr = formatMinutesTo12Hour(currentTime);
        const randomPair = ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)];
        const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

        generated.push({
          time: timeStr,
          pair: randomPair,
          direction: randomDir
        });

        const randomMinutesToAdd = avgGap + Math.floor(Math.random() * 5) - 2;
        currentTime += randomMinutesToAdd;
      }

      
      const sessionData = {
        date: getEgyptDateString(),
        signals: generated
      };
      localStorage.setItem('ah_vip_daily_session', JSON.stringify(sessionData));
      
      setSignals(generated);
      setIsGenerating(false);
    }, 1200);
  };

  const handleCopySingle = (signal: Signal, index: number) => {
    const formattedDir = signal.direction === 'CALL' ? 'BUY' : 'SELL';
    const rawText = `${signal.time} - ${signal.pair} - ${formattedDir}`;
    const styledText = `⧉ ${stylizeText(rawText)}`;
    copyToClipboard(styledText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    if (signals.length === 0) return;
    
    const isArabic = lang === 'ar';
    const intro = isArabic 
      ? ` AH— إشارات التداول\n⏰ التوقيت: gmt +3\n\n⚠️ تذكير قبل الدخول:\n• مضاعفة عند الخسارة مرة واحدة فقط\n• لا تعكس الترند\n• تجنب الدوجي\n• دخولك مارجينال سيفتي\n• لا تدخل عند الراوند 00\n• سمّ الله · والالتزام أهم شيء\n\n`
      : ` AH— Trading Signals\n⏰ Timeframe: GMT +3\n\n⚠️ Quick Reminders:\n• Martingale after loss once only\n• Never trade against the trend\n• Avoid Doji candles\n• Use Marginal Safety entry\n• Avoid entering at round numbers .00\n• Rely on Discipline above all\n\n`;
    
    const signalLines = signals.map(s => {
      const formattedDir = s.direction === 'CALL' ? 'BUY' : 'SELL';
      const rawText = `${s.time} - ${s.pair} - ${formattedDir}`;
      return `⧉ ${stylizeText(rawText)}`;
    }).join('\n');
    
    copyToClipboard(intro + signalLines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredSignals = signals.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.pair.toLowerCase().includes(q) || s.direction.toLowerCase().includes(q);
  });


  if (isExpired) {
    return (
      <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale: 1}} transition={{duration:0.5}} className="w-full bg-brand-card/90 backdrop-blur-2xl border border-red-500/30 rounded-[24px] p-8 shadow-2xl relative shadow-red-500/10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 cyber-grid opacity-[0.05] pointer-events-none rounded-[24px]" />
        <AlertTriangle className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
          {lang === 'ar' ? 'انتهت تجربتك المجانية' : 'Free Trial Ended'}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mb-8 font-medium leading-relaxed max-w-md mx-auto">
          {lang === 'ar' 
            ? 'لقد انتهت صفقاتك اليومية بالكامل. يرجى الانتظار 24 ساعة للحصول على صفقات جديدة، أو انضم لقناة الـ VIP للوصول غير المحدود.' 
            : 'Your daily signals have concluded. Please wait 24 hours for new signals, or join the VIP channel for unlimited access.'}
        </p>
        <div className="flex flex-col items-center gap-4 w-full">
          <a 
            href="https://t.me/AH_QUOTEX" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto px-10 py-4 rounded-[20px] bg-gradient-to-r from-[#229ED9] to-[#1b80b0] hover:brightness-110 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,158,217,0.4)] hover:shadow-[0_0_30px_rgba(34,158,217,0.6)] transform hover:-translate-y-1 active:scale-95"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="tracking-wide">{lang === 'ar' ? 'الانضمام لقناة VIP' : 'Join VIP Channel'}</span>
          </a>
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 font-medium">
              {lang === 'ar' ? 'للدعم الفني 24 ساعة:' : '24/7 Technical Support:'}
            </span>
            <div className="flex items-center justify-center gap-3">
              <a 
                href="http://t.me/PartnerMALKY" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[12px] py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold transition-all duration-300 cursor-pointer"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>انس بيك</span>
              </a>
              <a 
                href="http://t.me/ZOMA_VIP074" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[12px] py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold transition-all duration-300 cursor-pointer"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>حازم بيك</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full flex flex-col gap-8">
{/* 5. Config card */}
      <div className="w-full bg-brand-card/85 backdrop-blur-xl border border-brand-primary/25 rounded-[24px] p-7 shadow-2xl relative shadow-brand-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
          <h2 className="text-md font-extrabold text-white font-sans tracking-tight">AH VIP SIGNAL</h2>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-px bg-white/10 mb-6" />

        <div className="space-y-6">
          {/* Start time section */}
          <div className="p-5 rounded-[20px] bg-brand-bg/40 border border-brand-primary/10 hover:border-brand-primary/25 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-black text-white font-sans flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform shadow-md shadow-brand-primary/5">
                    <Clock className="w-4 h-4" />
                  </div>
                  {currentT.startTime}
                </label>
                <p className="text-[10px] text-gray-400 font-sans ml-9">
                  {lang === 'ar' ? 'حدد وقت بدء الجلسة لتوليد الإشارات' : 'Define the starting time for the signal session'}
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-brand-primary/80 px-2 py-1 bg-brand-primary/5 rounded-md border border-brand-primary/10 uppercase tracking-widest mt-1">
                Start_Frame
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <CustomSelect
                value={startHour}
                onChange={(e: any) => setStartHour(e.target.value)}
                options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') }))}
                label={lang === 'ar' ? 'الساعة' : 'Hour'}
                colorClass="brand-primary"
              />
              <CustomSelect
                value={startMinute}
                onChange={(e: any) => setStartMinute(e.target.value)}
                options={Array.from({ length: 12 }, (_, i) => ({ value: String(i * 5).padStart(2, '0'), label: String(i * 5).padStart(2, '0') }))}
                label={lang === 'ar' ? 'الدقيقة' : 'Minute'}
                colorClass="brand-primary"
              />
              <CustomSelect
                value={startAmPm}
                onChange={(e: any) => setStartAmPm(e.target.value)}
                options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
                label={lang === 'ar' ? 'صباحاً/مساءً' : 'AM/PM'}
                colorClass="brand-primary"
              />
            </div>
          </div>

          {/* End time section */}
          <div className="p-5 rounded-[20px] bg-brand-bg/40 border border-brand-accent/10 hover:border-brand-accent/25 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-black text-white font-sans flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-accent/10 text-brand-accent group-hover:scale-110 transition-transform shadow-md shadow-brand-accent/5">
                    <Clock className="w-4 h-4" />
                  </div>
                  {currentT.endTime}
                </label>
                <p className="text-[10px] text-gray-400 font-sans ml-9">
                  {lang === 'ar' ? 'حدد وقت انتهاء الجلسة (أقصى مدة 6 ساعات)' : 'Define the ending time (Max duration 6 hours)'}
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-brand-accent/80 px-2 py-1 bg-brand-accent/5 rounded-md border border-brand-accent/10 uppercase tracking-widest mt-1">
                End_Frame
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <CustomSelect
                value={endHour}
                onChange={(e: any) => setEndHour(e.target.value)}
                options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1).padStart(2, '0') }))}
                label={lang === 'ar' ? 'الساعة' : 'Hour'}
                colorClass="brand-accent"
              />
              <CustomSelect
                value={endMinute}
                onChange={(e: any) => setEndMinute(e.target.value)}
                options={Array.from({ length: 12 }, (_, i) => ({ value: String(i * 5).padStart(2, '0'), label: String(i * 5).padStart(2, '0') }))}
                label={lang === 'ar' ? 'الدقيقة' : 'Minute'}
                colorClass="brand-accent"
              />
              <CustomSelect
                value={endAmPm}
                onChange={(e: any) => setEndAmPm(e.target.value)}
                options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
                label={lang === 'ar' ? 'صباحاً/مساءً' : 'AM/PM'}
                colorClass="brand-accent"
              />
            </div>
          </div>

          {/* Validation Error */}
          {timeError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-[16px] bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{timeError}</p>
            </div>
          )}

          {/* Main CTA button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4.5 mt-4 rounded-[20px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:brightness-110 text-white font-black transition-all duration-300 cursor-pointer text-sm shadow-[0_0_20px_rgba(36,232,255,0.2)] hover:shadow-[0_0_30px_rgba(36,232,255,0.5)] border border-brand-primary/40 flex items-center justify-center gap-2.5 overflow-hidden relative"
          >
            <div className="absolute inset-0 w-full h-full metallic-shine pointer-events-none opacity-50" />

            {isGenerating ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span className="text-xs font-sans font-semibold">{currentT.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <span>{currentT.genBtn}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      {/* 6. Output/result card */}
      <div className="w-full bg-brand-card/85 backdrop-blur-xl border border-brand-primary/25 rounded-[24px] p-6 shadow-2xl min-h-[220px] flex flex-col justify-center shadow-brand-primary/5">
        {isGenerating ? (
          <div className="flex flex-col gap-4 py-4 w-full">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`w-full h-16 rounded-[20px] bg-white/5 animate-skeleton border border-white/5 opacity-${100 - i * 20}`} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
            <div className="flex flex-col items-center justify-center pt-2">
              <RefreshCw className="w-5 h-5 text-brand-primary animate-spin mb-2 shadow-[0_0_15px_rgba(36,232,255,0.2)] rounded-full" />
              <p className="text-gray-400 text-[10px] font-sans font-medium">{currentT.generating}</p>
            </div>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in">
            <Clock className="w-14 h-14 text-brand-primary opacity-25 mb-4" />
            <p className="text-gray-400 text-xs max-w-xs font-sans leading-relaxed px-5">
              {currentT.emptySignals}
            </p>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Search and Copy All Header inside results */}
            <div className="flex flex-col gap-3 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="relative w-full sm:max-w-[240px]">
                  <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentT.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-bg/90 border border-brand-primary/25 hover:border-brand-primary/50 focus:border-brand-primary rounded-[20px] py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                  />
                </div>

                <button
                  onClick={handleCopyAll}
                  className="w-full sm:w-auto px-6 py-3 rounded-[20px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:brightness-110 text-white shadow-xl hover:shadow-[0_0_20px_rgba(36,232,255,0.35)] text-xs font-black transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 transform hover:-translate-y-1 active:scale-[0.98] border border-white/10"
                >
                  <span className="bg-black/35 text-brand-primary px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest border border-brand-primary/20">AH VIP</span>
                  {copiedAll ? <Check className="w-4 h-4 text-emerald-300 shrink-0 animate-bounce" /> : <Copy className="w-4 h-4 text-white shrink-0" />}
                  <span>{copiedAll ? currentT.copiedAll : currentT.copyAll}</span>
                </button>
              </div>
            </div>

            {/* List of beautifully spaced individual signal card rows */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredSignals.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8 font-semibold animate-fade-in">
                  {lang === 'ar' ? 'لم يعثر على نتائج مطابقة لفلتر البحث.' : 'No matched search filters.'}
                </p>
              ) : (
                filteredSignals.map((signal, idx) => {
                  const isCall = signal.direction === 'CALL';
                  const isCopied = copiedIndex === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5), type: 'spring', bounce: 0.4 }}
                      className="flex items-center justify-between gap-3 p-4 rounded-[20px] bg-brand-bg/80 border border-brand-primary/20 hover:border-brand-primary/50 shadow-sm hover:shadow-[0_0_20px_rgba(36,232,255,0.25)] hover:bg-brand-bg/95 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Decorative ⧉ symbol for realism */}
                        <span className="text-brand-primary/40 text-sm select-none">⧉</span>

                        {/* Time tag */}
                        <span className="font-mono text-xs font-black text-white bg-white/5 px-3 py-1.5 rounded-[20px] border border-white/5">
                          {stylizeText(signal.time)}
                        </span>
                        
                        {/* Asset name */}
                        <span className="font-mono text-sm font-extrabold text-[#94a3b8] tracking-wide">
                          {stylizeText(signal.pair)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Call/Put Direction badge */}
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[20px] text-[10px] font-black tracking-wide ${
                          isCall
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                        }`}>
                          {isCall ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isCall ? currentT.call : currentT.put}
                        </span>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopySingle(signal, idx)}
                          className="p-2 rounded-[20px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-brand-primary transition-all cursor-pointer border border-white/10 transform active:scale-[0.92]"
                          title={currentT.copySingle}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-brand-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 7. Telegram official channel button */}
      <div className="w-full mt-4">
        <a 
          href="https://t.me/AH_QUOTEX" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full border border-brand-primary/30 hover:border-brand-primary text-brand-primary hover:bg-brand-primary/10 rounded-[20px] py-4 px-5 flex items-center justify-center gap-2 text-xs font-extrabold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(36,232,255,0.2)] cursor-pointer transform hover:-translate-y-1 active:scale-[0.98]"
        >
          <ExternalLink className="w-4 h-4 text-brand-primary" />
          <span>{lang === 'ar' ? 'قناة التليجرام الرسمية للأدمن: @AH_QUOTEX' : 'Official Admin Telegram Channel: @AH_QUOTEX'}</span>
        </a>
      </div>
    </motion.div>
  );
}
