import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, CheckCircle2, Search, Settings, RefreshCw, Key, Users, Copy, Trash2, CalendarPlus, PowerOff } from 'lucide-react';

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(() => {
        setIsAdmin(true);
        setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center font-['Cairo']" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#FF2F92]/30 border-t-[#FF2F92] rounded-full animate-spin shadow-[0_0_15px_rgba(255,47,146,0.5)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-[#FF2F92]/30 font-['Cairo'] relative" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF2F92]/20 via-[#030712] to-[#030712]" />
      </div>

      <div className="relative z-10 w-full min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col">
        {!isAdmin ? (
          <div className="flex-1 flex items-center justify-center">
            <AdminLogin onLogin={() => setIsAdmin(true)} />
          </div>
        ) : (
          <AdminDashboard onLogout={() => {
            fetch('/api/admin/logout', { method: 'POST' }).then(() => setIsAdmin(false));
          }} />
        )}
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        onLogin();
      } else {
        setError('كلمة المرور غير صحيحة');
      }
    } catch (e) {
      setError('خطأ في الاتصال');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm glass-panel p-8 rounded-3xl relative overflow-hidden border border-[#FF2F92]/30"
    >
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-[#FF2F92]/10 border border-[#FF2F92]/50 flex items-center justify-center">
          <Settings className="w-8 h-8 text-[#FF2F92]" />
        </div>
      </div>
      <h1 className="text-2xl font-black text-center mb-2">لوحة الإدارة</h1>
      <p className="text-sm text-gray-400 text-center mb-8">تسجيل الدخول للمسؤولين فقط</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full glass-input px-5 py-4 rounded-xl text-center text-lg focus:ring-2 focus:ring-[#FF2F92]/50 border-white/10"
        />
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-[#FF2F92]/20 hover:bg-[#FF2F92]/30 text-[#FF2F92] border border-[#FF2F92]/50 rounded-xl py-4 font-bold transition-all disabled:opacity-50"
        >
          {loading ? 'جاري التحقق...' : 'دخول'}
        </button>
      </form>
    </motion.div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState({ total: 0, active: 0, unused: 0, expired: 0, suspended: 0 });
  const [codes, setCodes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [genCount, setGenCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, codesRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/codes').then(r => r.json())
      ]);
      setStats(statsRes);
      setCodes(codesRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: genCount })
      });
      await fetchData();
      setGenCount(1);
    } catch (e) { }
    setLoading(false);
  };

  const handleAction = async (code: string, action: string, data?: any) => {
    try {
      if (action === 'delete') {
        if(!confirm('تأكيد الحذف؟')) return;
        await fetch(`/api/admin/codes/${code}`, { method: 'DELETE' });
      } else if (action === 'status') {
        await fetch(`/api/admin/codes/${code}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: data })
        });
      } else if (action === 'extend') {
        const days = prompt('عدد الأيام الإضافية:', '30');
        if (!days) return;
        await fetch(`/api/admin/codes/${code}/extend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: parseInt(days) })
        });
      }
      fetchData();
    } catch (e) { }
  };

  const filteredCodes = codes.filter(c => c.code.toLowerCase().includes(search.toLowerCase()) || (c.telegram_id && c.telegram_id.includes(search)));

  return (
    <div className="w-full flex flex-col gap-6">
      <header className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border-[#FF2F92]/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#090B1A] to-[#11182D] border border-[#FF2F92]/50 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-[#FF2F92]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">لوحة الإدارة - AH VIP</h1>
            <p className="text-xs text-gray-400">إدارة الاشتراكات والأكواد</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center gap-2 border border-white/10">
          <PowerOff className="w-4 h-4" /> خروج
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'الإجمالي', val: stats.total, color: 'text-white' },
          { label: 'فعال', val: stats.active, color: 'text-[#00FF95]' },
          { label: 'جديد', val: stats.unused, color: 'text-[#24E8FF]' },
          { label: 'منتهي', val: stats.expired, color: 'text-[#FF4D6D]' },
          { label: 'موقوف', val: stats.suspended, color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black mb-1">{s.val}</span>
            <span className={`text-xs font-bold ${s.color}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4">
          <h3 className="font-bold flex items-center gap-2"><Key className="w-4 h-4 text-[#24E8FF]" /> إنشاء أكواد جديدة</h3>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              min="1" max="100" 
              value={genCount} 
              onChange={e => setGenCount(parseInt(e.target.value) || 1)}
              className="w-20 glass-input px-3 py-2.5 rounded-xl text-center border-white/10"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-[#24E8FF]/20 hover:bg-[#24E8FF]/30 text-[#24E8FF] border border-[#24E8FF]/50 rounded-xl py-2.5 font-bold transition-all"
            >
              {loading ? 'جاري الإنشاء...' : 'توليد'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col gap-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-[#FF2F92]" /> الأكواد المسجلة</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="بحث بكود أو معرف..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full glass-input px-4 py-2 pr-9 rounded-xl text-sm border-white/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="pb-3 pr-2 font-bold">الكود</th>
                  <th className="pb-3 font-bold">الحالة</th>
                  <th className="pb-3 font-bold">المعرف</th>
                  <th className="pb-3 font-bold">الانتهاء</th>
                  <th className="pb-3 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-2 font-mono font-bold text-gray-300">{c.code}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        c.status === 'active' ? 'bg-[#00FF95]/10 text-[#00FF95]' :
                        c.status === 'unused' ? 'bg-[#24E8FF]/10 text-[#24E8FF]' :
                        c.status === 'expired' ? 'bg-[#FF4D6D]/10 text-[#FF4D6D]' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        {c.status === 'active' ? 'فعال' : c.status === 'unused' ? 'جديد' : c.status === 'expired' ? 'منتهي' : 'موقوف'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs">{c.telegram_id || '-'}</td>
                    <td className="py-3 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '-'}</td>
                    <td className="py-3 flex items-center gap-2">
                      <button onClick={() => {navigator.clipboard.writeText(c.code)}} className="p-1.5 bg-white/5 rounded hover:bg-white/10 text-gray-400"><Copy className="w-3.5 h-3.5" /></button>
                      
                      {c.status === 'active' && <button onClick={() => handleAction(c.code, 'status', 'suspended')} className="p-1.5 bg-orange-500/10 rounded hover:bg-orange-500/20 text-orange-400" title="إيقاف">إيقاف</button>}
                      {c.status === 'suspended' && <button onClick={() => handleAction(c.code, 'status', 'active')} className="p-1.5 bg-[#00FF95]/10 rounded hover:bg-[#00FF95]/20 text-[#00FF95]" title="تفعيل">تفعيل</button>}
                      
                      {(c.status === 'active' || c.status === 'expired') && (
                        <button onClick={() => handleAction(c.code, 'extend')} className="p-1.5 bg-[#24E8FF]/10 rounded hover:bg-[#24E8FF]/20 text-[#24E8FF]" title="تمديد"><CalendarPlus className="w-3.5 h-3.5" /></button>
                      )}

                      <button onClick={() => handleAction(c.code, 'delete')} className="p-1.5 bg-red-500/10 rounded hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
                {filteredCodes.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-500">لا توجد أكواد مطابقة</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
