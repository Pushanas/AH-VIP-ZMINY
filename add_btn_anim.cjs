const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

content = content.replace(/<button\n\s*onClick=\{handleGenerate\}\n\s*disabled=\{isGenerating\}\n\s*className="w-full py-4.5 rounded-\[20px\] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary hover:brightness-110 transform hover:-translate-y-1 active:scale-\[0.98\] hover:shadow-\[0_0_20px_rgba\(36,232,255,0.35\)\] text-white font-black transition-all duration-300 cursor-pointer text-sm shadow-lg border border-brand-primary\/40 flex items-center justify-center gap-2.5"\n\s*>/g, 
`<motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4.5 rounded-[20px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary hover:brightness-110 text-white font-black transition-all duration-300 cursor-pointer text-sm shadow-[0_0_20px_rgba(36,232,255,0.2)] hover:shadow-[0_0_30px_rgba(36,232,255,0.5)] border border-brand-primary/40 flex items-center justify-center gap-2.5 overflow-hidden relative"
          >
            <div className="absolute inset-0 w-full h-full metallic-shine pointer-events-none opacity-50" />
`);

content = content.replace(/<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*\{\/\* 6\. Output\/result card \*\/\}/g, 
`</motion.button>\n        </div>\n      </div>\n      {/* 6. Output/result card */}`);

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
