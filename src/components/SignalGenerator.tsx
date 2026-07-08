import { useState } from 'react';
import { ASSET_PAIRS, DIRECTIONS, Signal, VipCode } from '../types';
import { copyToClipboard } from '../utils';
import { 
  TrendingUp, TrendingDown, Clock, Sparkles, Copy, Check, 
  Search, RefreshCw, KeyRound, ExternalLink, HelpCircle
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

interface SignalGeneratorProps {
  activatedCode: string;
  onLockSession: () => void;
  lang: 'ar' | 'en';
  codes: VipCode[];
}

export default function SignalGenerator({ activatedCode, onLockSession, lang, codes }: SignalGeneratorProps) {
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
    setIsGenerating(true);
    setSignals([]);

    setTimeout(() => {
      const startTimeMinutes = getMinutesFromMidnight(startHour, startMinute, startAmPm);
      let endTimeMinutes = getMinutesFromMidnight(endHour, endMinute, endAmPm);

      // If end time is less than start time, assume next day or alert error
      if (endTimeMinutes <= startTimeMinutes) {
        // Automatically append 12 hours or alert
        endTimeMinutes += 12 * 60; // assume rollover
      }

      const generated: Signal[] = [];
      let currentTime = startTimeMinutes + 3; // start 3 minutes in

      while (currentTime < endTimeMinutes) {
        const timeStr = formatMinutesTo12Hour(currentTime);
        const randomPair = ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)];
        const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

        generated.push({
          time: timeStr,
          pair: randomPair,
          direction: randomDir
        });

        // Add a random gap of 3 to 8 minutes as described
        const randomMinutesToAdd = Math.floor(Math.random() * 6) + 3;
        currentTime += randomMinutesToAdd;
      }

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

  const codeInfo = codes.find(c => c.code.toUpperCase() === activatedCode.toUpperCase());
  let remainingHours: number | null = null;
  if (codeInfo?.expiresAt) {
    const diffMs = new Date(codeInfo.expiresAt).getTime() - Date.now();
    remainingHours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 4. Activation card */}
      <div className="w-full bg-[#0c1023]/80 border border-brand-teal/20 rounded-[24px] p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand-teal shrink-0" />
            <span className="text-xs text-gray-300 font-sans font-medium">
              {currentT.activeCode}
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-brand-teal select-all bg-brand-teal/10 border border-brand-teal/20 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider">
                {activatedCode}
              </span>
              {remainingHours !== null && (
                <span className="font-sans text-[11px] bg-brand-fuchsia/10 text-brand-fuchsia px-3 py-1 rounded-full border border-brand-fuchsia/20 font-extrabold">
                  {lang === 'ar' ? `متبقي: ${remainingHours} ساعة` : `Expires in: ${remainingHours} hrs`}
                </span>
              )}
            </div>

            <button
              onClick={onLockSession}
              className="px-4 py-2 rounded-xl border border-brand-fuchsia/30 hover:border-brand-fuchsia text-brand-fuchsia hover:bg-brand-fuchsia/10 font-bold transition-all duration-300 cursor-pointer text-xs shrink-0"
            >
              {currentT.logoutBtn}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Config card */}
      <div className="w-full bg-[#0c1023]/80 border border-brand-teal/20 rounded-[24px] p-6 shadow-lg relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-brand-teal animate-pulse" />
          <h2 className="text-md font-extrabold text-white font-sans tracking-tight">AH VIP Config</h2>
        </div>
        
        {/* Divider line */}
        <div className="w-full h-px bg-white/10 mb-5" />

        <div className="space-y-5">
          {/* Start time section */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 font-sans flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-teal" />
              {currentT.startTime}
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="bg-[#070a18] border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal rounded-xl py-2 px-3 text-sm text-center font-mono cursor-pointer transition-all duration-300 text-white focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                  <option key={h} value={h} className="bg-[#0c1023] text-white">{h}</option>
                ))}
              </select>

              <select
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                className="bg-[#070a18] border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal rounded-xl py-2 px-3 text-sm text-center font-mono cursor-pointer transition-all duration-300 text-white focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')).map(m => (
                  <option key={m} value={m} className="bg-[#0c1023] text-white">{m}</option>
                ))}
              </select>

              <select
                value={startAmPm}
                onChange={(e) => setStartAmPm(e.target.value as any)}
                className="bg-[#070a18] border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal rounded-xl py-2 px-3 text-xs text-center font-sans font-bold cursor-pointer transition-all duration-300 text-white focus:outline-none"
              >
                <option value="AM" className="bg-[#0c1023] text-white">AM</option>
                <option value="PM" className="bg-[#0c1023] text-white">PM</option>
              </select>
            </div>
          </div>

          {/* End time section */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 font-sans flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-fuchsia" />
              {currentT.endTime}
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="bg-[#070a18] border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal rounded-xl py-2 px-3 text-sm text-center font-mono cursor-pointer transition-all duration-300 text-white focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                  <option key={h} value={h} className="bg-[#0c1023] text-white">{h}</option>
                ))}
              </select>

              <select
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
                className="bg-[#070a18] border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal rounded-xl py-2 px-3 text-sm text-center font-mono cursor-pointer transition-all duration-300 text-white focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')).map(m => (
                  <option key={m} value={m} className="bg-[#0c1023] text-white">{m}</option>
                ))}
              </select>

              <select
                value={endAmPm}
                onChange={(e) => setEndAmPm(e.target.value as any)}
                className="bg-[#070a18] border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal rounded-xl py-2 px-3 text-xs text-center font-sans font-bold cursor-pointer transition-all duration-300 text-white focus:outline-none"
              >
                <option value="AM" className="bg-[#0c1023] text-white">AM</option>
                <option value="PM" className="bg-[#0c1023] text-white">PM</option>
              </select>
            </div>
          </div>

          {/* Main CTA button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-brand-teal via-[#8B1E9A] to-brand-fuchsia hover:brightness-110 active:scale-[0.98] text-white font-extrabold transition-all duration-300 cursor-pointer text-sm shadow-md border border-brand-teal/30 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-xs font-sans font-semibold">{currentT.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{currentT.genBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6. Output/result card */}
      <div className="w-full bg-[#0c1023]/80 border border-brand-teal/20 rounded-[24px] p-5 shadow-lg min-h-[220px] flex flex-col justify-center">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <RefreshCw className="w-10 h-10 text-brand-teal animate-spin mb-3" />
            <p className="text-gray-400 text-xs font-sans font-medium">{currentT.generating}</p>
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Clock className="w-12 h-12 text-brand-teal opacity-25 mb-3" />
            <p className="text-gray-400 text-xs max-w-xs font-sans leading-relaxed px-4">
              {currentT.emptySignals}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Copy All Header inside results */}
            <div className="flex flex-col gap-2 pb-3 border-b border-white/5">
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative w-full sm:max-w-[240px]">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentT.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#070a18] border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <button
                  onClick={handleCopyAll}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal via-[#138C84] to-brand-fuchsia hover:brightness-110 text-white shadow-xl shadow-brand-teal/10 text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 transform active:scale-[0.98] border border-white/10"
                >
                  <span className="bg-black/35 text-brand-teal px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest border border-brand-teal/20">AH VIP</span>
                  {copiedAll ? <Check className="w-4 h-4 text-emerald-300 shrink-0 animate-bounce" /> : <Copy className="w-4 h-4 text-white shrink-0" />}
                  <span>{copiedAll ? currentT.copiedAll : currentT.copyAll}</span>
                </button>
              </div>
            </div>

            {/* List of beautifully spaced individual signal card rows */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredSignals.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">
                  {lang === 'ar' ? 'لم يعثر على نتائج مطابقة لفلتر البحث.' : 'No matched search filters.'}
                </p>
              ) : (
                filteredSignals.map((signal, idx) => {
                  const isCall = signal.direction === 'CALL';
                  const isCopied = copiedIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-[#070a18]/70 border border-white/5 hover:border-brand-teal/25 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {/* Decorative ⧉ symbol for realism */}
                        <span className="text-brand-teal/40 text-sm select-none">⧉</span>

                        {/* Time tag */}
                        <span className="font-mono text-xs font-black text-white bg-white/5 px-2.5 py-1 rounded-lg">
                          {stylizeText(signal.time)}
                        </span>
                        
                        {/* Asset name */}
                        <span className="font-mono text-sm font-extrabold text-[#94a3b8] tracking-wide">
                          {stylizeText(signal.pair)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Call/Put Direction badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide ${
                          isCall
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-brand-fuchsia/10 text-brand-fuchsia border border-brand-fuchsia/20'
                        }`}>
                          {isCall ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isCall ? currentT.call : currentT.put}
                        </span>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopySingle(signal, idx)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-brand-teal transition-all cursor-pointer border border-white/10"
                          title={currentT.copySingle}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-brand-teal" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 7. Telegram official channel button */}
      <div className="w-full mt-2">
        <a 
          href="https://t.me/AH_QUOTEX" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full border border-brand-teal/30 hover:border-brand-teal text-brand-teal hover:bg-brand-teal/10 rounded-[20px] py-3.5 px-4 flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 shadow-md cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-brand-teal" />
          <span>{lang === 'ar' ? 'قناة التليجرام الرسمية للأدمن: @AH_QUOTEX' : 'Official Admin Telegram Channel: @AH_QUOTEX'}</span>
        </a>
      </div>
    </div>
  );
}
