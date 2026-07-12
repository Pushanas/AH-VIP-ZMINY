const fs = require('fs');
let code = fs.readFileSync('src/MainUserApp.tsx', 'utf8');

// Remove the support link from Dashboard
code = code.replace(/<a[\s\S]*?href="https:\/\/t\.me\/AH_QUOTEX_SUPPORT"[\s\S]*?<\/a>/, '');

fs.writeFileSync('src/MainUserApp.tsx', code);
console.log("Removed support from dashboard");
