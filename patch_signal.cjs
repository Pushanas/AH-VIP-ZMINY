const fs = require('fs');
let code = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

// Remove stylizeText from being used
code = code.replace(/\{stylizeText\(signal\.time\)\}/g, '{signal.time}');
code = code.replace(/\{stylizeText\(signal\.pair\)\}/g, '{signal.pair}');

// Add whitespace-nowrap to avoid breaking
code = code.replace(/className="font-mono text-xs font-black text-white bg-white\/5 px-3 py-1\.5 rounded-\[20px\] border border-white\/5"/g, 'className="font-mono text-xs font-black text-white bg-white/5 px-3 py-1.5 rounded-[20px] border border-white/5 whitespace-nowrap" dir="ltr"');
code = code.replace(/className="font-mono text-sm font-extrabold text-\[\#94a3b8\] tracking-wide"/g, 'className="font-mono text-sm font-extrabold text-[#94a3b8] tracking-wide whitespace-nowrap" dir="ltr"');

// Remove the decorative symbol
code = code.replace(/\{\/\* Decorative ⧉ symbol for realism \*\/\}\s*<span className="text-brand-primary\/40 text-sm select-none">⧉<\/span>/g, '');

// Remove the copy button
code = code.replace(/\{\/\* Copy button \*\/\}\s*<button[\s\S]*?<\/button>/g, '');

// Adjust layout of the signal row to be cleaner
code = code.replace(/<div className="flex items-center gap-3">/g, '<div className="flex items-center gap-4">');

fs.writeFileSync('src/components/SignalGenerator.tsx', code);
console.log("Patched SignalGenerator");
