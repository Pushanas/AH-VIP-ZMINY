const fs = require('fs');

let code = fs.readFileSync('src/MainUserApp.tsx', 'utf8');

const bgElements = `
      {/* 2100 Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030610]">
        <motion.div 
           animate={{ y: [0, -100, 0], opacity: [0.3, 0.7, 0.3] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0 opacity-50"
           style={{
             backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(0, 240, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 100% 120%, rgba(0, 102, 255, 0.15) 0%, transparent 40%)',
           }} 
        />
        <motion.div 
           animate={{ y: [0, 50, 0], opacity: [0.1, 0.3, 0.1] }}
           transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
           className="absolute inset-0"
           style={{
             backgroundImage: 'linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
             WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
           }} 
        />
        
        {/* Floating tech lines */}
        <motion.div 
          animate={{ y: ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/4 w-[1px] h-[30vh] bg-gradient-to-b from-transparent via-[#00F0FF]/30 to-transparent blur-[1px]"
        />
        <motion.div 
          animate={{ y: ['100%', '-100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute right-1/4 w-[2px] h-[40vh] bg-gradient-to-b from-transparent via-[#0066FF]/20 to-transparent blur-[2px]"
        />
      </div>
`;

code = code.replace(/{[\s\S]*?\/\* Subtle Background Elements \*\/[\s\S]*?<div className="fixed inset-0 pointer-events-none z-0 opacity-\[0\.015\]"[\s\S]*?\/>/, bgElements);

fs.writeFileSync('src/MainUserApp.tsx', code);
