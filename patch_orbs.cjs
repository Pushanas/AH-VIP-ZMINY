const fs = require('fs');

let code = fs.readFileSync('src/MainUserApp.tsx', 'utf8');

const oldBgStart = '{/* 2100 Animated Background Elements */}';
const oldBgEnd = '</div>\n\n      <div className="relative z-10 w-full min-h-screen';

const startIndex = code.indexOf(oldBgStart);
if (startIndex === -1) {
  console.log("Could not find start index.");
  process.exit(1);
}

const endIndex = code.indexOf(oldBgEnd, startIndex);
if (endIndex === -1) {
  console.log("Could not find end index.");
  process.exit(1);
}

const newBg = `      {/* 2100 Animated Background Elements - High Performance Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030610]">
        {/* Deep background mesh */}
        <div 
           className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: 'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
             backgroundSize: '64px 64px',
             maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
             WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)'
           }} 
        />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            x: ['-5%', '5%', '-5%'], 
            y: ['-5%', '5%', '-5%'] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#00F0FF]/10 blur-[100px] sm:blur-[120px]"
          style={{ willChange: 'transform' }}
        />
        <motion.div 
          animate={{ 
            x: ['5%', '-5%', '5%'], 
            y: ['5%', '-5%', '5%'] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-[#0066FF]/10 blur-[100px] sm:blur-[140px]"
          style={{ willChange: 'transform' }}
        />
        <motion.div 
          animate={{ 
            x: ['0%', '10%', '0%'], 
            y: ['10%', '0%', '10%'] 
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[#B026FF]/5 blur-[90px] sm:blur-[100px]"
          style={{ willChange: 'transform' }}
        />
      </div>\n`;

const newCode = code.substring(0, startIndex) + newBg + code.substring(endIndex);
fs.writeFileSync('src/MainUserApp.tsx', newCode);
console.log("Replaced background");
