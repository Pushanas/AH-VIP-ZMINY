const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(/export interface VipCode \{[\s\S]*?status: 'active' \| 'used' \| 'expired' \| 'disabled';\n\}\n\n/, "");
fs.writeFileSync('src/types.ts', content);
