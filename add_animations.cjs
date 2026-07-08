const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

// Replace signal card div with motion.div
content = content.replace(/<div \n\s*key=\{idx\} \n\s*className="flex items-center justify-between gap-3 p-4 rounded-\[20px\] bg-brand-bg\/80 border border-brand-primary\/20 hover:border-brand-primary\/45 shadow-sm hover:shadow-\[0_0_15px_rgba\(36,232,255,0\.15\)\] hover:bg-brand-bg\/95 transition-all duration-300 animate-slide-up transform hover:-translate-y-1"\n\s*style=\{\{ animationDelay: `\$\{Math\.min\(idx \* 0\.05, 0\.5\)\}s`, animationFillMode: 'both' \}\}\n\s*>/g, 
`<motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5), type: 'spring', bounce: 0.4 }}
                      className="flex items-center justify-between gap-3 p-4 rounded-[20px] bg-brand-bg/80 border border-brand-primary/20 hover:border-brand-primary/50 shadow-sm hover:shadow-[0_0_20px_rgba(36,232,255,0.25)] hover:bg-brand-bg/95 transition-colors cursor-pointer group"
                    >`);

content = content.replace(/<\/div>\n\s*\);\n\s*\}\)\n\s*\)/g, 
`</motion.div>\n                  );\n                })\n              )`);

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
