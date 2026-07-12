import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Lock, Clock, ShieldAlert, LogOut, CheckCircle2, 
  Bell, Settings, User, Sparkles, Globe, Cpu, AlertTriangle, Info, HelpCircle, ChevronDown, Award, Copy
} from 'lucide-react';
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
      <div className="min-h-screen bg-[#060813] flex flex-col items-center justify-center relative font-sans overflow-hidden" dir="rtl">
        {/* Apple style ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.06),transparent_65%)] pointer-events-none" />
        <div className="relative flex flex-col items-center gap-6 z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl border border-[#00F0FF]/20 animate-[spin_5s_linear_infinite]" />
            <div className="absolute inset-0 rounded-2xl border-2 border-t-[#00F0FF] border-r-transparent border-b-transparent border-l-transparent animate-[spin_1s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite]" />
            <div className="absolute inset-1.5 bg-[#060813] rounded-xl flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-xs">
              AH
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-black tracking-[0.3em] text-[#00F0FF] animate-pulse">AH VIP SIGNALS</span>
            <span className="text-[9px] text-slate-500 font-mono">ESTABLISHING ENCRYPTED LINK...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060813] text-slate-200 font-sans overflow-x-hidden selection:bg-[#00F0FF]/30 relative pb-16" dir="rtl">
      
      {/* 100K USD ULTRA-PREMIUM BACKDROP LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060813]">
        
        {/* Ultra-subtle background matrix grid with reduced cyan */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 85%)'
          }} 
        />

        {/* Cinematic ambient glows - reduced brightness for premium feel */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#00F0FF]/1.5 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#0066FF]/2 blur-[140px]" />
        
        {/* Light overlay for 3D depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-transparent to-black/25" />
      </div>

      {/* Center Layout for focused, eye-friendly view */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <AnimatePresence mode="wait">
          {!session ? (
            <div className="min-h-[85vh] flex items-center justify-center py-6">
              <LoginScreen key="login" onLogin={(data) => {
                setSession(data.codeInfo);
                if (data.serverNow) setServerTimeOffset(new Date(data.serverNow).getTime() - Date.now());
              }} />
            </div>
          ) : (
            <motion.div 
              key="dashboard" 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col gap-5 sm:gap-6"
            >
              {/* Integrated VIP Header with Collapsible Pass Info (Clean, No-Clutter) */}
              <DashboardHeader 
                userName={(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'عضو VIP'} 
                onLogout={handleLogout} 
                session={session}
                serverTimeOffset={serverTimeOffset}
              />
              
              {/* Concentrated Single Workspace - Super restful on the eyes, highly professional */}
              <div className="w-full">
                <SignalGenerator lang="ar" />
              </div>
              
              {/* Sleek footer for Telegram support */}
              <footer className="w-full mt-10 pb-6 text-center text-[10px] text-slate-500 font-bold tracking-wider">
                <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-block w-1 h-1 rounded-full bg-[#00FF95]" />
                  <span>نظام AH VIP الذكي لإشارات التداول المضمونة • جميع الحقوق محفوظة</span>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Beautiful Floating Header with Dropdown VIP pass details */
function DashboardHeader({ 
  userName, 
  onLogout, 
  session, 
  serverTimeOffset 
}: { 
  userName: string; 
  onLogout: () => void; 
  session: any;
  serverTimeOffset: number;
}) {
  const [currentUtc, setCurrentUtc] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time metrics inside pass
  const [timeLeft, setTimeLeft] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentUtc(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTime = () => {
      if (!session) return;
      const expiresAt = new Date(session.expires_at).getTime();
      const activatedAt = new Date(session.activated_at).getTime();
      const now = Date.now() + serverTimeOffset;
      const difference = expiresAt - now;
      const totalDuration = expiresAt - activatedAt;
      
      if (difference <= 0) {
        setTimeLeft('منتهية');
        setDaysLeft(0);
        setProgress(0);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysLeft(days);
      setTimeLeft(`${days} ي و ${hours} س`);
      setProgress(Math.max(0, Math.min(100, (difference / totalDuration) * 100)));
    };

    calculateTime();
    const timer = setInterval(calculateTime, 30000);
    return () => clearInterval(timer);
  }, [session, serverTimeOffset]);

  // Handle outside clicks to close pass dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [copiedCode, setCopiedCode] = useState(false);
  const handleCopyCode = (e: any) => {
    e.stopPropagation();
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const isLow = daysLeft <= 3;
  const statusColor = isLow ? "text-rose-400" : "text-[#00FF95]";

  return (
    <motion.header 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full backdrop-blur-md bg-white/[0.02] border border-white/5 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/3 via-transparent to-transparent opacity-40 rounded-2xl pointer-events-none" />
      
      {/* Right side (RTL Start): AH Logo & VIP Member */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF] to-[#0066FF] rounded-xl blur-sm opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#070b19] border border-[#00F0FF]/20 flex items-center justify-center relative overflow-hidden shadow-xl">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-sm tracking-tighter">AH</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-white leading-tight">{userName}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF95] animate-pulse" />
          </div>
          <span className="text-[9px] text-[#00F0FF]/80 font-bold uppercase tracking-wider mt-0.5">عضو VIP</span>
        </div>
      </div>

      {/* Center: Subscription Status, Remaining Days, Online Indicator */}
      <div className="relative z-30" ref={dropdownRef}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black transition-all cursor-pointer ${
            isOpen 
              ? 'bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]' 
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>اشتراكك نشط • {daysLeft} ي متبقي</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00F0FF]' : 'text-slate-400'}`} />
        </motion.button>

        {/* Dropdown containing complete pass stats */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-1/2 -translate-x-1/2 mt-2.5 w-[280px] sm:w-[320px] bg-[#070b1a]/95 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-slate-200 z-50"
            >
              <div className="absolute top-0 right-0 w-full h-[1.5px] bg-gradient-to-l from-transparent via-[#00F0FF] to-transparent opacity-40" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                  <span className="text-xs font-black text-white">تفاصيل الاشتراك الرقمي</span>
                </div>
                <span className={`text-[10px] font-black tracking-widest uppercase ${statusColor}`}>
                  {isLow ? "قريب الانتهاء" : "نشط"}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>كود التفعيل</span>
                  <button 
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[#00F0FF] hover:underline"
                  >
                    {copiedCode ? <span className="text-[9px] text-[#00FF95]">تم النسخ!</span> : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs font-mono font-black text-white tracking-widest bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 text-center">
                  {session?.code || 'AHVIP-XXXX'}
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
                    <span>الوقت المتبقي لانتهاء صلاحية الكود</span>
                    <span className="text-white font-mono">{timeLeft}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#00F0FF] to-[#0066FF]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Renewal button directly inside pass */}
              <div className="flex flex-col gap-2">
                <a 
                  href="https://t.me/AH_QUOTEX_SUPPORT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded-xl bg-[#00F0FF] hover:bg-white text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تجديد الاشتراك / الدعم الفني</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Left side (RTL End): Logout Button */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
          <span className="text-[8px] font-bold text-slate-500 tracking-wider">Cairo Time</span>
          <span className="text-xs font-bold text-slate-300">{currentUtc || "00:00"}</span>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 border border-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.header>
  );
}

/* Beautiful Interactive Vault Login Portal */
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
        }, 1500);
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.97 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-[380px] bg-gradient-to-b from-[#0b0f1d]/90 to-[#04060d]/98 backdrop-blur-3xl p-6 sm:p-8 rounded-[28px] relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5"
    >
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-[#00F0FF] to-transparent opacity-60" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Clean Dynamic Logo */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-2xl border border-[#00F0FF]/30 rotate-3 animate-[spin_15s_linear_infinite]" />
          <div className="absolute inset-0 rounded-2xl border border-[#0066FF]/10 -rotate-6 animate-[spin_25s_linear_infinite_reverse]" />
          <div className="w-full h-full rounded-2xl bg-[#030610]/90 backdrop-blur-md flex flex-col items-center justify-center border border-white/5 shadow-inner">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00F0FF] to-[#0066FF] text-xl tracking-tighter">AH VIP</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-6 relative z-10">
        <h1 className="text-xl font-black mb-1 text-white tracking-tight">نظام الدخول الآمن</h1>
        <p className="text-[9px] text-[#00F0FF] font-bold tracking-widest uppercase">
          SECURE MEMBERSHIP VERIFICATION
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
        <div className="flex flex-col gap-2 relative">
          <div className="relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting || !!success}
              className="w-full h-13 bg-white/[0.01] hover:bg-white/[0.02] border border-white/10 hover:border-[#00F0FF]/30 px-5 pr-11 rounded-xl text-center text-base font-black text-white font-mono tracking-widest focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 outline-none uppercase transition-all placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans"
              placeholder="كود العضوية (AHVIP-XXXX)"
              dir="ltr"
              required
            />
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-rose-400 font-bold text-center bg-rose-500/5 py-3 px-4 rounded-xl border border-rose-500/10 flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-[#00FF95] font-bold text-center bg-[#00FF95]/5 py-3 px-4 rounded-xl border border-[#00FF95]/10 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00FF95]" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={!code || isSubmitting || !!success}
          className="w-full h-12 relative group overflow-hidden rounded-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] via-[#0066FF] to-[#9900FF] opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-full h-full bg-[#030610] group-hover:bg-transparent transition-all rounded-xl flex items-center justify-center gap-2 disabled:bg-[#030610]">
            {isSubmitting ? (
              <div className="w-4.5 h-4.5 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin" />
            ) : (
              <span className="text-white font-extrabold tracking-wider text-xs group-hover:text-black transition-colors flex items-center gap-2">
                مصادقة الكود وتفعيل الرابط
              </span>
            )}
          </div>
        </motion.button>
      </form>

      {/* Support channel */}
      <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center justify-center gap-2.5 relative z-10">
        <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">طلب كود جديد أو دعم فني</p>
        <motion.a 
          whileHover={{ y: -1 }}
          href="https://t.me/AH_QUOTEX_SUPPORT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.01] hover:bg-[#00F0FF]/10 text-[#00F0FF] transition-all border border-white/5 hover:border-[#00F0FF]/30 group text-xs font-bold"
        >
          <Send className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          <span dir="ltr" className="font-mono">@AH_QUOTEX_SUPPORT</span>
        </motion.a>
      </div>
    </motion.div>
  );
}
