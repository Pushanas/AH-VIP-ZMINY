import { useState, useEffect, FormEvent } from 'react';
import { VipCode } from '../types';
import { copyToClipboard } from '../utils';
import { 
  Key, Shield, Copy, Check, Trash2, LogOut, 
  Plus, RefreshCw, Ticket, CheckCircle2, XCircle, Ban, Lock
} from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
  lang: 'ar' | 'en';
  codes: VipCode[];
  onUpdateCodes: (updatedCodes: VipCode[]) => void;
}

export default function AdminPanel({ onClose, lang, codes, onUpdateCodes }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [codeType, setCodeType] = useState<'single_use' | 'duration'>('single_use');
  const [durationDays, setDurationDays] = useState('7');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const t = {
    ar: {
      title: 'لوحة تحكم الأدمن VIP',
      sub: 'إدارة وتوليد أكواد التفعيل الحصرية لمنصة AH VIP',
      passTitle: 'تأكيد هوية الأدمن',
      passSub: 'يرجى إدخال كلمة مرور الإدارة لتأمين الوصول',
      passPlaceholder: 'أدخل كلمة المرور السرية',
      authBtn: 'دخول للوحة التحكم',
      invalidPass: 'كلمة مرور غير صحيحة، يرجى المحاولة مرة أخرى.',
      statsTitle: 'إحصائيات الأكواد',
      total: 'إجمالي الأكواد',
      active: 'نشط وغير مستخدم',
      used: 'مستخدم بالكامل',
      disabled: 'معطّل ومحذوف',
      genTitle: 'توليد كود تفعيل جديد',
      singleUse: 'صلاحية لمرة واحدة',
      duration: 'صلاحية لعدد من الأيام',
      daysNum: 'عدد الأيام للصلاحية',
      genBtn: 'توليد كود جديد',
      tableCode: 'الكود',
      tableType: 'النوع',
      tableCreated: 'تاريخ الإنشاء',
      tableExpiry: 'تاريخ الانتهاء',
      tableStatus: 'الحالة',
      tableActions: 'الإجراءات',
      copy: 'نسخ',
      copied: 'تم النسخ!',
      delete: 'حذف',
      disable: 'تعطيل',
      enable: 'تفعيل',
      noCodes: 'لا توجد أكواد تفعيل حالياً. ابدأ بتوليد كود جديد.',
      exitBtn: 'خروج من الإدارة',
      status_active: 'نشط',
      status_used: 'مستعمل',
      status_expired: 'منتهي الصلاحية',
      status_disabled: 'معطل',
      codeType_single: 'استخدام واحد',
      codeType_duration: 'صلاحية مؤقتة'
    },
    en: {
      title: 'VIP Admin Control Panel',
      sub: 'Manage and generate exclusive activation codes for AH VIP',
      passTitle: 'Verify Admin Identity',
      passSub: 'Please enter the administration password to secure access',
      passPlaceholder: 'Enter secret passcode',
      authBtn: 'Authenticate Access',
      invalidPass: 'Invalid passcode, please try again.',
      statsTitle: 'Codes Statistics',
      total: 'Total Codes',
      active: 'Active & Unused',
      used: 'Fully Used',
      disabled: 'Disabled / Revoked',
      genTitle: 'Generate New Code',
      singleUse: 'Single Use Limit',
      duration: 'Duration (Days)',
      daysNum: 'Number of Days',
      genBtn: 'Generate Unique Code',
      tableCode: 'Activation Code',
      tableType: 'Type',
      tableCreated: 'Created At',
      tableExpiry: 'Expires At',
      tableStatus: 'Status',
      tableActions: 'Actions',
      copy: 'Copy',
      copied: 'Copied!',
      delete: 'Delete',
      disable: 'Disable',
      enable: 'Enable',
      noCodes: 'No activation codes found. Start by generating one.',
      exitBtn: 'Exit Admin Panel',
      status_active: 'Active',
      status_used: 'Used',
      status_expired: 'Expired',
      status_disabled: 'Disabled',
      codeType_single: 'Single Use',
      codeType_duration: 'Timed Access'
    }
  };

  const currentT = t[lang];

  // Default super passcode
  const adminPasscode = 'AHVIP2026';

  const handleAuthenticate = (e: FormEvent) => {
    e.preventDefault();
    if (passcode === adminPasscode) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg(currentT.invalidPass);
    }
  };

  const handleGenerateCode = async () => {
    const randomHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedCode = `AHVIP-${randomHex()}-${randomHex()}`;
    
    let expiresAt: string | null = null;
    if (codeType === 'duration') {
      const days = parseInt(durationDays) || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      expiresAt = expiryDate.toISOString();
    }

    try {
      const response = await fetch('/api/vip-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: generatedCode,
          type: codeType,
          durationDays: codeType === 'duration' ? parseInt(durationDays) || 7 : 0,
          expiresAt: expiresAt,
          maxUses: codeType === 'single_use' ? 1 : 99999,
        }),
      });

      if (response.ok) {
        const newCode = await response.json();
        onUpdateCodes([newCode, ...codes]);
      }
    } catch (err) {
      console.error('Failed to generate VIP code on server:', err);
    }
  };

  const handleCopy = (code: string) => {
    copyToClipboard(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (codeStr: string) => {
    const codeObj = codes.find(c => c.code === codeStr);
    if (!codeObj) return;

    const nextStatus = codeObj.status === 'active' ? 'disabled' : 'active';

    try {
      const response = await fetch(`/api/vip-codes/${codeStr}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        const updatedCode = await response.json();
        const updated = codes.map(c => c.code === codeStr ? updatedCode : c);
        onUpdateCodes(updated);
      }
    } catch (err) {
      console.error(`Failed to toggle status for ${codeStr}:`, err);
    }
  };

  const handleDeleteCode = async (codeStr: string) => {
    try {
      const response = await fetch(`/api/vip-codes/${codeStr}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updated = codes.filter(c => c.code !== codeStr);
        onUpdateCodes(updated);
      }
    } catch (err) {
      console.error(`Failed to delete code ${codeStr}:`, err);
    }
  };

  // Stats calculation
  const totalCodes = codes.length;
  const activeCodes = codes.filter(c => c.status === 'active').length;
  const usedCodes = codes.filter(c => c.status === 'used').length;
  const disabledCodes = codes.filter(c => c.status === 'disabled').length;

  if (!isAuthenticated) {
    return (
      <div className="w-full">
        <div className="glass-panel p-6 sm:p-8 rounded-[24px] border-brand-fuchsia/20 shadow-xl relative overflow-hidden">
          {/* Cyberpunk corner bracket markings */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-fuchsia/20 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-fuchsia/20 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-fuchsia/20 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-fuchsia/20 rounded-br-xl pointer-events-none" />

          {/* Abstract glowing decorations */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-fuchsia/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center mb-6 relative">
            <div className="p-4 rounded-2xl bg-brand-fuchsia/10 border border-brand-fuchsia/20 mb-4 animate-pulse text-brand-fuchsia">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-silver to-white text-center tracking-tight font-sans glow-text-silver">
              {currentT.passTitle}
            </h2>
            <p className="text-gray-300 text-xs text-center mt-3 font-sans font-medium">
              {currentT.passSub}
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-5 relative">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={currentT.passPlaceholder}
                className="w-full px-4 py-3.5 rounded-xl glass-input text-center text-sm tracking-widest placeholder:tracking-normal font-mono font-bold"
                autoFocus
              />
              {errorMsg && (
                <p className="text-brand-fuchsia text-[11px] mt-3 text-center font-bold animate-shake bg-brand-fuchsia/5 py-2 px-3 rounded-lg border border-brand-fuchsia/10">
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-fuchsia via-[#8B1E9A] to-brand-fuchsia hover:brightness-110 active:scale-[0.98] text-white font-extrabold transition-all duration-300 cursor-pointer text-sm shadow-md border border-brand-fuchsia/30 tracking-wider font-sans"
            >
              {currentT.authBtn}
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-4 py-2 text-xs text-gray-400 hover:text-brand-teal font-sans font-bold transition-all duration-200 cursor-pointer"
          >
            {lang === 'ar' ? '← الرجوع للخلف' : '← Back to main'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Admin header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 glass-panel p-6 rounded-2xl border-brand-teal/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-brand-teal" />
            <span className="text-xs font-mono font-bold text-brand-teal uppercase tracking-widest">
              SECURE ADMIN SPACE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight glow-text-teal">
            {currentT.title}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {currentT.sub}
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-fuchsia/10 hover:bg-brand-fuchsia/20 text-brand-fuchsia border border-brand-fuchsia/30 hover:border-brand-fuchsia/60 transition-all duration-300 cursor-pointer font-sans text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          {currentT.exitBtn}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border-brand-teal/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-sans">{currentT.total}</p>
            <p className="text-3xl font-extrabold text-white mt-1 font-mono">{totalCodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-brand-teal/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-sans">{currentT.active}</p>
            <p className="text-3xl font-extrabold text-brand-teal mt-1 font-mono">{activeCodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-brand-teal/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-sans">{currentT.used}</p>
            <p className="text-3xl font-extrabold text-brand-fuchsia mt-1 font-mono">{usedCodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-fuchsia/10 border border-brand-fuchsia/20 text-brand-fuchsia">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-brand-teal/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-sans">{currentT.disabled}</p>
            <p className="text-3xl font-extrabold text-gray-400 mt-1 font-mono">{disabledCodes}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400">
            <Ban className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Code Generator Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border-brand-teal/30 h-fit">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
            <Plus className="w-5 h-5 text-brand-teal" />
            <h2 className="text-lg font-bold text-white">{currentT.genTitle}</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs text-gray-400 mb-2 font-sans">
                {lang === 'ar' ? 'نوع الكود وصلاحيته' : 'Code validity type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodeType('single_use')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-300 ${
                    codeType === 'single_use'
                      ? 'bg-brand-teal/20 border-brand-teal text-brand-teal'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {currentT.singleUse}
                </button>
                <button
                  type="button"
                  onClick={() => setCodeType('duration')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-300 ${
                    codeType === 'duration'
                      ? 'bg-brand-teal/20 border-brand-teal text-brand-teal'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {currentT.duration}
                </button>
              </div>
            </div>

            {codeType === 'duration' && (
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-sans">
                  {currentT.daysNum}
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input font-mono text-sm"
                />
              </div>
            )}

            <button
              onClick={handleGenerateCode}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-brand-teal to-blue-600 hover:from-brand-teal/80 hover:to-blue-600/80 text-white font-semibold transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-teal/20 border border-brand-teal/40 font-sans text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              {currentT.genBtn}
            </button>
          </div>
        </div>

        {/* Existing Codes Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-brand-teal/20">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">
              {lang === 'ar' ? 'الأكواد النشطة والتاريخ' : 'Generated Codes Inventory'}
            </h2>
            <span className="text-xs font-mono bg-brand-teal/10 text-brand-teal px-2 py-1 rounded">
              {codes.length} {lang === 'ar' ? 'كود' : 'codes'}
            </span>
          </div>

          {codes.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500">
              <Ticket className="w-12 h-12 mb-3 opacity-35 text-brand-teal" />
              <p className="font-sans text-sm max-w-sm">{currentT.noCodes}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-mono tracking-wider uppercase text-gray-400">
                    <th className="py-3 px-4 text-left">{currentT.tableCode}</th>
                    <th className="py-3 px-4 text-center">{currentT.tableType}</th>
                    <th className="py-3 px-4 text-center">{currentT.tableStatus}</th>
                    <th className="py-3 px-4 text-right">{currentT.tableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {codes.map((c) => {
                    const isCopied = copiedCode === c.code;
                    return (
                      <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="select-all text-sm tracking-wider">{c.code}</span>
                            <button
                              onClick={() => handleCopy(c.code)}
                              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-brand-teal transition-all cursor-pointer"
                              title={currentT.copy}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-brand-teal" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5 font-sans">
                            {new Date(c.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-sans ${
                            c.type === 'single_use' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {c.type === 'single_use' ? currentT.codeType_single : `${c.durationDays} ${lang === 'ar' ? 'أيام' : 'days'}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                            c.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : c.status === 'used'
                              ? 'bg-brand-fuchsia/10 text-brand-fuchsia border border-brand-fuchsia/20'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            {c.status === 'active' ? currentT.status_active : c.status === 'used' ? currentT.status_used : currentT.status_disabled}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(c.code)}
                              className={`p-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all duration-200 ${
                                c.status === 'active'
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {c.status === 'active' ? currentT.disable : currentT.enable}
                            </button>
                            <button
                              onClick={() => handleDeleteCode(c.code)}
                              className="p-1.5 rounded-lg bg-brand-fuchsia/10 hover:bg-brand-fuchsia/20 text-brand-fuchsia border border-brand-fuchsia/20 hover:border-brand-fuchsia/40 transition-all cursor-pointer"
                              title={currentT.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
