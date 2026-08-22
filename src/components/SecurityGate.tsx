import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Sparkles, 
  MessageCircle, 
  CheckCircle2, 
  Fingerprint, 
  ClipboardPaste, 
  RotateCcw, 
  AlertTriangle,
  Radio,
  Cpu,
  LogOut
} from 'lucide-react';

// New secure high-entropy VIP random key
const REQUIRED_PASSWORD = "AH_VIP_9843_Q8X";
const AUTH_STORAGE_KEY = "ah_vip_auth_pass_v3_secure";
const LEGACY_STORAGE_KEYS = [
  'ah_vip_auth_pass_v1',
  'ah_vip_auth_pass_v2',
  'ah_vip_auth_pass',
  'ah_vip_session',
  'ah_vip_token'
];

const SUPPORT_URL = "https://t.me/A_H_QUOTEX_SUPPORT";
const SUPPORT_HANDLE = "@A_H_QUOTEX_SUPPORT";

interface SecurityGateProps {
  children: React.ReactNode;
}

export default function SecurityGate({ children }: SecurityGateProps) {
  // Purge any legacy session tokens immediately
  const checkStoredAuth = useCallback((): boolean => {
    try {
      // Clear all legacy keys immediately to kick out older sessions
      LEGACY_STORAGE_KEYS.forEach(key => {
        if (localStorage.getItem(key)) localStorage.removeItem(key);
        if (sessionStorage.getItem(key)) sessionStorage.removeItem(key);
      });

      const currentStored = localStorage.getItem(AUTH_STORAGE_KEY);
      return currentStored === REQUIRED_PASSWORD;
    } catch (e) {
      return false;
    }
  }, []);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => checkStoredAuth());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  // Brute force protection
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Multi-tier active session enforcement
  useEffect(() => {
    const enforceRevocation = () => {
      const isValid = checkStoredAuth();
      if (!isValid) {
        setIsUnlocked(false);
        setUnlockedSuccess(false);
      }
    };

    // 1. Run immediately
    enforceRevocation();

    // 2. Real-time storage event (cross-tab kick out)
    window.addEventListener('storage', enforceRevocation);

    // 3. Tab visibility change (when returning to phone browser or tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        enforceRevocation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', enforceRevocation);

    // 4. Fast polling interval for zero-delay revocation
    const intervalId = setInterval(enforceRevocation, 300);

    return () => {
      window.removeEventListener('storage', enforceRevocation);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', enforceRevocation);
      clearInterval(intervalId);
    };
  }, [checkStoredAuth]);

  // Handle countdown lockout timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setErrorMsg(`النظام في وضع التجميد الأمني مؤقتاً. انتظر ${lockoutTimer} ثانية.`);
      triggerShake();
      return;
    }

    const cleanPass = password.trim();
    if (!cleanPass) {
      setErrorMsg('يرجى إدخال رمز الوصول VIP للمتابعة');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      if (cleanPass === REQUIRED_PASSWORD) {
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, REQUIRED_PASSWORD);
        } catch (e) {}
        setUnlockedSuccess(true);
        setFailedAttempts(0);
        setTimeout(() => {
          setIsUnlocked(true);
          setIsSubmitting(false);
        }, 750);
      } else {
        setIsSubmitting(false);
        const newFailed = failedAttempts + 1;
        setFailedAttempts(newFailed);
        
        if (newFailed >= 5) {
          setLockoutTimer(30);
          setErrorMsg('تم حظر المحاولات مؤقتاً لمدة 30 ثانية لدواعي الأمان المشدد.');
        } else {
          setErrorMsg(`كلمة المرور غير صحيحة! تأكد من تطابق الأحرف والرموز (متبقي ${5 - newFailed} محاولات).`);
        }
        triggerShake();
      }
    }, 450);
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setPassword(text.trim());
          if (inputRef.current) inputRef.current.focus();
        }
      }
    } catch (e) {}
  };

  const handleLockBot = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
    setIsUnlocked(false);
    setPassword('');
    setUnlockedSuccess(false);
  };

  if (isUnlocked) {
    return (
      <div className="relative w-full">
        {/* Floating Quick Lock Button */}
        <div className="fixed bottom-4 left-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLockBot}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#090d1f]/95 hover:bg-rose-950/80 border border-purple-500/40 hover:border-rose-500/50 text-slate-200 hover:text-rose-300 text-xs font-black shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all cursor-pointer group"
            title="إغلاق وقفل البوت فوراً"
          >
            <LogOut className="w-3.5 h-3.5 text-purple-400 group-hover:text-rose-400 transition-colors" />
            <span className="hidden sm:inline">قفل الجلسة</span>
          </motion.button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03050e] text-slate-100 font-sans flex items-center justify-center p-3.5 sm:p-6 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200" dir="rtl">
      
      {/* 100K High-Tech Cyber Grid & Neon Flare Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* High Precision Dynamic Matrix Grid */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 80%)'
          }} 
        />
        {/* Pulsing Core Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-purple-700/20 via-cyan-500/10 to-transparent blur-[140px] animate-pulse" />
        <div className="absolute top-[15%] left-[20%] w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute bottom-[15%] right-[20%] w-72 h-72 rounded-full bg-purple-600/15 blur-[110px]" />
        
        {/* Animated Cyber Ring Coordinates */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full border border-purple-500/10 animate-[spin_32s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-dashed border-cyan-400/10 animate-[spin_24s_linear_infinite_reverse]" />
      </div>

      {/* Main VIP Security Terminal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-gradient-to-b from-[#0c1029]/95 via-[#070a1e]/95 to-[#030510]/98 border border-purple-500/35 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 relative z-10 backdrop-blur-3xl shadow-[0_20px_80px_rgba(139,92,246,0.25)] flex flex-col items-center transition-colors"
      >
        {/* Top Multi-Color Laser Trim */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] via-purple-500 to-transparent opacity-90 rounded-t-3xl" />
        
        {/* Corner Neon Accents */}
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />

        {/* Live Security Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="tracking-wide">بوابة الحماية المشفرة • AH VIP TERMINAL</span>
        </div>

        {/* Central Futuristic Hologram Lock Icon */}
        <div className="relative mb-5">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse" />
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#060817] border-2 border-cyan-500/40 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,240,255,0.2)]">
              {unlockedSuccess ? (
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                </motion.div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <Fingerprint className="w-11 h-11 text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-600/90 border border-purple-300/40 flex items-center justify-center shadow-lg">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Title & Subtitle */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
          <span>{unlockedSuccess ? 'تم التحقق بنجاح!' : 'تسجيل الدخول المشفر'}</span>
          {!unlockedSuccess && <Cpu className="w-5 h-5 text-cyan-400" />}
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed mb-6 max-w-sm text-center">
          {unlockedSuccess 
            ? 'جاري فك التشفير وتوجيهك إلى محرك الإشارات الفورية VIP...' 
            : 'أدخل رمز المرور السري الخاص بالبوت للوصول لصفقات وخوارزميات اليوم.'}
        </p>

        {/* Lockout Notice if applicable */}
        {lockoutTimer > 0 && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>النظام مقفل مؤقتاً: {lockoutTimer} ثانية</span>
          </div>
        )}

        {/* Access Form */}
        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
          <div className="flex flex-col text-right gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>رمز المرور VIP المطلوب:</span>
              </label>
              
              {/* Quick Paste Button */}
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300 hover:text-cyan-300 transition-colors cursor-pointer bg-white/[0.04] px-2 py-0.5 rounded-lg border border-purple-500/20"
                title="لصق من الحافظة"
              >
                <ClipboardPaste className="w-3 h-3 text-purple-400" />
                <span>لصق الكود</span>
              </button>
            </div>
            
            <div className="relative w-full group">
              <input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل الرمز السري هنا..."
                disabled={isSubmitting || unlockedSuccess || lockoutTimer > 0}
                autoFocus
                className="w-full h-13 px-4 pl-12 bg-white/[0.04] border border-cyan-500/30 focus:border-cyan-400 focus:bg-white/[0.07] rounded-2xl text-white font-mono text-sm font-black tracking-widest placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] text-left dir-ltr disabled:opacity-50"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors p-1"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message Toast */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-rose-950/30 text-center"
              >
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit / Verification Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || unlockedSuccess || lockoutTimer > 0}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-400 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(0,240,255,0.3)] border border-cyan-400/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري مطابقة الشفرة والحماية...</span>
              </div>
            ) : unlockedSuccess ? (
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>تم فتح البوت بنجاح</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-200" />
                <span>تأكيد الدخول وفك القفل الفوري</span>
              </div>
            )}
          </motion.button>
        </form>

        {/* Clean Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-5 sm:my-6" />

        {/* Technical Support VIP Contact Button */}
        <div className="w-full flex flex-col items-center gap-2.5">
          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
            <span>ليس لديك رمز المرور أو تحتاج لتفعيل حسابك؟</span>
          </p>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-purple-500/20 border border-purple-500/30 hover:border-cyan-400/60 text-purple-200 hover:text-white text-xs font-black transition-all group shadow-md shadow-purple-950/20"
          >
            <MessageCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>تواصل بالدعم الفني المباشر ({SUPPORT_HANDLE})</span>
          </a>
        </div>

      </motion.div>
    </div>
  );
}

