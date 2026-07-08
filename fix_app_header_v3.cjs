const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeaderLink = `<div className="flex items-center gap-2">
            {/* Anas Bey Telegram */}
            <a
              href="http://t.me/PartnerMALKY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.6)] hover:bg-[#229ED9] hover:-translate-y-1 active:scale-95 cursor-pointer group"
              title="انس بيك - VIP"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#229ED9] group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.88 7.97-3.45 3.79-1.61 4.57-1.89 5.09-1.9.11 0 .37.03.54.17.14.12.18.28.2.44-.02.07-.02.13-.03.2z" />
              </svg>
            </a>
            {/* Hazem Bey Telegram */}
            <a
              href="http://t.me/ZOMA_VIP074"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.6)] hover:bg-[#229ED9] hover:-translate-y-1 active:scale-95 cursor-pointer group"
              title="حازم بيك - VIP"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#229ED9] group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.88 7.97-3.45 3.79-1.61 4.57-1.89 5.09-1.9.11 0 .37.03.54.17.14.12.18.28.2.44-.02.07-.02.13-.03.2z" />
              </svg>
            </a>
            </div>`;

const newHeaderLinks = `<div className="flex flex-col items-center gap-1.5">
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
            <div className="flex flex-col items-center">
              <span className="text-[7.5px] sm:text-[8.5px] text-[#229ED9]/80 font-bold mb-1 leading-none tracking-wide">{lang === 'ar' ? 'لدعم فني 24 ساعة' : '24/7 Support'}</span>
              <div className="flex items-center gap-1.5">
                <a
                  href="http://t.me/PartnerMALKY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_8px_rgba(34,158,217,0.2)] hover:shadow-[0_0_12px_rgba(34,158,217,0.4)] hover:bg-[#229ED9] hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
                  title="انس بيك - VIP"
                >
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#229ED9] group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.88 7.97-3.45 3.79-1.61 4.57-1.89 5.09-1.9.11 0 .37.03.54.17.14.12.18.28.2.44-.02.07-.02.13-.03.2z" />
                  </svg>
                </a>
                <a
                  href="http://t.me/ZOMA_VIP074"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/40 hover:border-[#229ED9] text-white transition-all duration-300 shadow-[0_0_8px_rgba(34,158,217,0.2)] hover:shadow-[0_0_12px_rgba(34,158,217,0.4)] hover:bg-[#229ED9] hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
                  title="حازم بيك - VIP"
                >
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#229ED9] group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.88 7.97-3.45 3.79-1.61 4.57-1.89 5.09-1.9.11 0 .37.03.54.17.14.12.18.28.2.44-.02.07-.02.13-.03.2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>`;

content = content.replace(oldHeaderLink, newHeaderLinks);
fs.writeFileSync('src/App.tsx', content);
