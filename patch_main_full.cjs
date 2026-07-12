const fs = require('fs');

const code = `import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Lock, Clock, CalendarDays, ShieldAlert, LogOut, CheckCircle2, User } from 'lucide-react';
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
      <div className="min-h-screen bg-[#030712] flex items-center justify-center relative font-['Cairo']" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#24E8FF]/30 border-t-[#24E8FF] rounded-full animate-spin shadow-[0_0_15px_rgba(36,232,255,0.5)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-[#24E8FF]/30 relative font-['Cairo']" dir="rtl">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{
             backgroundImage: 'linear-gradient(to right, #24E8FF 1px, transparent 1px), linear-gradient(to bottom, #24E8FF 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 scan-line" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] right-[5%] w-[45vw] h-[45vw] sm:w-[35vw] sm:h-[35vw] rounded-full bg-[#24E8FF]/10 blur-[100px] animate-orb-1" />
        <div className="absolute top-[40%] left-[-5%] w-[55vw] h-[55vw] sm:w-[45vw] sm:h-[45vw] rounded-full bg-[#FF2F92]/10 blur-[120px] animate-orb-2" />
      </div>

      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!session ? (
            <LoginScreen key="login" onLogin={(data) => {
              setSession(data.codeInfo);
              if (data.serverNow) setServerTimeOffset(new Date(data.serverNow).getTime() - Date.now());
            }} />
          ) : (
            <Dashboard key="dashboard" session={session} serverTimeOffset={serverTimeOffset} onLogout={handleLogout} />
          )}
        </AnimatePresence>
      </div>
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
      className="w-full max-w-sm glass-panel p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-white/5"
    >
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-[#24E8FF] to-transparent opacity-50" />
      
      <div className="flex justify-center mb-8">
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 rounded-full border-2 border-[#24E8FF]/30 animate-halo" />
          <div className="absolute inset-[-8px] rounded-full border-2 border-[#FF2F92]/20 animate-halo-reverse" />
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#090B1A] to-[#11182D] flex items-center justify-center shadow-[0_0_20px_rgba(36,232,255,0.4)] border border-[#24E8FF]/50 relative overflow-hidden group">
            <div className="absolute inset-0 metallic-shine opacity-50" />
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-[#24E8FF] to-[#FF2F92] text-2xl tracking-tighter drop-shadow-[0_0_8px_rgba(36,232,255,0.8)] relative z-10 animate-pulse">AH VIP</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black mb-2 tracking-tight">بوابة <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#24E8FF] to-[#FF2F92]">AH VIP</span></h1>
        <p className="text-sm text-gray-400 font-medium leading-relaxed">
          أدخل كود اشتراكك الشهري للوصول
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2 relative"
        >
          <div className="relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#24E8FF]/60 flex items-center justify-center pointer-events-none">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting || !!success}
              className="w-full glass-input px-5 py-4 pr-12 rounded-xl text-center text-lg font-bold text-white font-mono tracking-[0.2em] focus:ring-2 focus:ring-[#24E8FF]/50 uppercase transition-all placeholder:text-gray-600 placeholder:tracking-normal placeholder:font-sans"
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
              className="text-xs text-[#FF4D6D] font-bold text-center bg-[#FF4D6D]/10 py-3 px-4 rounded-xl border border-[#FF4D6D]/20 flex items-center justify-center gap-2"
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
              className="text-xs text-[#00FF95] font-bold text-center bg-[#00FF95]/10 py-3 px-4 rounded-xl border border-[#00FF95]/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 animate-bounce" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!code || isSubmitting || !!success}
          className="w-full mt-2 bg-gradient-to-r from-[#0f172a] via-[#24E8FF]/30 to-[#0f172a] border border-[#24E8FF]/50 hover:border-[#24E8FF] rounded-xl py-4 text-white shadow-[0_0_15px_rgba(36,232,255,0.2)] hover:shadow-[0_0_25px_rgba(36,232,255,0.4)] transition-all duration-300 font-extrabold flex items-center justify-center gap-2 overflow-hidden relative group disabled:opacity-50 disabled:active:scale-100"
        >
          <div className="absolute inset-0 w-full h-full metallic-shine pointer-events-none opacity-50" />
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="relative z-10 text-lg">دخول وتفعيل الاشتراك</span>
          )}
        </motion.button>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        <a 
          href="https://t.me/AH_QUOTEX_SUPPORT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full border border-white/10 hover:border-[#24E8FF]/60 text-gray-300 hover:text-white bg-white/5 hover:bg-[#24E8FF]/10 rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 group"
        >
          <Send className="w-4 h-4 text-[#24E8FF] group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <span>للاشتراك أو التواصل</span>
          <span dir="ltr" className="text-[#24E8FF]">@AH_QUOTEX_SUPPORT</span>
        </a>
      </div>
    </motion.div>
  );
}

function Dashboard({ session, serverTimeOffset, onLogout }: { key?: string, session: any, serverTimeOffset: number, onLogout: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);

  const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  const userName = user?.first_name || 'VIP Member';

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiresAt = new Date(session.expires_at).getTime();
      const now = Date.now() + serverTimeOffset;
      const difference = expiresAt - now;

      if (difference <= 0) {
        setTimeLeft('منتهي الصلاحية');
        setDaysLeft(0);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysLeft(days);
      setTimeLeft(\`\${days} يوم و \${hours} ساعة\`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [session.expires_at, serverTimeOffset]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md flex flex-col gap-4"
    >
      <header className="glass-panel p-4 rounded-2xl flex items-center justify-between shadow-lg border-[#24E8FF]/20">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#090B1A] to-[#11182D] flex items-center justify-center border border-[#24E8FF]/50">
            <User className="w-5 h-5 text-[#24E8FF]" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-base text-white leading-tight">{userName}</h2>
            <div className="text-[10px] text-[#00FF95] font-bold tracking-widest mt-0.5">مشتـرك VIP</div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Expiry Alerts */}
      <AnimatePresence>
        {daysLeft <= 7 && daysLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={\`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 \${
              daysLeft <= 1 ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              daysLeft <= 3 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
              'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }\`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {daysLeft <= 1 ? 'تنبيه: اشتراكك ينتهي خلال أقل من يوم! بادر بالتجديد الآن.' :
               daysLeft <= 3 ? \`تنبيه: سينتهي اشتراكك خلال \${daysLeft} أيام. يرجى التجديد لتجنب التوقف.\` :
               \`تذكير: باقي \${daysLeft} أيام على انتهاء اشتراكك الشهري.\`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-r from-[#24E8FF]/10 via-[#11182D] to-[#FF2F92]/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center gap-1 relative overflow-hidden">
        <div className="absolute inset-0 metallic-shine opacity-30" />
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest relative z-10">الاشتراك صالح لمدة</span>
        <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#24E8FF] to-[#FF2F92] relative z-10">{timeLeft}</span>
      </div>

      <div className="mt-2 w-full">
        <SignalGenerator lang="ar" />
      </div>

    </motion.div>
  );
}
`;
fs.writeFileSync('src/MainUserApp.tsx', code);
