const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/\.get\(ip\)/g, '.get(ip) as any');
server = server.replace(/\.get\(code\)/g, '.get(code) as any');
server = server.replace(/\.get\(code, telegramId\)/g, '.get(code, telegramId) as any');
server = server.replace(/\.get\(\)\.count/g, '.get() as any).count');
server = server.replace(/db\.prepare\('SELECT COUNT\(\*\) as count FROM codes'\)/, '(db.prepare(\'SELECT COUNT(*) as count FROM codes\')');
server = server.replace(/db\.prepare\("SELECT COUNT\(\*\) as count FROM codes WHERE status = 'active'"\)/, '(db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = \'active\'")');
server = server.replace(/db\.prepare\("SELECT COUNT\(\*\) as count FROM codes WHERE status = 'unused'"\)/, '(db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = \'unused\'")');
server = server.replace(/db\.prepare\("SELECT COUNT\(\*\) as count FROM codes WHERE status = 'expired'"\)/, '(db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = \'expired\'")');
server = server.replace(/db\.prepare\("SELECT COUNT\(\*\) as count FROM codes WHERE status = 'suspended'"\)/, '(db.prepare("SELECT COUNT(*) as count FROM codes WHERE status = \'suspended\'")');
server = server.replace(/\.all\(\)/g, '.all() as any[]');
server = server.replace(/req\.user = payload/g, '(req as any).user = payload');
server = server.replace(/req\.user;/g, '(req as any).user;');
server = server.replace(/payload\.role/g, '(payload as any).role');
fs.writeFileSync('server.ts', server);

let mainApp = fs.readFileSync('src/MainUserApp.tsx', 'utf8');
mainApp = mainApp.replace(/e: React\.FormEvent/g, 'e: any');
mainApp = mainApp.replace(/\{ onLogin \}: \{ onLogin: \(data: any\) => void \}/, '{ onLogin }: { key?: string, onLogin: (data: any) => void }');
mainApp = mainApp.replace(/\{ session, serverTimeOffset, onLogout \}: \{ session: any, serverTimeOffset: number, onLogout: \(\) => void \}/, '{ session, serverTimeOffset, onLogout }: { key?: string, session: any, serverTimeOffset: number, onLogout: () => void }');
fs.writeFileSync('src/MainUserApp.tsx', mainApp);

let adminPanel = fs.readFileSync('src/AdminPanel.tsx', 'utf8');
adminPanel = adminPanel.replace(/e: React\.FormEvent/g, 'e: any');
fs.writeFileSync('src/AdminPanel.tsx', adminPanel);

console.log('Patched');
