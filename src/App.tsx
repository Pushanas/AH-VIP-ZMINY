import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VipCode, Language } from './types';
import CodeGate from './components/CodeGate';
import SignalGenerator from './components/SignalGenerator';
import AdminPanel from './components/AdminPanel';
import { Globe, Shield, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const SEED_CODES: VipCode[] = [
  {
    code: 'AHVIP-DEMO-TEST',
    type: 'single_use',
    durationDays: 0,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    usedCount: 0,
    maxUses: 1,
    status: 'active'
  },
  {
    code: 'AHVIP-7DAYS-PASS',
    type: 'duration',
    durationDays: 7,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usedCount: 0,
    maxUses: 99999,
    status: 'active'
  }
];

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [codes, setCodes] = useState<VipCode[]>([]);
  const [activatedCode, setActivatedCode] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'gate' | 'generator' | 'admin'>('gate');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Triple tap logic for logo -> admin
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [flashActive, setFlashActive] = useState(false);

  // Egypt standard time clock
  const [egyptTime, setEgyptTime] = useState('');

  useEffect(() => {
    const updateEgyptTime = () => {
      try {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Africa/Cairo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const rawStr = new Date().toLocaleTimeString('en-US', options);
        const formatted = lang === 'ar' 
          ? rawStr.replace('AM', 'ص').replace('PM', 'م')
          : rawStr;
        setEgyptTime(formatted);
      } catch (e) {
        setEgyptTime(new Date().toLocaleTimeString());
      }
    };
    updateEgyptTime();
    const interval = setInterval(updateEgyptTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        setCurrentUser(usr);
        // Register user in SQL database
        try {
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uid: usr.uid, email: usr.email || '' })
          });
        } catch (e) {
          console.error('Error registering user:', e);
        }
      } else {
        const savedGuest = localStorage.getItem('ah_guest_session');
        if (savedGuest) {
          try {
            setCurrentUser(JSON.parse(savedGuest));
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [lang]);

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/vip-codes');
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      } else {
        setCodes(SEED_CODES);
      }
    } catch (err) {
      console.error(err);
      setCodes(SEED_CODES);
    }
  };

  const handleGuestLogin = async () => {
    setIsAuthLoading(true);
    const guestUid = `guest-${Math.random().toString(36).substring(2, 9)}`;
    const guestUser = {
      uid: guestUid,
      email: `${guestUid}@ah-vip.com`,
      displayName: lang === 'ar' ? 'عضو زائر VIP' : 'VIP Guest Member',
      isGuest: true
    };
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: guestUser.uid, email: guestUser.email })
      });
      if (res.ok) {
        localStorage.setItem('ah_guest_session', JSON.stringify(guestUser));
        setCurrentUser(guestUser);
      } else {
        localStorage.setItem('ah_guest_session', JSON.stringify(guestUser));
        setCurrentUser(guestUser);
      }
    } catch (e) {
      console.error('Error registering guest:', e);
      localStorage.setItem('ah_guest_session', JSON.stringify(guestUser));
      setCurrentUser(guestUser);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Load codes and session on init
  useEffect(() => {
    fetchCodes();

    const storedSession = localStorage.getItem('ah_vip_active_session');
    if (storedSession) {
      setActivatedCode(storedSession);
      setCurrentView('generator');
    }
  }, []);

  const handleUpdateCodes = (updatedCodes: VipCode[]) => {
    setCodes(updatedCodes);
  };

  const handleActivateCode = (codeStr: string) => {
    fetchCodes();
    setActivatedCode(codeStr);
    localStorage.setItem('ah_vip_active_session', codeStr);
    setCurrentView('generator');
  };

  const handleLockSession = () => {
    setActivatedCode(null);
    localStorage.removeItem('ah_vip_active_session');
    setCurrentView('gate');
  };

  // Secret admin logo tapping mechanism
  const handleLogoClick = () => {
    const now = Date.now();
    // Allow up to 1.5 seconds between clicks
    if (now - lastClickTime < 1500) {
      const nextCount = clickCount + 1;
      if (nextCount >= 3) {
        // Double security barrier & visual cue
        setClickCount(0);
        setLastClickTime(0);
        setFlashActive(true);
        setTimeout(() => {
          setFlashActive(false);
          setCurrentView('admin');
        }, 400);
      } else {
        setClickCount(nextCount);
        setLastClickTime(now);
      }
    } else {
      setClickCount(1);
      setLastClickTime(now);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-gradient text-white relative overflow-x-hidden font-sans pb-16 selection:bg-brand-primary selection:text-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Screen Flash feedback on admin entry */}
      <AnimatePresence>
        {flashActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 pointer-events-none flex items-center justify-center"
          >
            <div className="bg-brand-primary text-brand-bg font-bold px-6 py-4 rounded-xl text-lg glow-primary animate-bounce shadow-2xl">
              ⚡ ACCESSING SECURE SYSTEM ⚡
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-brand-secondary/15 blur-[90px] animate-orb-1" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brand-primary/10 blur-[100px] animate-orb-2" />
        <div className="absolute top-[50%] left-[20%] w-[250px] h-[250px] rounded-full bg-brand-accent/8 blur-[80px] animate-orb-3" />
        
        {/* Cathode scan line overlay */}
        <div className="absolute inset-0 scan-line pointer-events-none opacity-20" />
      </div>
      {/* Main Container (Centered, 520px limit) */}
      <div className="relative z-10 w-full max-w-[520px] mx-auto px-3 sm:px-5 pt-6 sm:pt-8 flex flex-col">
        {/* 1. Legendary Top Banner (Navbar) */}
        <div className="sticky top-3 z-40 w-full bg-brand-card/85 backdrop-blur-xl border border-brand-primary/25 rounded-[20px] sm:rounded-[24px] px-2 sm:px-4 py-2 flex items-center justify-between shadow-[0_4px_30px_rgba(36,232,255,0.15)] mb-6 sm:mb-8 transition-all duration-300 gap-1 sm:gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Miniature Holographic Cyber Hexagon Logo (Enlarged & outstanding) */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent opacity-60 cyber-hexagon animate-spin [animation-duration:10s] shadow-[0_0_15px_rgba(36,232,255,0.45)]" />
              <div className="absolute inset-[1.5px] bg-brand-bg cyber-hexagon" />
              
              <button 
                onClick={handleLogoClick}
                className="absolute inset-[3px] bg-gradient-to-br from-[#160c2d] via-brand-bg to-[#041d1a] flex flex-col items-center justify-center cyber-hexagon overflow-hidden group cursor-pointer"
                title="AH VIP"
              >
                <div className="absolute inset-0 w-full h-full metallic-shine pointer-events-none opacity-90" />
                <span className="text-[7.5px] sm:text-[8.5px] font-mono tracking-widest text-brand-primary font-black leading-none mt-[1px]">AH</span>
                <span className="text-[9.5px] sm:text-[11.5px] font-black tracking-tighter text-white mt-[1px] leading-none bg-clip-text bg-gradient-to-r from-white via-brand-secondary to-brand-primary drop-shadow-[0_1px_5px_rgba(36,232,255,0.5)]">VIP</span>
              </button>
            </div>

            <div className="flex flex-col hidden sm:flex">
              <span className="text-[14px] sm:text-[15px] font-sans font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-brand-primary leading-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] whitespace-nowrap">AH VIP</span>
              <span className="text-[8px] sm:text-[9px] text-brand-primary font-extrabold tracking-[0.12em] uppercase leading-none mt-1 sm:mt-1.5 animate-pulse whitespace-nowrap">
                {lang === 'ar' ? 'النظام العالمي' : 'WORLDWIDE SYSTEM'}
              </span>
            </div>
          </div>

          {/* Cairo Time Clock & Actions */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 overflow-visible">
            {/* Modern High-Tech Digital Clock with Live Pulse */}
            <div className="flex flex-col items-center justify-center bg-brand-bg/90 px-2 sm:px-3 py-[4px] sm:py-[6px] rounded-[10px] sm:rounded-[16px] border border-brand-primary/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)] min-w-[70px] sm:min-w-[95px] shrink-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand-primary shadow-[0_0_8px_rgba(36,232,255,0.8)]" />
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-mono font-black text-brand-primary tracking-wide leading-none">{egyptTime}</span>
              </div>
              <span className="text-[6.5px] sm:text-[7.5px] font-mono text-gray-400 tracking-widest uppercase mt-[3px] font-bold whitespace-nowrap leading-none">
                {lang === 'ar' ? 'توقيت القاهرة' : 'CAIRO TIME'}
              </span>
            </div>

            {/* Circular Telegram Channel Icon with Premium Glow */}
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

            {/* Premium Language Switch Button */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 shrink-0 rounded-full bg-brand-card/90 hover:bg-[#121c3b] border border-white/10 hover:border-brand-primary/40 text-gray-300 hover:text-brand-primary hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer text-[9px] sm:text-[10px] font-black shadow-md tracking-wider"
            >
              <span className="shrink-0 leading-none">{lang === 'ar' ? 'EN' : 'عربي'}</span>
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-primary animate-pulse shrink-0" />
            </button>
          </div>
        </div>

        {/* 1.5 Sub-bar User Profile Info */}
        {currentUser && (
          <div className="w-full bg-brand-card/60 backdrop-blur-xl border border-brand-primary/15 rounded-[20px] px-5 py-3 flex items-center justify-between text-xs mb-6 shadow-lg shadow-black/10">
            <span className="text-[10.5px] text-gray-300 font-semibold truncate max-w-[280px]">
              {lang === 'ar' ? '👤 العضو:' : '👤 Member:'} <span className="text-brand-primary font-extrabold">{currentUser.displayName || currentUser.email}</span>
            </span>
            <button
              onClick={async () => {
                localStorage.removeItem('ah_guest_session');
                try {
                  await signOut(auth);
                } catch (e) {
                  console.error('Sign out error:', e);
                }
                setCurrentUser(null);
              }}
              className="text-[10px] text-brand-accent hover:text-brand-accent/80 font-black cursor-pointer uppercase tracking-wider underline decoration-brand-accent/40 hover:decoration-brand-accent transition-colors duration-200"
            >
              {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          </div>
        )}

        {/* 3. Main Title Section */}
        {currentView !== 'admin' && (
          <div className="text-center mb-10 px-3">
            <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-white leading-tight">
              {lang === 'ar' ? (
                <>
                  مولد إشارات <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400 font-black drop-shadow-[0_2px_10px_rgba(36,232,255,0.15)]">AH VIP</span>
                </>
              ) : (
                <>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400 font-black drop-shadow-[0_2px_10px_rgba(36,232,255,0.15)]">AH VIP</span> Signal Generator
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-3 font-sans leading-relaxed max-w-sm mx-auto font-medium">
              {lang === 'ar' 
                ? 'الجيل القادم من خوارزميات التداول الفورية خصيصاً لأعضاء النخبة' 
                : 'The next-generation live signals suite tailored for elite users.'}
            </p>
            
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-brand-accent/15 via-brand-secondary/25 to-brand-primary/15 border border-brand-accent/30 shadow-md shadow-brand-accent/5 animate-pulse">
              <span className="text-[11px] sm:text-xs font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-accent to-brand-primary tracking-wide">
                {lang === 'ar' ? '⚡️ صفقات زمنية نارية وحصرية ⚡️' : '⚡️ High-Octane Timed Deals ⚡️'}
              </span>
            </div>
          </div>
        )}

        {/* View Router */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isAuthLoading ? 'loading' : !currentUser ? 'auth' : currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {isAuthLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-11 h-11 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(36,232,255,0.2)]" />
                <p className="text-[10px] text-gray-400 mt-5 font-mono tracking-widest uppercase">CONNECTING SECURE NETWORKS...</p>
              </div>
            ) : !currentUser ? (
              <div className="w-full glass-panel p-7 sm:p-9 rounded-[20px] border border-brand-primary/30 shadow-2xl relative overflow-hidden text-center bg-brand-card/85 backdrop-blur-2xl shadow-brand-primary/5">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-primary/30 rounded-tl-[20px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-primary/30 rounded-tr-[20px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-primary/30 rounded-bl-[20px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-primary/30 rounded-br-[20px] pointer-events-none" />
                
                {/* Abstract glowing decorations */}
                <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

                <Shield className="w-12 h-12 text-brand-primary mx-auto mb-5 animate-pulse drop-shadow-[0_0_10px_rgba(36,232,255,0.4)]" />
                <h3 className="text-xl font-black text-white mb-3 font-sans tracking-tight">
                  {lang === 'ar' ? 'بوابة التحقق المشفرة' : 'Encrypted Identity Verification'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-8 leading-relaxed font-sans font-semibold max-w-sm mx-auto">
                  {lang === 'ar' 
                    ? 'يرجى تفعيل الاتصال الآمن بقاعدة البيانات لتشغيل مولد الإشارات التفاعلي.' 
                    : 'Please initialize a secure connection to the real-time database to unlock the signals engine.'}
                </p>

                {/* Primary: Direct Secure Connection (Guest Access, 100% iframe-compatible) */}
                <button
                  onClick={handleGuestLogin}
                  className="w-full py-4 rounded-[20px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary hover:brightness-110 transform hover:-translate-y-1 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(36,232,255,0.4)] text-brand-bg font-black transition-all duration-300 cursor-pointer text-sm shadow-lg border border-brand-primary/40 tracking-wider font-sans flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-4.5 h-4.5 text-brand-bg animate-pulse" />
                  <span>{lang === 'ar' ? 'اتصال مباشر وآمن وسريع 🚀' : 'Fast Direct Secure Connection 🚀'}</span>
                </button>
              </div>
            ) : (
              <>
                {currentView === 'gate' && (
                  <CodeGate 
                    onActivate={handleActivateCode} 
                    lang={lang} 
                    codes={codes} 
                  />
                )}

                {currentView === 'generator' && activatedCode && (
                  <SignalGenerator 
                    activatedCode={activatedCode} 
                    onLockSession={handleLockSession} 
                    lang={lang} 
                    codes={codes}
                  />
                )}

                {currentView === 'admin' && (
                  <AdminPanel 
                    onClose={() => setCurrentView(activatedCode ? 'generator' : 'gate')} 
                    lang={lang} 
                    codes={codes} 
                    onUpdateCodes={handleUpdateCodes} 
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Main Global Footer */}
        <footer className="relative z-10 w-full text-center mt-16 text-gray-500 text-xs font-sans border-t border-white/5 pt-8 pb-6">
          <p className="tracking-wide text-[11px] font-semibold text-gray-400">
            {lang === 'ar' ? 'AH VIP Signal Generator | © جميع الحقوق محفوظة 2026' : 'AH VIP Signal Generator | © All Rights Reserved 2026'}
          </p>
          <p className="text-[9px] text-gray-600 mt-2 uppercase tracking-widest font-black">
            Powered by Digital Luxury Signals Core V2
          </p>
          
          {/* Luxurious Owner Signature Badge */}
          <div className="mt-5 flex flex-col items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-primary/10 via-brand-secondary/5 to-brand-primary/10 border border-brand-primary/30 shadow-lg shadow-brand-primary/5 hover:border-brand-primary/50 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[9px] text-brand-primary font-extrabold tracking-widest uppercase font-mono">
                {lang === 'ar' ? 'المالك: أنس بيك 👑' : 'OWNER: ANAS BIK 👑'}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-primary/10 via-brand-secondary/5 to-brand-primary/10 border border-brand-primary/30 shadow-lg shadow-brand-primary/5 hover:border-brand-primary/50 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[9px] text-brand-primary font-extrabold tracking-widest uppercase font-mono">
                {lang === 'ar' ? 'المالك: حازم بيك 👑' : 'OWNER: HAZEM BIK 👑'}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
