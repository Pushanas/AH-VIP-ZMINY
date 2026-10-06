import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Clock, Sparkles, MessageCircle } from 'lucide-react';
import SignalGenerator from './components/SignalGenerator';
import SecurityGate from './components/SecurityGate';

const SUPPORT_URL = "https://t.me/Qv_Dev";
const CHANNEL_URL = "https://t.me/AH_QUOTEX";

const TelegramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function MainUserApp() {
  const [cairoTime, setCairoTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Africa/Cairo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        setCairoTime(timeStr);
      } catch (e) {
        setCairoTime('');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const userName = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'عضو VIP';

  return (
    <SecurityGate>
      <div className="min-h-screen bg-[#060813] text-slate-200 font-sans overflow-x-hidden selection:bg-[#00F0FF]/30 relative pb-16" dir="rtl">
        
        {/* 100K USD ULTRA-PREMIUM BACKDROP LAYER */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060813]">
          
          {/* Ultra-subtle background matrix grid */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 85%)'
            }} 
          />

          {/* Cinematic ambient glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#00F0FF]/1.5 blur-[140px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[#0066FF]/2 blur-[140px]" />
          
          {/* Light overlay for 3D depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-transparent to-black/25" />
        </div>

        {/* Center Layout */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col gap-5 sm:gap-6"
          >
            {/* Top Navigation & Status Bar */}
            <header className="w-full backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/5 via-purple-500/5 to-transparent opacity-50 rounded-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                
                {/* Right Side (RTL): Q8 Logo, Member Badge & Time Clock */}
                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative group shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF] to-[#0066FF] rounded-xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="w-10 h-10 rounded-xl bg-[#070b19] border border-[#00F0FF]/30 flex items-center justify-center relative overflow-hidden shadow-xl">
                        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-sm tracking-tighter">Q8</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white leading-tight">{userName}</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF95] animate-pulse" />
                      </div>
                      <span className="text-[10px] text-[#00F0FF] font-black uppercase tracking-wider mt-0.5">عضو Q8 VIP</span>
                    </div>
                  </div>

                  {/* Live Clock */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-mono text-xs font-bold text-slate-100 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                    <Clock className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
                    <span className="text-white dir-ltr font-mono">{cairoTime || "00:00:00"}</span>
                  </div>
                </div>

                {/* Left Side (RTL): Quick Links (Channel & Support) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Official Channel Link */}
                  <motion.a 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={CHANNEL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black transition-all cursor-pointer group shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    <span>القناة الرسمية</span>
                  </motion.a>

                  {/* Creator / Developer Link */}
                  <motion.a 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href={SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/15 to-blue-600/25 hover:from-sky-500/30 hover:to-blue-600/40 text-sky-200 hover:text-white border border-sky-500/30 hover:border-sky-400/60 text-xs font-black transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,136,204,0.35)] group relative overflow-hidden"
                    title="المنشئ والمطور @Qv_Dev"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    <TelegramIcon className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>المنشئ والمطور (@Qv_Dev)</span>
                  </motion.a>
                </div>

              </div>
            </header>
            
            {/* Main Signal Generator Application */}
            <div className="w-full">
              <SignalGenerator lang="ar" />
            </div>
            
            {/* Clean minimal footer without duplicate link buttons */}
            <footer className="w-full mt-10 pb-6 text-center text-[10px] text-slate-500 font-bold tracking-wider flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <span className="inline-block w-1 h-1 rounded-full bg-[#00FF95]" />
                <span>نظام Q8 VIP الذكي لإشارات التداول المضمونة • جميع الحقوق محفوظة</span>
              </div>
            </footer>
          </motion.div>
        </div>
      </div>
    </SecurityGate>
  );
}
