import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, ShieldCheck, ShieldAlert, Eye, EyeOff, Sparkles, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const REQUIRED_PASSWORD = "VIPGOAL202";
const SUPPORT_URL = "https://t.me/A_H_QUOTEX_SUPPORT";

interface SecurityGateProps {
  children: React.ReactNode;
}

export default function SecurityGate({ children }: SecurityGateProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ah_vip_auth_pass_v1') === REQUIRED_PASSWORD;
    } catch (e) {
      return false;
    }
  });

  // Purge any stored old password immediately on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ah_vip_auth_pass_v1');
      if (stored !== REQUIRED_PASSWORD) {
        localStorage.removeItem('ah_vip_auth_pass_v1');
        setIsUnlocked(false);
      }
    } catch (e) {}
  }, []);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('برجاء إدخال كلمة المرور أولاً');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      if (password.trim() === REQUIRED_PASSWORD) {
        try {
          localStorage.setItem('ah_vip_auth_pass_v1', REQUIRED_PASSWORD);
        } catch (e) {}
        setUnlockedSuccess(true);
        setTimeout(() => {
          setIsUnlocked(true);
          setIsSubmitting(false);
        }, 800);
      } else {
        setIsSubmitting(false);
        setErrorMsg('كلمة المرور غير صحيحة! يرجى التأكد من الرمز وحالة الحروف.');
        triggerShake();
      }
    }, 400);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLockBot = () => {
    try {
      localStorage.removeItem('ah_vip_auth_pass_v1');
    } catch (e) {}
    setIsUnlocked(false);
    setPassword('');
    setUnlockedSuccess(false);
  };

  if (isUnlocked) {
    return (
      <div className="relative w-full">
        {/* Floating Lock Bot Button for User Convenience */}
        <div className="fixed bottom-4 left-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLockBot}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d1f]/90 hover:bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-black shadow-2xl backdrop-blur-md transition-all cursor-pointer"
            title="إغلاق البوت وقفل الشفرة"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">قفل البوت</span>
          </motion.button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden selection:bg-purple-500/30" dir="rtl">
      
      {/* Dynamic Animated Cyber Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
          }} 
        />
        {/* Glowing Neon Flares */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-purple-500/10 animate-[spin_18s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-500/10 animate-[spin_25s_linear_infinite_reverse]" />
      </div>

      {/* Main VIP Lock Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-gradient-to-b from-[#0e122b]/95 via-[#090c1f]/95 to-[#040612]/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 relative z-10 backdrop-blur-2xl shadow-[0_25px_70px_rgba(168,85,247,0.22)] text-center flex flex-col items-center"
      >
        {/* Top Border Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-cyan-400 opacity-80 rounded-t-3xl" />

        {/* Security Badge Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black mb-6 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span>حماية شفرة AH VIP • النظام مغلق</span>
        </div>

        {/* Central Glowing Lock Icon */}
        <div className="relative mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-85 transition-opacity animate-pulse" />
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#080b1e] border-2 border-purple-500/40 flex items-center justify-center relative overflow-hidden shadow-2xl">
              {unlockedSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              ) : (
                <Lock className="w-10 h-10 text-purple-400 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Heading & Intro Description */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {unlockedSuccess ? 'تم التحقق بنجاح!' : 'البوت مغلق برمز حماية'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed mb-6 max-w-sm">
          {unlockedSuccess 
            ? 'جاري توجيهك إلى محرك الإشارات VIP...' 
            : 'أدخل كلمة المرور الخاصة بالبوت للوصول لصفقات اليوم الحصرية.'}
        </p>

        {/* Password Form */}
        <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
          <div className="flex flex-col text-right gap-1.5">
            <label className="text-xs font-black text-purple-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>كلمة المرور المطلوب إدخالها:</span>
            </label>
            
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور هنا..."
                disabled={isSubmitting || unlockedSuccess}
                className="w-full h-13 px-4 pl-12 bg-white/[0.04] border border-purple-500/30 focus:border-cyan-400 focus:bg-white/[0.07] rounded-2xl text-white font-mono text-sm font-bold tracking-widest placeholder:text-slate-500 placeholder:font-sans placeholder:tracking-normal outline-none transition-all shadow-inner text-left dir-ltr"
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
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || unlockedSuccess}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.35)] border border-purple-400/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري التحقق...</span>
              </div>
            ) : unlockedSuccess ? (
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                <span>تم فتح القفل</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-cyan-300" />
                <span>تأكيد الدخول وفك القفل</span>
              </div>
            )}
          </motion.button>
        </form>

        {/* Divider line */}
        <div className="w-full h-[1px] bg-white/10 my-6" />

        {/* Technical Support Button */}
        <div className="w-full flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-400 font-bold">
            ليس لديك كلمة المرور؟ تواصل مع الدعم الفني:
          </p>

          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-purple-500/15 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 text-xs font-black transition-all group"
          >
            <MessageCircle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>الدعم الفني المباشر (AH VIP Support)</span>
          </a>
        </div>

      </motion.div>
    </div>
  );
}
