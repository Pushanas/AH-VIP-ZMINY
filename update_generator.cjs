const fs = require('fs');
const content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

let newContent = content.replace(/import { ASSET_PAIRS, DIRECTIONS, Signal, VipCode } from '\.\.\/types';/, "import { ASSET_PAIRS, DIRECTIONS, Signal } from '../types';");

newContent = newContent.replace(/interface SignalGeneratorProps \{\n  activatedCode: string;\n  onLockSession: \(\) => void;\n  lang: 'ar' | 'en';\n  codes: VipCode\[\];\n\}/, "interface SignalGeneratorProps {\n  lang: 'ar' | 'en';\n}");

newContent = newContent.replace(/export default function SignalGenerator\(\{ activatedCode, onLockSession, lang, codes \}: SignalGeneratorProps\) \{/, "export default function SignalGenerator({ lang }: SignalGeneratorProps) {");

// Remove codeInfo and remainingHours logic
newContent = newContent.replace(/  const codeInfo = codes\.find\(c => c\.code\.toUpperCase\(\) === activatedCode\.toUpperCase\(\)\);\n  let remainingHours: number \| null = null;\n  if \(codeInfo\?\.expiresAt\) \{\n    const diffMs = new Date\(codeInfo\.expiresAt\)\.getTime\(\) - Date\.now\(\);\n    remainingHours = Math\.max\(0, Math\.ceil\(diffMs \/ \(1000 \* 60 \* 60\)\)\);\n  \}\n/g, "");

// Remove Activation card
newContent = newContent.replace(/      \{\/\* 4\. Activation card \*\/\}[\s\S]*?\{\/\* 5\. Config card \*\/\}/, "{/* 5. Config card */}");

fs.writeFileSync('src/components/SignalGenerator.tsx', newContent);
console.log('Updated SignalGenerator.tsx');
