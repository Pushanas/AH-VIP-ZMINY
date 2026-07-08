const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

const telegramIconCode = `
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.116l-6.405 4.032-2.766-.86c-.604-.19-.617-.604.126-.894l10.816-4.172c.504-.19.95.122.82.855z" />
  </svg>
);
`;

if (!content.includes('const TelegramIcon =')) {
  content = content.replace(/import \{ motion, AnimatePresence \} from "motion\/react";/, "import { motion, AnimatePresence } from \"motion/react\";\n" + telegramIconCode);
  fs.writeFileSync('src/components/SignalGenerator.tsx', content);
}
