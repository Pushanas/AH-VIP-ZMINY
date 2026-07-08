const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const telegramIconCode = `const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.032-2.766-.86c-.604-.19-.617-.604.126-.894l10.816-4.172c.504-.19.95.122.82.855z" />
  </svg>
);`;

// Insert the icon component
if (!content.includes('TelegramIcon')) {
  content = content.replace(/import \{ motion \} from 'motion\/react';/, "import { motion } from 'motion/react';\n" + telegramIconCode);
}

const oldHeaderLink = `{/* Circular Telegram Channel Icon with Premium Glow */}
            <a
              href="https://t.me/AH_QUOTEX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-[#229ED9]/10 to-[#229ED9]/30 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.6)] hover:bg-[#229ED9] hover:-translate-y-1 active:scale-95 cursor-pointer"
              title="AH QUOTEX Telegram"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </a>`;

const newHeaderLinks = `<div className="flex items-center gap-2">
            {/* Anas Bey Telegram */}
            <a
              href="http://t.me/PartnerMALKY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.6)] hover:bg-[#229ED9] hover:-translate-y-1 active:scale-95 cursor-pointer group"
              title="انس بيك - VIP"
            >
              <TelegramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#229ED9] group-hover:text-white transition-colors" />
            </a>
            {/* Hazem Bey Telegram */}
            <a
              href="http://t.me/ZOMA_VIP074"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.6)] hover:bg-[#229ED9] hover:-translate-y-1 active:scale-95 cursor-pointer group"
              title="حازم بيك - VIP"
            >
              <TelegramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#229ED9] group-hover:text-white transition-colors" />
            </a>
            </div>`;

content = content.replace(oldHeaderLink, newHeaderLinks);

fs.writeFileSync('src/App.tsx', content);
