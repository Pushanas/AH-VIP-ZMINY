const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

const telegramIconCode = `const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.032-2.766-.86c-.604-.19-.617-.604.126-.894l10.816-4.172c.504-.19.95.122.82.855z" />
  </svg>
);`;

// Insert the icon component
content = content.replace(/import \{ motion \} from 'motion\/react';/, "import { motion } from 'motion/react';\n" + telegramIconCode);

const oldTelegramSection = `      {/* 7. Telegram official channel button */}
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
      </div>`;

const newTelegramSection = `      {/* 7. Telegram official channel buttons */}
      <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a 
           href="http://t.me/PartnerMALKY" 
           target="_blank" 
           rel="noopener noreferrer"
          className="w-full bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[20px] py-4 px-5 flex items-center justify-center gap-3 text-sm font-black transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,158,217,0.3)] cursor-pointer transform hover:-translate-y-1 active:scale-[0.98]"
        >
          <TelegramIcon className="w-5 h-5 text-[#229ED9]" />
          <span>انس بيك - VIP</span>
        </a>
        <a 
           href="http://t.me/ZOMA_VIP074" 
           target="_blank" 
           rel="noopener noreferrer"
          className="w-full bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[20px] py-4 px-5 flex items-center justify-center gap-3 text-sm font-black transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,158,217,0.3)] cursor-pointer transform hover:-translate-y-1 active:scale-[0.98]"
        >
          <TelegramIcon className="w-5 h-5 text-[#229ED9]" />
          <span>حازم بيك - VIP</span>
        </a>
      </div>`;

content = content.replace(oldTelegramSection, newTelegramSection);

const oldJoinVipButton = `<a 
          href="https://t.me/AH_QUOTEX" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto px-8 py-4 rounded-[20px] bg-gradient-to-r from-[#229ED9] to-[#1b80b0] hover:brightness-110 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,158,217,0.4)] hover:shadow-[0_0_30px_rgba(34,158,217,0.6)] transform hover:-translate-y-1 active:scale-95"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="tracking-wide">{lang === 'ar' ? 'الانضمام لقناة VIP' : 'Join VIP Channel'}</span>
        </a>`;

const newJoinVipButton = `<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <a 
            href="http://t.me/PartnerMALKY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto px-8 py-4 rounded-[20px] bg-[#229ED9]/10 border border-[#229ED9]/40 hover:bg-[#229ED9]/20 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_15px_rgba(34,158,217,0.2)] hover:shadow-[0_0_25px_rgba(34,158,217,0.4)] transform hover:-translate-y-1 active:scale-95"
          >
            <TelegramIcon className="w-5 h-5 text-[#229ED9]" />
            <span className="tracking-wide">انس بيك VIP</span>
          </a>
          <a 
            href="http://t.me/ZOMA_VIP074" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto px-8 py-4 rounded-[20px] bg-[#229ED9]/10 border border-[#229ED9]/40 hover:bg-[#229ED9]/20 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_15px_rgba(34,158,217,0.2)] hover:shadow-[0_0_25px_rgba(34,158,217,0.4)] transform hover:-translate-y-1 active:scale-95"
          >
            <TelegramIcon className="w-5 h-5 text-[#229ED9]" />
            <span className="tracking-wide">حازم بيك VIP</span>
          </a>
        </div>`;

content = content.replace(oldJoinVipButton, newJoinVipButton);

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
