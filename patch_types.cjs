const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace("direction: 'CALL' | 'PUT';", "direction: 'CALL' | 'PUT';\n  id?: number;");
fs.writeFileSync('src/types.ts', code);
