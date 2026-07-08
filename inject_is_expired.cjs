const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

const returnBlock = `  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full flex flex-col gap-8">`;

const isExpiredBlock = `  if (isExpired) {
    return (
      <motion.div initial={{opacity:0, scale: 0.95}} animate={{opacity:1, scale: 1}} transition={{duration:0.5}} className="w-full bg-brand-card/90 backdrop-blur-2xl border border-red-500/30 rounded-[24px] p-8 shadow-2xl relative shadow-red-500/10 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 cyber-grid opacity-[0.05] pointer-events-none rounded-[24px]" />
        <AlertTriangle className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" />
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
          {lang === 'ar' ? 'انتهت تجربتك المجانية' : 'Free Trial Ended'}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mb-8 font-medium leading-relaxed max-w-md mx-auto">
          {lang === 'ar' 
            ? 'لقد انتهت صفقاتك اليومية بالكامل. يرجى الانتظار 24 ساعة للحصول على صفقات جديدة، أو انضم لقناة الـ VIP للوصول غير المحدود.' 
            : 'Your daily signals have concluded. Please wait 24 hours for new signals, or join the VIP channel for unlimited access.'}
        </p>
        <a 
          href="https://t.me/AH_QUOTEX" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex w-full sm:w-auto px-8 py-4 rounded-[20px] bg-gradient-to-r from-[#229ED9] to-[#1b80b0] hover:brightness-110 text-white font-black transition-all duration-300 items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,158,217,0.4)] hover:shadow-[0_0_30px_rgba(34,158,217,0.6)] transform hover:-translate-y-1 active:scale-95"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="tracking-wide">{lang === 'ar' ? 'الانضمام لقناة VIP' : 'Join VIP Channel'}</span>
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}} className="w-full flex flex-col gap-8">`;

content = content.replace(returnBlock, isExpiredBlock);
fs.writeFileSync('src/components/SignalGenerator.tsx', content);
