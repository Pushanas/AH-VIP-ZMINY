import { useState, FormEvent } from 'react';
import { VipCode } from '../types';
import { ShieldCheck, Ticket, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface CodeGateProps {
  onActivate: (code: string) => void;
  lang: 'ar' | 'en';
  codes: VipCode[];
}

export default function CodeGate({ onActivate, lang, codes }: CodeGateProps) {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    ar: {
      title: 'بوابة تفعيل AH VIP',
      subtitle: 'أدخل كود تفعيل عضوية VIP للوصول الفوري للإشارات الفاخرة المضمونة',
      placeholder: 'مثال: AHVIP-XXXX-XXXX',
      btn: 'تفعيل العضوية والولوج',
      invalid: 'كود التفعيل المدخل غير صحيح أو غير متوفر حالياً.',
      expired: 'كود التفعيل هذا منتهي الصلاحية.',
      disabled: 'تم تعطيل هذا الكود من قبل مسؤول النظام.',
      used: 'تم استخدام هذا الكود ذو المرة الواحدة سابقاً.',
      errorTitle: 'فشل التفعيل',
      success: 'تم التحقق بنجاح! جاري تحضير الواجهة...'
    },
    en: {
      title: 'AH VIP Gate Activation',
      subtitle: 'Enter your exclusive VIP code to unlock the high-accuracy signals platform',
      placeholder: 'Format: AHVIP-XXXX-XXXX',
      btn: 'Activate VIP Access',
      invalid: 'The entered activation code is incorrect or does not exist.',
      expired: 'This activation code has expired.',
      disabled: 'This code has been suspended by the administrator.',
      used: 'This single-use code has already been redeemed.',
      errorTitle: 'Activation Failed',
      success: 'Verified successfully! Booting signals platform...'
    }
  };

  const currentT = t[lang];

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const trimmed = inputCode.trim().toUpperCase();
      const response = await fetch('/api/vip-codes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      if (!data.success) {
        if (data.errorType === 'disabled') {
          setErrorMsg(currentT.disabled);
        } else if (data.errorType === 'used') {
          setErrorMsg(currentT.used);
        } else if (data.errorType === 'expired') {
          setErrorMsg(currentT.expired);
        } else {
          setErrorMsg(currentT.invalid);
        }
        setIsLoading(false);
        return;
      }

      // Valid code!
      setIsLoading(false);
      onActivate(trimmed);
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === 'ar' ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'An error occurred while connecting to the server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="glass-panel p-6 sm:p-8 rounded-[24px] border-brand-teal/20 shadow-xl glow-teal relative overflow-hidden">
        {/* Cyberpunk corner bracket markings */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-teal/20 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-teal/20 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-teal/20 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-teal/20 rounded-br-xl pointer-events-none" />

        {/* Abstract glowing decorations */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-teal/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-brand-fuchsia/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-6 relative">
          <div className="p-4 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal mb-4 animate-pulse">
            <Ticket className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-silver to-white tracking-tight leading-tight glow-text-silver">
            {currentT.title}
          </h2>
          <p className="text-gray-300 text-xs mt-3 leading-relaxed max-w-sm font-sans font-medium">
            {currentT.subtitle}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5 relative">
          <div>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setErrorMsg('');
              }}
              placeholder={currentT.placeholder}
              className="w-full px-4 py-3.5 rounded-xl glass-input text-center text-sm tracking-wider font-mono placeholder:tracking-normal font-bold"
              disabled={isLoading}
              required
            />
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-brand-fuchsia/10 border border-brand-fuchsia/20 text-brand-fuchsia flex items-start gap-3 animate-shake">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-bold text-xs">{currentT.errorTitle}</p>
                <p className="text-[11px] mt-0.5 text-gray-300 font-sans leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-teal via-[#8B1E9A] to-brand-fuchsia hover:brightness-110 active:scale-[0.98] text-white font-extrabold transition-all duration-300 cursor-pointer text-sm shadow-md border border-brand-teal/30 tracking-wider flex items-center justify-center gap-2 overflow-hidden relative"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                {currentT.btn}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
