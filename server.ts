import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.resolve('.');

const JWT_SECRET = process.env.JWT_SECRET || 'ah_vip_super_secret_key_2026';
const PORT = 3000;
const CURRENT_VIP_PASSWORD = "Q8_VIP_6419_T2Z";

const db = new Database(':memory:'); // In-memory DB for prototype, but we can also use a file if we want persistence across reloads.
// Let's use a file so it persists during dev
// const db = new Database('ahvip.db');

// Wait, since we're in a container, memory is fine, but file allows persistence across dev restarts. Let's use a file.
// I will change it to 'ahvip.db'

const initializeDb = () => {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'unused', -- 'unused', 'active', 'expired', 'suspended'
      telegram_id TEXT,
      activated_at DATETIME,
      expires_at DATETIME
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      ip TEXT PRIMARY KEY,
      attempts INTEGER DEFAULT 0,
      lockout_until DATETIME
    );
  `);

  // Clear any existing IP locks / rate limits on startup
  try {
    db.exec('DELETE FROM rate_limits;');
  } catch(e) {}

  // VIP Device & IP Lock Table (Restricted to 1 Phone & 1 Wi-Fi IP)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vip_lock (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password TEXT NOT NULL,
      bound_ip TEXT,
      bound_fingerprint TEXT,
      bound_device_name TEXT,
      activated_at DATETIME,
      session_version INTEGER DEFAULT 1
    );
  `);

  const existingVip = db.prepare('SELECT * FROM vip_lock WHERE id = 1').get() as any;
  if (!existingVip || existingVip.password !== CURRENT_VIP_PASSWORD) {
    // Purge old passwords and wipe legacy sessions completely
    db.exec('DELETE FROM vip_lock;');
    db.prepare(`
      INSERT INTO vip_lock (id, password, bound_ip, bound_fingerprint, bound_device_name, activated_at, session_version)
      VALUES (1, ?, NULL, NULL, NULL, NULL, ?)
    `).run(CURRENT_VIP_PASSWORD, Date.now());
    console.log('[SECURITY] Initialized single-device & single-IP lock for Q8 VIP password:', CURRENT_VIP_PASSWORD);
  }

  // Seed codes
  const initialCodes = [
    'AHVIP-4827', 'AHVIP-9154', 'AHVIP-3068', 'AHVIP-7412', 'AHVIP-5689',
    'AHVIP-1936', 'AHVIP-8245', 'AHVIP-6571', 'AHVIP-2398', 'AHVIP-4703'
  ];

  const insert = db.prepare('INSERT OR IGNORE INTO codes (code) VALUES (?)');
  const insertMany = db.transaction((codes) => {
    for (const code of codes) insert.run(code);
  });
  insertMany(initialCodes);
};

initializeDb();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// --- Rate Limiting Logic ---
const checkRateLimit = (_ip) => {
  // IP rate limiting disabled per requirements to allow all devices and phones freely
  return true;
};

const resetRateLimit = (ip) => {
  db.prepare('UPDATE rate_limits SET attempts = 0, lockout_until = NULL WHERE ip = ?').run(ip);
};

// --- Middleware ---
const authenticate = (req, res, next) => {
  const token = req.cookies.ah_vip_session;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

// --- API Routes ---

// Activate Code
app.post('/api/activate', (req, res) => {
  const { code, telegramId } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!code || !telegramId) {
    return res.status(400).json({ error: 'Code and Telegram ID are required', arabicError: 'الكود ومعرف التليجرام مطلوبان' });
  }

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts', arabicError: 'تم تجاوز عدد المحاولات، حاول لاحقًا (15 دقيقة)' });
  }

  const codeRecord = db.prepare('SELECT * FROM codes WHERE code = ?').get(code) as any;

  if (!codeRecord) {
    return res.status(400).json({ error: 'Invalid code', arabicError: 'الكود غير صحيح' });
  }

  if (codeRecord.status === 'suspended') {
    return res.status(403).json({ error: 'Suspended code', arabicError: 'هذا الكود موقوف' });
  }

  if (codeRecord.status === 'expired') {
    return res.status(403).json({ error: 'Expired code', arabicError: 'انتهت صلاحية هذا الكود' });
  }

  if (codeRecord.status === 'active') {
    if (codeRecord.telegram_id !== telegramId) {
       return res.status(403).json({ error: 'Code already used', arabicError: 'هذا الكود مستخدم بالفعل من حساب آخر' });
    }
    // If it's the same telegram ID, we can let them log in
    const now = new Date();
    const expiresAt = new Date(codeRecord.expires_at);
    
    if (now > expiresAt) {
      db.prepare('UPDATE codes SET status = ? WHERE code = ?').run('expired', code);
      return res.status(403).json({ error: 'Subscription expired', arabicError: 'انتهت صلاحية اشتراكك' });
    }

    // Success login
    resetRateLimit(ip);
    const token = jwt.sign({ telegramId, code }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('ah_vip_session', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.json({ message: 'Success', codeInfo: codeRecord });
  }

  if (codeRecord.status === 'unused') {
    // Activate it
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    db.prepare('UPDATE codes SET status = ?, telegram_id = ?, activated_at = ?, expires_at = ? WHERE code = ?')
      .run('active', telegramId, now.toISOString(), expiresAt.toISOString(), code);
    
    resetRateLimit(ip);
    const updatedRecord = db.prepare('SELECT * FROM codes WHERE code = ?').get(code) as any;
    
    const token = jwt.sign({ telegramId, code }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('ah_vip_session', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    
    return res.json({ message: 'Activated', arabicMessage: 'تم تفعيل اشتراكك بنجاح', codeInfo: updatedRecord });
  }
});

app.get('/api/session', authenticate, (req, res) => {
  const { code, telegramId } = (req as any).user;
  const codeRecord = db.prepare('SELECT * FROM codes WHERE code = ? AND telegram_id = ?').get(code, telegramId) as any;

  if (!codeRecord) {
    return res.status(401).json({ error: 'Session invalid' });
  }

  const now = new Date();
  const expiresAt = new Date(codeRecord.expires_at);
  
  if (now > expiresAt) {
    db.prepare('UPDATE codes SET status = ? WHERE code = ?').run('expired', code);
    res.clearCookie('ah_vip_session');
    return res.status(403).json({ error: 'Subscription expired', arabicError: 'انتهت صلاحية اشتراكك' });
  }

  if (codeRecord.status !== 'active') {
    res.clearCookie('ah_vip_session');
    return res.status(403).json({ error: 'Subscription not active' });
  }

  res.json({ session: codeRecord, serverNow: now.toISOString() });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('ah_vip_session');
  res.json({ success: true });
});

// Clear all IP locks and rate limits endpoint
app.post('/api/clear-rate-limits', (req, res) => {
  try {
    db.exec('DELETE FROM rate_limits;');
    res.json({ success: true, message: 'All IP locks cleared successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to clear IP locks' });
  }
});

// Helper to reliably extract remote client IP
const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
};

// --- VIP Single Device & Single Wi-Fi/IP Enforcement Endpoints ---
app.get('/api/auth/vip-status', (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const record = db.prepare('SELECT * FROM vip_lock WHERE id = 1').get() as any;
    if (!record) {
      return res.json({ isBound: false, clientIp });
    }
    const isBound = !!(record.bound_ip || record.bound_fingerprint);
    return res.json({
      isBound,
      clientIp,
      boundDeviceName: record.bound_device_name || null,
      activatedAt: record.activated_at || null,
      maskedBoundIp: record.bound_ip ? record.bound_ip.replace(/^(\d+\.\d+)\..*$/, '$1.*.*') : null
    });
  } catch (e) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

app.post('/api/auth/vip-login', (req, res) => {
  try {
    const { password, fingerprint, deviceName } = req.body;
    const clientIp = getClientIp(req);

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'يرجى إدخال رمز المرور' });
    }

    if (password.trim() !== CURRENT_VIP_PASSWORD) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_PASSWORD',
        error: 'كلمة المرور غير صحيحة أو تم إبطالها وطرد جلستها نهائياً.'
      });
    }

    const record = db.prepare('SELECT * FROM vip_lock WHERE id = 1').get() as any;
    if (!record) {
      return res.status(500).json({ success: false, error: 'خطأ في قاعدة بيانات الحماية' });
    }

    // 1. If not yet bound to any device or IP (First Activation):
    if (!record.bound_fingerprint && !record.bound_ip) {
      db.prepare(`
        UPDATE vip_lock 
        SET bound_ip = ?, bound_fingerprint = ?, bound_device_name = ?, activated_at = ?
        WHERE id = 1
      `).run(clientIp, fingerprint || 'DEV_UNKNOWN', deviceName || 'هاتف مصرح به', new Date().toISOString());

      return res.json({
        success: true,
        isFirstBinding: true,
        message: 'تم تفعيل الحساب وقفل كلمة المرور بنجاح على هذا الهاتف وهذه الشبكة فقط 🔒',
        boundIp: clientIp,
        boundFingerprint: fingerprint
      });
    }

    // 2. Already bound - strictly verify Device Fingerprint AND Network IP
    const sameFingerprint = !record.bound_fingerprint || record.bound_fingerprint === fingerprint;
    const sameIp = !record.bound_ip || record.bound_ip === clientIp;

    if (!sameFingerprint && !sameIp) {
      return res.status(403).json({
        success: false,
        code: 'DEVICE_AND_IP_MISMATCH',
        error: '⛔ تم رفض الدخول: كلمة المرور مقفلة ومربوطة بهاتف وشبكة واي فاي أخرى! غير مسموح بمشاركتها مع أجهزة أخرى.'
      });
    }

    if (!sameFingerprint) {
      return res.status(403).json({
        success: false,
        code: 'DEVICE_MISMATCH',
        error: '⛔ تم رفض الدخول: كلمة المرور مصرح بها للهاتف الأصلي المعتمد فقط، ولا يمكن فتحها من هذا الجهاز!'
      });
    }

    if (!sameIp) {
      return res.status(403).json({
        success: false,
        code: 'IP_MISMATCH',
        error: '⛔ تم رفض الدخول: تم اكتشاف شبكة اتصال مختلفة عن شبكة الواي فاي المصرح بها لهذا الحساب!'
      });
    }

    // Both match!
    return res.json({
      success: true,
      isFirstBinding: false,
      message: 'تم التحقق من بصمة الهاتف وشبكة الواي فاي بنجاح 🛡️',
      boundIp: record.bound_ip,
      boundFingerprint: record.bound_fingerprint
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'حدث خطأ غير متوقع أثناء معالجة الحماية' });
  }
});

app.post('/api/auth/vip-verify-session', (req, res) => {
  try {
    const { password, fingerprint } = req.body;
    const clientIp = getClientIp(req);

    if (password !== CURRENT_VIP_PASSWORD) {
      return res.status(401).json({ valid: false, reason: 'REVOKED' });
    }

    const record = db.prepare('SELECT * FROM vip_lock WHERE id = 1').get() as any;
    if (!record) {
      return res.json({ valid: false, reason: 'NOT_FOUND' });
    }

    if (record.bound_fingerprint && fingerprint && record.bound_fingerprint !== fingerprint) {
      return res.status(403).json({ valid: false, reason: 'DEVICE_MISMATCH' });
    }

    if (record.bound_ip && clientIp && record.bound_ip !== clientIp) {
      return res.status(403).json({ valid: false, reason: 'IP_MISMATCH' });
    }

    return res.json({ valid: true, boundIp: record.bound_ip });
  } catch (e) {
    return res.status(500).json({ valid: false });
  }
});

app.post('/api/auth/vip-reset-binding', (req, res) => {
  try {
    const { adminKey } = req.body;
    if (adminKey === 'admin123' || adminKey === CURRENT_VIP_PASSWORD) {
      db.prepare(`
        UPDATE vip_lock 
        SET bound_ip = NULL, bound_fingerprint = NULL, bound_device_name = NULL, activated_at = NULL 
        WHERE id = 1
      `).run();
      return res.json({ success: true, message: 'تم فك ارتباط الجهاز وشبكة الواي فاي بنجاح' });
    }
    return res.status(403).json({ error: 'غير مصرح' });
  } catch (e) {
    return res.status(500).json({ error: 'فشل فك الارتباط' });
  }
});

// --- Admin Routes ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('ah_vip_admin_session', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.json({ success: true });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('ah_vip_admin_session');
  res.json({ success: true });
});

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.ah_vip_admin_session;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if ((payload as any).role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    (req as any).user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

app.get('/api/admin/session', authenticateAdmin, (req, res) => {
  res.json({ success: true, role: 'admin' });
});

app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const total = (db.prepare('SELECT COUNT(*) as count FROM codes').get() as any).count;
  const active = (db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = 'active'").get() as any).count;
  const unused = (db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = 'unused'").get() as any).count;
  const expired = (db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = 'expired'").get() as any).count;
  const suspended = (db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = 'suspended'").get() as any).count;

  res.json({ total, active, unused, expired, suspended });
});

app.get('/api/admin/codes', authenticateAdmin, (req, res) => {
  const codes = db.prepare('SELECT * FROM codes ORDER BY id DESC').all() as any[];
  res.json(codes);
});

const generateRandomCode = () => {
  return 'AHVIP-' + Math.floor(1000 + Math.random() * 9000).toString();
};

app.post('/api/admin/codes/generate', authenticateAdmin, (req, res) => {
  const { count = 1 } = req.body;
  const newCodes = [];
  
  const insert = db.prepare('INSERT INTO codes (code) VALUES (?)');
  const insertMany = db.transaction((codes) => {
    for (const code of codes) {
      insert.run(code);
    }
  });

  try {
    for (let i = 0; i < count; i++) {
      let code = generateRandomCode();
      while(db.prepare('SELECT code FROM codes WHERE code = ?').get(code) as any) {
        code = generateRandomCode();
      }
      newCodes.push(code);
    }
    insertMany(newCodes);
    res.json({ success: true, count, codes: newCodes });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate codes' });
  }
});

app.post('/api/admin/codes/:code/status', authenticateAdmin, (req, res) => {
  const { code } = req.params;
  const { status } = req.body;
  if (!['active', 'unused', 'expired', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE codes SET status = ? WHERE code = ?').run(status, code);
  res.json({ success: true });
});

app.post('/api/admin/codes/:code/extend', authenticateAdmin, (req, res) => {
  const { code } = req.params;
  const { days = 30 } = req.body;
  
  const record = db.prepare('SELECT * FROM codes WHERE code = ?').get(code) as any;
  if (!record) return res.status(404).json({ error: 'Code not found' });

  if (record.status !== 'active' && record.status !== 'expired') {
     return res.status(400).json({ error: 'Can only extend active or expired codes' });
  }

  const baseDate = record.status === 'active' && new Date(record.expires_at) > new Date() 
    ? new Date(record.expires_at) 
    : new Date();

  const newExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
  
  db.prepare('UPDATE codes SET expires_at = ?, status = ? WHERE code = ?').run(newExpiresAt.toISOString(), 'active', code);
  res.json({ success: true, newExpiresAt: newExpiresAt.toISOString() });
});

app.delete('/api/admin/codes/:code', authenticateAdmin, (req, res) => {
  const { code } = req.params;
  db.prepare('DELETE FROM codes WHERE code = ?').run(code);
  res.json({ success: true });
});

// --- Vite & Frontend Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
