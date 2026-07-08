const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

// We will inject the new logic into SignalGenerator.tsx

// 1. Add parseTimeStrToMinutes function
const helperLogic = `
const parseTimeStrToMinutes = (timeStr: string) => {
  const match = timeStr.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
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
`;

content = content.replace(/interface SignalGeneratorProps/, helperLogic + "\ninterface SignalGeneratorProps");

// 2. Add isExpired state and useEffect
const stateHook = `
  const [isExpired, setIsExpired] = useState(false);

  // Check expiration and load saved signals
  import_useEffect_placeholder
`;

content = content.replace(/  const \[timeError, setTimeError\] = useState<string \| null>\(null\);/, 
  "  const [timeError, setTimeError] = useState<string | null>(null);\n  const [isExpired, setIsExpired] = useState(false);\n\n  useEffect(() => {\n    const checkSession = () => {\n      const saved = localStorage.getItem('ah_vip_daily_session');\n      if (saved) {\n        try {\n          const data = JSON.parse(saved);\n          const today = getEgyptDateString();\n          if (data.date === today) {\n            setSignals(data.signals);\n            if (data.signals && data.signals.length > 0) {\n              const lastSignal = data.signals[data.signals.length - 1];\n              const lastSignalMinutes = parseTimeStrToMinutes(lastSignal.time);\n              const currentMinutes = getEgyptCurrentMinutes();\n              if (currentMinutes > lastSignalMinutes) {\n                setIsExpired(true);\n              }\n            }\n          }\n        } catch(e) {}\n      }\n    };\n    checkSession();\n    const interval = setInterval(checkSession, 30000);\n    return () => clearInterval(interval);\n  }, []);\n"
);

// We need to make sure useEffect is imported.
content = content.replace(/import \{ useState \} from 'react';/, "import { useState, useEffect } from 'react';");


// 3. Update handleGenerate to check localStorage and save to localStorage
const oldHandleGenerate = `    setTimeout(() => {
      // If end time is less than start time, assume next day`;

const newHandleGenerate = `    setTimeout(() => {
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

      // If end time is less than start time, assume next day`;

content = content.replace(oldHandleGenerate, newHandleGenerate);

// 4. Save to localStorage inside handleGenerate
const oldSetSignals = `      setSignals(generated);
      setIsGenerating(false);
    }, 1200);`;

const newSetSignals = `      
      const sessionData = {
        date: getEgyptDateString(),
        signals: generated
      };
      localStorage.setItem('ah_vip_daily_session', JSON.stringify(sessionData));
      
      setSignals(generated);
      setIsGenerating(false);
    }, 1200);`;

content = content.replace(oldSetSignals, newSetSignals);

// 5. Render expiration view if isExpired is true
const oldReturn = `  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full flex flex-col gap-8">
      {/* 5. Config card */}`;

const newReturn = `  if (isExpired) {
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
        <a 
          href="https://t.me/AH_QUOTEX" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto px-8 py-4 rounded-[20px] bg-gradient-to-r from-[#229ED9] to-[#1b80b0] hover:brightness-110 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,158,217,0.4)] hover:shadow-[0_0_30px_rgba(34,158,217,0.6)] transform hover:-translate-y-1 active:scale-95"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="tracking-wide">{lang === 'ar' ? 'الانضمام لقناة VIP' : 'Join VIP Channel'}</span>
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full flex flex-col gap-8">
      {/* 5. Config card */}`;

content = content.replace(oldReturn, newReturn);

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
