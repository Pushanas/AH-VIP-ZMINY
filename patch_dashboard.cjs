const fs = require('fs');
let code = fs.readFileSync('src/MainUserApp.tsx', 'utf8');

// Replace the entire Dashboard function with a cleaner one
const cleanDashboard = `function Dashboard({ session, serverTimeOffset, onLogout }: { key?: string, session: any, serverTimeOffset: number, onLogout: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);

  const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  const userName = user?.first_name || 'VIP Member';

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiresAt = new Date(session.expires_at).getTime();
      const now = Date.now() + serverTimeOffset;
      const difference = expiresAt - now;

      if (difference <= 0) {
        setTimeLeft('منتهي الصلاحية');
        setDaysLeft(0);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setDaysLeft(days);
      setTimeLeft(\`\${days} يوم و \${hours} ساعة\`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [session.expires_at, serverTimeOffset]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md flex flex-col gap-4"
    >
      <header className="glass-panel p-4 rounded-2xl flex items-center justify-between shadow-lg border-[#24E8FF]/20">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#090B1A] to-[#11182D] flex items-center justify-center border border-[#24E8FF]/50">
            <User className="w-5 h-5 text-[#24E8FF]" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-black text-base text-white leading-tight">{userName}</h2>
            <div className="text-[10px] text-[#00FF95] font-bold tracking-widest mt-0.5">مشتـرك VIP</div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Expiry Alerts */}
      <AnimatePresence>
        {daysLeft <= 7 && daysLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={\`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 \${
              daysLeft <= 1 ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              daysLeft <= 3 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
              'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }\`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {daysLeft <= 1 ? 'تنبيه: اشتراكك ينتهي خلال أقل من يوم! بادر بالتجديد الآن.' :
               daysLeft <= 3 ? \`تنبيه: سينتهي اشتراكك خلال \${daysLeft} أيام. يرجى التجديد لتجنب التوقف.\` :
               \`تذكير: باقي \${daysLeft} أيام على انتهاء اشتراكك الشهري.\`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-r from-[#24E8FF]/10 via-[#11182D] to-[#FF2F92]/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center gap-1 relative overflow-hidden">
        <div className="absolute inset-0 metallic-shine opacity-30" />
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest relative z-10">الاشتراك صالح لمدة</span>
        <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#24E8FF] to-[#FF2F92] relative z-10">{timeLeft}</span>
      </div>

      <div className="mt-2">
        <SignalGenerator lang="ar" />
      </div>

    </motion.div>
  );
}`;

code = code.replace(/function Dashboard\([\s\S]*\}\);[\n\s]*\}/, cleanDashboard);
fs.writeFileSync('src/MainUserApp.tsx', code);
console.log("Patched MainUserApp");
