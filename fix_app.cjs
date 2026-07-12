const fs = require('fs');
let code = fs.readFileSync('src/MainUserApp.tsx', 'utf8');

// The file has two Dashboard functions now.
const match = code.match(/function Dashboard\([\s\S]*?(?=function Dashboard\()/);
if (match) {
    code = code.replace(match[0], '');
}

// Ensure there is only one Dashboard function.
fs.writeFileSync('src/MainUserApp.tsx', code);
console.log("Fixed double Dashboard");
