const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

// Replace isExpired block's buttons
const oldIsExpiredButtons = `<div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
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

const newIsExpiredButtons = `<div className="flex flex-col items-center gap-4 w-full">
          <a 
            href="https://t.me/AH_QUOTEX" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto px-10 py-4 rounded-[20px] bg-gradient-to-r from-[#229ED9] to-[#1b80b0] hover:brightness-110 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,158,217,0.4)] hover:shadow-[0_0_30px_rgba(34,158,217,0.6)] transform hover:-translate-y-1 active:scale-95"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="tracking-wide">{lang === 'ar' ? 'الانضمام لقناة VIP' : 'Join VIP Channel'}</span>
          </a>
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-xs text-gray-400 font-medium">
              {lang === 'ar' ? 'للدعم الفني 24 ساعة:' : '24/7 Technical Support:'}
            </span>
            <div className="flex items-center justify-center gap-3">
              <a 
                href="http://t.me/PartnerMALKY" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[12px] py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold transition-all duration-300 cursor-pointer"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>انس بيك</span>
              </a>
              <a 
                href="http://t.me/ZOMA_VIP074" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[12px] py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold transition-all duration-300 cursor-pointer"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>حازم بيك</span>
              </a>
            </div>
          </div>
        </div>`;

content = content.replace(oldIsExpiredButtons, newIsExpiredButtons);

// Also update the bottom section of the whole page just in case
const oldBottomSection = `      {/* 7. Telegram official channel button */}
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

const newBottomSection = `      {/* 7. Telegram official channel button & Support */}
      <div className="w-full mt-4 flex flex-col gap-4">
        <a 
           href="https://t.me/AH_QUOTEX" 
           target="_blank" 
           rel="noopener noreferrer"
          className="w-full border border-brand-primary/30 hover:border-brand-primary text-brand-primary hover:bg-brand-primary/10 rounded-[20px] py-4 px-5 flex items-center justify-center gap-2 text-xs font-extrabold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(36,232,255,0.2)] cursor-pointer transform hover:-translate-y-1 active:scale-[0.98]"
        >
          <ExternalLink className="w-4 h-4 text-brand-primary" />
          <span>{lang === 'ar' ? 'قناة التليجرام الرسمية للأدمن: @AH_QUOTEX' : 'Official Admin Telegram Channel: @AH_QUOTEX'}</span>
        </a>
        
        <div className="flex flex-col items-center gap-2 mt-1">
          <span className="text-xs text-gray-400 font-medium">
            {lang === 'ar' ? 'للدعم الفني 24 ساعة:' : '24/7 Technical Support:'}
          </span>
          <div className="flex items-center justify-center gap-3">
            <a 
              href="http://t.me/PartnerMALKY" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[12px] py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(34,158,217,0.2)]"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
              <span>انس بيك</span>
            </a>
            <a 
              href="http://t.me/ZOMA_VIP074" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#229ED9]/10 border border-[#229ED9]/30 hover:border-[#229ED9] text-white hover:bg-[#229ED9]/20 rounded-[12px] py-2 px-4 flex items-center justify-center gap-2 text-[11px] font-bold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(34,158,217,0.2)]"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
              <span>حازم بيك</span>
            </a>
          </div>
        </div>
      </div>`;

content = content.replace(oldBottomSection, newBottomSection);

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
