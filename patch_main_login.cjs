const fs = require('fs');
let code = fs.readFileSync('src/MainUserApp.tsx', 'utf8');

const supportLink = `
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-3">
        <p className="text-xs text-slate-400">للاشتراك أو التواصل مع الدعم</p>
        <a 
          href="https://t.me/AH_QUOTEX_SUPPORT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 transition-colors border border-[#00F0FF]/20 group"
        >
          <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          <span dir="ltr" className="font-bold text-sm tracking-wide">@AH_QUOTEX_SUPPORT</span>
        </a>
      </div>
`;

code = code.replace(/<\/form>\s*<\/motion\.div>/, `</form>\n${supportLink}\n    </motion.div>`);
fs.writeFileSync('src/MainUserApp.tsx', code);
console.log("Added support to login screen");
