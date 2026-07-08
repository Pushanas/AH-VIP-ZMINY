import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Sparkles } from 'lucide-react';
import SignalGenerator from './components/SignalGenerator';
import { Language } from './types';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const egyptTime = new Date().toLocaleTimeString('en-US', {
    timeZone: 'Africa/Cairo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-brand-bg text-white font-sans overflow-x-hidden selection:bg-brand-primary/30 selection:text-white relative">
      <div className="fixed inset-0 cyber-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-brand-accent/5 rounded-full blur-[100px] transform -translate-x-1/2" />
        <div className="absolute inset-0 scan-line pointer-events-none opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-[520px] mx-auto px-3 sm:px-5 pt-6 sm:pt-8 flex flex-col">
        {/* Legendary Top Banner (Navbar) */}
        <div className="sticky top-3 z-40 w-full bg-brand-card/85 backdrop-blur-xl border border-brand-primary/25 rounded-[20px] sm:rounded-[24px] px-2 sm:px-4 py-2 flex items-center justify-between shadow-[0_4px_30px_rgba(36,232,255,0.15)] mb-6 sm:mb-8 transition-all duration-300 gap-1 sm:gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent opacity-60 cyber-hexagon animate-spin [animation-duration:10s] shadow-[0_0_15px_rgba(36,232,255,0.45)]" />
              <div className="absolute inset-[1.5px] bg-brand-bg cyber-hexagon" />
              
              <button 
                className="absolute inset-[3px] bg-gradient-to-br from-[#160c2d] via-brand-bg to-[#041d1a] flex flex-col items-center justify-center cyber-hexagon overflow-hidden group cursor-pointer"
                title="AH VIP"
              >
                <div className="absolute inset-0 w-full h-full metallic-shine pointer-events-none opacity-90" />
                <span className="text-[7.5px] sm:text-[8.5px] font-mono tracking-widest text-brand-primary font-black leading-none mt-[1px]">AH</span>
                <span className="text-[9.5px] sm:text-[11.5px] font-black tracking-tighter text-white mt-[1px] leading-none bg-clip-text bg-gradient-to-r from-white via-brand-secondary to-brand-primary drop-shadow-[0_1px_5px_rgba(36,232,255,0.5)]">VIP</span>
              </button>
            </div>

            <div className="flex flex-col hidden sm:flex">
              <span className="text-[14px] sm:text-[15px] font-sans font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-brand-primary leading-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] whitespace-nowrap">AH VIP</span>
              <span className="text-[8px] sm:text-[9px] text-brand-primary font-extrabold tracking-[0.12em] uppercase leading-none mt-1 sm:mt-1.5 animate-pulse whitespace-nowrap">
                {lang === 'ar' ? 'النظام العالمي' : 'WORLDWIDE SYSTEM'}
              </span>
            </div>
          </div>

          {/* Cairo Time Clock & Actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 overflow-visible">
            {/* Modern High-Tech Digital Clock with Live Pulse */}
            <div className="flex flex-col items-center justify-center bg-brand-bg/90 px-2 sm:px-3 py-[4px] sm:py-[6px] rounded-[10px] sm:rounded-[16px] border border-brand-primary/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)] min-w-[70px] sm:min-w-[95px] shrink-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand-primary shadow-[0_0_8px_rgba(36,232,255,0.8)]" />
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-mono font-black text-brand-primary tracking-wide leading-none">{egyptTime}</span>
              </div>
              <span className="text-[6.5px] sm:text-[7.5px] font-mono text-gray-400 tracking-widest uppercase mt-[3px] font-bold whitespace-nowrap leading-none">
                {lang === 'ar' ? 'توقيت القاهرة' : 'CAIRO TIME'}
              </span>
            </div>

            {/* Circular Telegram Channel Icon with Premium Glow */}
            <div className="flex flex-col items-center gap-1.5">
            <a
              href="https://t.me/AH_QUOTEX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-[#229ED9]/10 to-[#229ED9]/30 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.6)] hover:bg-[#229ED9] hover:-translate-y-1 active:scale-95 cursor-pointer"
              title="AH QUOTEX Telegram"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#229ED9] hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.88 7.97-3.45 3.79-1.61 4.57-1.89 5.09-1.9.11 0 .37.03.54.17.14.12.18.28.2.44-.02.07-.02.13-.03.2z" />
              </svg>
            </a>

          </div>

            {/* Premium Language Switch Button */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 shrink-0 rounded-full bg-brand-card/90 hover:bg-[#121c3b] border border-white/10 hover:border-brand-primary/40 text-gray-300 hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer text-[9px] sm:text-[10px] font-black shadow-md tracking-wider"
            >
              <span className="shrink-0 leading-none">{lang === 'ar' ? 'EN' : 'عربي'}</span>
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary animate-pulse shrink-0" />
            </button>
          </div>
        </div>

        {/* Main Title Section */}
        <div className="text-center mb-10 px-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-white leading-tight">
              {lang === 'ar' ? (
                <>
                  مولد إشارات <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400 font-black drop-shadow-[0_2px_10px_rgba(36,232,255,0.15)]">AH VIP</span>
                </>
              ) : (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400 font-black drop-shadow-[0_2px_10px_rgba(36,232,255,0.15)]">AH VIP</span> Signal Generator
                </>
              )}
            </h1>
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-xs sm:text-sm text-gray-400 mt-3 font-sans leading-relaxed max-w-sm mx-auto font-medium"
          >
            {lang === 'ar' 
              ? 'الجيل القادم من خوارزميات التداول الفورية متاحة الان للجميع بآداء متطور'
              : 'The next-generation live signals suite, now available for everyone with enhanced performance.'}
          </motion.p>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-brand-accent/15 via-brand-secondary/25 to-brand-primary/15 border border-brand-accent/30 shadow-md shadow-brand-accent/5 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[11px] sm:text-xs font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-accent to-brand-primary tracking-wide">
              {lang === 'ar' ? '⚡️ صفقات نارية دقيقة ومفتوحة للجميع ⚡️' : '⚡️ High-Octane Deals Open for All ⚡️'}
            </span>
          </motion.div>
        </div>

        {/* View Router */}
        <AnimatePresence mode="wait">
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="w-full"
          >
            <SignalGenerator lang={lang} />
          </motion.div>
        </AnimatePresence>

        {/* Main Global Footer */}
        <footer className="relative z-10 w-full text-center mt-16 text-gray-500 text-xs font-sans border-t border-white/5 pt-8 pb-6">
          <p className="tracking-wide text-[11px] font-semibold text-gray-400">
            {lang === 'ar' ? 'AH VIP Signal Generator | © جميع الحقوق محفوظة 2026' : 'AH VIP Signal Generator | © All Rights Reserved 2026'}
          </p>
          <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-widest font-black">
            Powered by Digital Luxury Signals Core V2
          </p>
          
          {/* Luxurious Owner Signature Badge */}
          <div className="mt-5 flex flex-col items-center justify-center gap-2.5">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-primary/10 via-brand-secondary/5 to-brand-primary/10 border border-brand-primary/30 shadow-lg shadow-brand-primary/5 hover:border-brand-primary/50 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[9px] text-brand-primary font-extrabold tracking-widest uppercase font-mono">
                {lang === 'ar' ? 'المالك: أنس بيك 👑' : 'OWNER: ANAS BIK 👑'}
              </span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-primary/10 via-brand-secondary/5 to-brand-primary/10 border border-brand-primary/30 shadow-lg shadow-brand-primary/5 hover:border-brand-primary/50 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[9px] text-brand-primary font-extrabold tracking-widest uppercase font-mono">
                {lang === 'ar' ? 'المالك: حازم بيك 👑' : 'OWNER: HAZEM BIK 👑'}
              </span>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  );
}
