const fs = require('fs');
let code = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

// Remove the footer that has the owners names and copyright to clean up the UI
code = code.replace(/\{(\/\* 8\. Footer \*\/\s*<div[\s\S]*?)<\/div>\s*<\/div>\s*<\/motion\.div>/, '</div></motion.div>');
code = code.replace(/\{\/\* 8\. Footer \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/motion\.div>/, '</motion.div>');

// Remove another occurrence just in case
code = code.replace(/<div className="mt-8 pb-4 text-center space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/motion\.div>/, '</motion.div>');

fs.writeFileSync('src/components/SignalGenerator.tsx', code);
console.log("Patched SignalGenerator footer");
