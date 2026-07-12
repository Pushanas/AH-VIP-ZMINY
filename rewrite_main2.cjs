const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Lock, Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import SignalGenerator from './components/SignalGenerator';

export default function MainUserApp() {
  const [session, setSession] = useState<any>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/session')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setSession(data.session);
        if (data.serverNow) {
          setServerTimeOffset(new Date(data.serverNow).getTime() - Date.now());
        }
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' }).then(() => setSession(null));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030610] flex items-center justify-center relative font-sans" dir="rtl">
        <div className="w-10 h-10 border-2 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.3)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030610] text-slate-200 font-sans overflow-x-hidden selection:bg-[#00F0FF]/30 relative" dir="rtl">
      {/* 2100 Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030610]">
        <motion.div 
           animate={{ y: [0, -100, 0], opacity: [0.3, 0.7, 0.3] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0 opacity-50"
           style={{
             backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(0, 240, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 100% 120%, rgba(0, 102, 255, 0.15) 0%, transparent 40%)',
           }} 
        />
        <motion.div 
           animate={{ y: [0, 50, 0], opacity: [0.1, 0.3, 0.1] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0"
           style={{
             backgroundImage: 'linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
             WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
           }} 
        />
        
        {/* Floating tech lines */}
        <motion.div 
          animate={{ y: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/4 w-[1px] h-[30vh] bg-gradient-to-b from-transparent via-[#00F0FF]/30 to-transparent blur-[1px]"
        />
        <motion.div 
          animate={{ y: ['100%', '-100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute right-1/4 w-[2px] h-[40vh] bg-gradient-to-b from-transparent via-[#0066FF]/20 to-transparent blur-[2px]"
        />
      </div>

      <div className="relative z-10 w-full min-h-screen flex items-center justify-center sm:p-6 p-0">
        <AnimatePresence mode="wait">
          {!session ? (
            <LoginScreen key="login" onLogin={(data) => {
              setSession(data.codeInfo);
              if (data.serverNow) setServerTimeOffset(new Date(data.serverNow).getTime() - Date.now());
            }} />
          ) : (
            <div key="dashboard" className="w-full max-w-[1200px] mx-auto min-h-screen sm:min-h-0 sm:py-6 flex flex-col sm:gap-6 bg-[#030610]/80 backdrop-blur-xl sm:bg-transparent sm:backdrop-blur-none sm:rounded-none">
              <DashboardHeader userName={(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'VIP Member'} onLogout={handleLogout} />
              
              <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-0">
                {/* Left/Top Sidebar: Membership */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
                   <MembershipCard session={session} serverTimeOffset={serverTimeOffset} />
                </div>

                {/* Main Content: Signal Generator */}
                <div className="w-full flex-1 min-w-0">
                  <SignalGenerator lang="ar" />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DashboardHeader({ userName, onLogout }: { userName: string, onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-0 bg-[#030610]/80 backdrop-blur-xl sm:bg-transparent border-b border-white/5 sm:border-none mb-4 sm:mb-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B101E] to-[#151F32] flex items-center justify-center border border-white/10 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-[#00F0FF]/10 animate-pulse" />
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0066FF] font-black tracking-tighter text-sm">AH</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-white leading-tight">{userName}</h1>
            <span className="text-[10px] text-[#00F0FF] font-bold uppercase tracking-widest mt-0.5 animate-pulse">VIP SIGNAL</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          title="تسجيل خروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

function MembershipCard({ session, serverTimeOffset }: { session: any, serverTimeOffset: number }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const calculateTime = () => {
      const expiresAt = new Date(session.expires_at).getTime();
      const activatedAt = new Date(session.activated_at).getTime();
      const now = Date.now() + serverTimeOffset;
      const difference = expiresAt - now;
      const totalDuration = expiresAt - activatedAt;
      
      if (difference <= 0) {
        setTimeLeft('منتهي الصلاحية');
        setDaysLeft(0);
        setProgress(0);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysLeft(days);
      setTimeLeft(\`\${days} يوم و \${hours} ساعة\`);
      setProgress(Math.max(0, Math.min(100, (difference / totalDuration) * 100)));
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [session, serverTimeOffset]);

  const isLow = daysLeft <= 3;
  const strokeColor = isLow ? "#F43F5E" : "#00F0FF";

  return (
    <div className="bg-transparent rounded-3xl p-5 border border-[#00F0FF]/10 shadow-[0_0_50px_rgba(0,240,255,0.03)] relative overflow-hidden group backdrop-blur-3xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#00F0FF]/20 transition-colors duration-500" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-sm font-bold text-slate-300">عضوية AH VIP</h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-xs font-bold text-[#00F0FF]">نشط</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#00F0FF]/5 flex items-center justify-center border border-[#00F0FF]/20">
          <Lock className="w-4 h-4 text-[#00F0FF]" />
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
            <motion.circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={strokeColor} 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={283}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
            />
          </svg>
          <Clock className="w-5 h-5 text-white absolute" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">المدة المتبقية</span>
          <span className={\`font-black text-lg \${isLow ? 'text-rose-400' : 'text-white'}\`}>{timeLeft}</span>
        </div>
      </div>
      
      {isLow && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300 font-medium leading-relaxed">
            سينتهي اشتراكك قريباً. يرجى التجديد لتجنب توقف الخدمة.
          </p>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }: { key?: string, onLogin: (data: any) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [telegramId] = useState(() => {
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || 'fake_tg_id_' + Math.floor(Math.random() * 1000000);
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!code) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, telegramId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.arabicError || data.error);
        setIsSubmitting(false);
      } else {
        setSuccess(data.arabicMessage || 'تم فتح حساب AH VIP بنجاح');
        setTimeout(() => {
          onLogin(data);
        }, 2000);
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-full max-w-sm bg-transparent backdrop-blur-3xl p-8 rounded-[32px] relative overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.05)] border border-[#00F0FF]/10"
    >
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[#00F0FF] to-transparent opacity-50" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00F0FF]/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex justify-center mb-8 relative z-10">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 rounded-2xl border-2 border-[#00F0FF]/30 rotate-3 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 rounded-2xl border-2 border-[#0066FF]/20 -rotate-3 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="w-full h-full rounded-2xl bg-[#030610]/80 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)] border border-[#00F0FF]/50 relative overflow-hidden">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00F0FF] to-[#0066FF] text-xl tracking-tighter">AH VIP</span>
            <span className="text-[8px] font-black tracking-[0.3em] text-[#00F0FF] mt-1">SIGNAL</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-2xl font-black mb-2 text-white tracking-tight">AH VIP <span className="text-[#00F0FF]">SIGNAL</span></h1>
        <p className="text-xs text-slate-400 font-medium leading-relaxed tracking-wide">
          SYSTEM ACCESS REQUIRED
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2 relative"
        >
          <div className="relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00F0FF]/50 flex items-center justify-center pointer-events-none">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting || !!success}
              className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-[#00F0FF]/20 px-5 py-4 pr-12 rounded-xl text-center text-lg font-bold text-white font-mono tracking-[0.2em] focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 focus:ring-0 uppercase transition-all placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans outline-none"
              placeholder="AHVIP-XXXX"
              dir="ltr"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-rose-400 font-bold text-center bg-rose-500/10 py-3 px-4 rounded-xl border border-rose-500/20 flex items-center justify-center gap-2 overflow-hidden"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-[#00F0FF] font-bold text-center bg-[#00F0FF]/10 py-3 px-4 rounded-xl border border-[#00F0FF]/20 flex items-center justify-center gap-2 overflow-hidden"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!code || isSubmitting || !!success}
          className="w-full mt-2 relative group overflow-hidden rounded-xl p-[1px] disabled:opacity-50 disabled:active:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#0066FF] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-[#030610] px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-transparent disabled:bg-[#030610]">
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
            ) : (
              <span className="text-white font-extrabold tracking-wide group-hover:text-[#030610] transition-colors duration-300">AUTHORIZE ACCESS</span>
            )}
          </div>
        </motion.button>
      </form>

      {/* SUPPORT LINK WITH TELEGRAM ICON AT BOTTOM OF LOGIN */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-3 relative z-10">
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Support Interface</p>
        <a 
          href="https://t.me/AH_QUOTEX_SUPPORT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-[#00F0FF]/10 text-[#00F0FF] transition-all border border-white/5 hover:border-[#00F0FF]/30 group"
        >
          <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          <span dir="ltr" className="font-bold text-sm tracking-widest font-mono">@AH_QUOTEX_SUPPORT</span>
        </a>
      </div>
    </motion.div>
  );
}
`;
fs.writeFileSync('src/MainUserApp.tsx', code);
