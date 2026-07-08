const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove handleLogoClick
content = content.replace(/  const handleLogoClick = \(\) => \{\n    const isSecret = confirm\("Enter VIP Code\?"\);\n    if \(isSecret\) alert\("VIP Systems online\."\);\n  \};\n\n/, "");

// Remove onClick from the logo
content = content.replace(/                onClick=\{handleLogoClick\}\n/g, "");
fs.writeFileSync('src/App.tsx', content);
