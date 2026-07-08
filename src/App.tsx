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
    <div className="min-h-screen bg-mesh-gradient text-white relative overflow-x-hidden font-sans pb-16 selection:bg-brand-teal selection:text-brand-purple" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
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
            <div className="bg-brand-teal text-brand-purple font-bold px-6 py-4 rounded-xl text-lg glow-teal animate-bounce shadow-2xl">
              ⚡ ACCESSING SECURE SYSTEM ⚡
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-brand-purple/15 blur-[90px] animate-orb-1" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brand-indigo/25 blur-[100px] animate-orb-2" />
        <div className="absolute top-[50%] left-[20%] w-[250px] h-[250px] rounded-full bg-brand-fuchsia/8 blur-[80px] animate-orb-3" />
        
        {/* Cathode scan line overlay */}
        <div className="absolute inset-0 scan-line pointer-events-none opacity-20" />
      </div>

      {/* Main Container (Centered, 520px limit) */}
      <div className="relative z-10 w-full max-w-[520px] mx-auto px-5 pt-6 flex flex-col">
        {/* 1. Top Language Pill */}
        <div className="flex justify-between items-center mb-4">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-semibold max-w-[180px] truncate">
                {lang === 'ar' ? 'مرحباً،' : 'Hello,'} {currentUser.displayName || currentUser.email}
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
                className="text-[10px] text-brand-fuchsia hover:text-brand-fuchsia/80 font-bold cursor-pointer underline"
              >
                {lang === 'ar' ? 'خروج' : 'Log Out'}
              </button>
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c1023]/90 hover:bg-brand-teal/10 border border-brand-teal/20 text-xs text-gray-300 hover:text-brand-teal transition-all duration-300 cursor-pointer font-bold shadow-md"
          >
            <Globe className="w-3.5 h-3.5 text-brand-teal" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>

        {/* 2. Compact Hero Card & 3. Main Title Section */}
        {currentView !== 'admin' && (
          <>
            <div className="w-full bg-[#0c1023]/80 border border-brand-teal/20 rounded-[28px] p-6 text-center shadow-xl glow-teal relative overflow-hidden mb-6">
              {/* Subtle background glow element */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-teal/10 rounded-full blur-xl pointer-events-none" />
              
              {/* Logo container */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 flex items-center justify-center mb-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-teal to-brand-fuchsia opacity-40 cyber-hexagon animate-spin [animation-duration:15s]" />
                  <div className="absolute inset-[2px] bg-[#0c1023] cyber-hexagon" />
                  
                  <button
                    onClick={handleLogoClick}
                    className="absolute inset-[4px] bg-gradient-to-br from-[#12091F] to-[#070A18] flex flex-col items-center justify-center border border-brand-teal/30 hover:border-brand-teal transition-all duration-300 cursor-pointer cyber-hexagon overflow-hidden group"
                    title="AH VIP"
                  >
                    <div className="absolute inset-0 w-full h-full metallic-shine pointer-events-none opacity-85" />
                    <span className="text-[10px] font-mono tracking-widest text-brand-teal font-extrabold leading-none">AH</span>
                    <span className="text-sm font-extrabold tracking-tighter text-white mt-0.5 leading-none">VIP</span>
                  </button>
                </div>
                
                <h2 className="text-md font-mono tracking-widest text-brand-teal font-extrabold leading-none">
                  AH SYSTEM
                </h2>
                <p className="text-[11px] text-gray-400 mt-1 font-sans font-semibold">
                  {lang === 'ar' ? 'إشارات حية' : 'Live Signals'}
                </p>

                {/* Live Cairo time status pill */}
                <div className="mt-4 inline-flex items-center gap-2 bg-[#070a18]/70 px-4 py-1.5 rounded-full border border-brand-teal/20 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                  <span className="text-[11px] font-sans text-gray-300 font-semibold">
                    {lang === 'ar' ? 'توقيت القاهرة 🇪🇬 :' : 'Cairo Time 🇪🇬 :'}
                  </span>
                  <span className="text-xs font-mono text-brand-teal font-extrabold tracking-wide">{egyptTime}</span>
                </div>
              </div>
            </div>

            {/* 3. Main Title Section */}
            <div className="text-center mb-8 px-2">
              <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white leading-tight">
                {lang === 'ar' ? (
                  <>
                    مولد إشارات <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-blue-400 font-black">AH VIP</span>
                  </>
                ) : (
                  <>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-blue-400 font-black">AH VIP</span> Signal Generator
                  </>
                )}
              </h1>
              <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed max-w-sm mx-auto">
                {lang === 'ar' 
                  ? 'الجيل القادم من خوارزميات التداول الفورية خصيصاً لأعضاء النخبة' 
                  : 'The next-generation live signals suite tailored for elite users.'}
              </p>
              
              <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-fuchsia/10 via-brand-purple/20 to-brand-teal/10 border border-brand-fuchsia/20 shadow-sm animate-pulse">
                <span className="text-[11px] font-extrabold font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-fuchsia to-brand-teal tracking-wide">
                  {lang === 'ar' ? '⚡️ صفقات زمنية نارية وحصرية ⚡️' : '⚡️ High-Octane Timed Deals ⚡️'}
                </span>
              </div>
            </div>
          </>
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
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400 mt-4 font-mono">CONNECTING SECURE NETWORKS...</p>
              </div>
            ) : !currentUser ? (
              <div className="w-full glass-panel p-6 sm:p-8 rounded-[24px] border border-brand-teal/20 shadow-xl relative overflow-hidden text-center bg-[#070a18]/90">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-teal/20 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-teal/20 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-teal/20 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-teal/20 rounded-br-xl pointer-events-none" />
                
                <Shield className="w-10 h-10 text-brand-teal mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-extrabold text-white mb-2 font-sans tracking-tight">
                  {lang === 'ar' ? 'بوابة التحقق المشفرة' : 'Encrypted Identity Verification'}
                </h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed font-sans font-semibold">
                  {lang === 'ar' 
                    ? 'يرجى تفعيل الاتصال الآمن بقاعدة البيانات لتشغيل مولد الإشارات التفاعلي.' 
                    : 'Please initialize a secure connection to the real-time database to unlock the signals engine.'}
                </p>

                {/* Primary: Direct Secure Connection (Guest Access, 100% iframe-compatible) */}
                <button
                  onClick={handleGuestLogin}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-teal via-[#138C84] to-brand-teal hover:brightness-110 active:scale-[0.98] text-brand-purple font-extrabold transition-all duration-300 cursor-pointer text-sm shadow-md border border-brand-teal/30 tracking-wider font-sans flex items-center justify-center gap-2 mb-4"
                >
                  <Sparkles className="w-4 h-4 text-brand-purple animate-pulse" />
                  <span>{lang === 'ar' ? 'اتصال مباشر وآمن وسريع 🚀' : 'Fast Direct Secure Connection 🚀'}</span>
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-white/5" />
                  <span className="px-3 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
                    {lang === 'ar' ? 'أو عبر غوغل' : 'OR VIA GOOGLE'}
                  </span>
                  <div className="flex-grow border-t border-white/5" />
                </div>

                {/* Secondary: Google login (Might have iframe/popup block limits) */}
                <button
                  onClick={async () => {
                    try {
                      await signInWithPopup(auth, googleAuthProvider);
                    } catch (err: any) {
                      console.error('Login error:', err);
                      // Fallback to guest login on any popup cancel/blocked error to ensure user is never locked out!
                      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-blocked') {
                        console.log('Popup blocked/cancelled. Auto-fallback to secure direct connection...');
                        await handleGuestLogin();
                      }
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#0c1023] hover:bg-[#121833] active:scale-[0.98] text-gray-300 hover:text-white font-extrabold transition-all duration-300 cursor-pointer text-xs border border-brand-fuchsia/20 tracking-wider font-sans flex items-center justify-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-brand-fuchsia" />
                  <span>{lang === 'ar' ? 'الدخول بحساب Google (تنبثق نافذة)' : 'Sign In with Google (Opens Popup)'}</span>
                </button>

                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed font-sans max-w-xs mx-auto">
                  {lang === 'ar' 
                    ? 'ملاحظة: إذا تسببت نافذة Google المنبثقة بخطأ بسبب المتصفح، سيتم تحويلك تلقائياً للاتصال المباشر الآمن.'
                    : 'Note: If the Google popup fails due to browser restrictions inside the iframe, the system automatically routes you via Fast Direct Secure Connection.'}
                </p>
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
        <footer className="relative z-10 w-full text-center mt-12 text-gray-500 text-xs font-sans border-t border-white/5 pt-6 pb-4">
          <p className="tracking-wide text-[11px] font-medium">
            {lang === 'ar' ? 'AH VIP Signal Generator | © جميع الحقوق محفوظة 2026' : 'AH VIP Signal Generator | © All Rights Reserved 2026'}
          </p>
          <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest font-bold">
            Powered by Digital Luxury Signals Core V2
          </p>
        </footer>
      </div>
    </div>
  );
}
