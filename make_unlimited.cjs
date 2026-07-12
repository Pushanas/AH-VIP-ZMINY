const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

// 1. Remove isExpired state
content = content.replace(/const \[isExpired, setIsExpired\] = useState\(false\);\n/, '');

// 2. Remove useEffect that checks localStorage and sets isExpired
content = content.replace(/  useEffect\(\(\) => \{\n    const checkSession = \(\) => \{\n      const saved = localStorage\.getItem\('ah_vip_daily_session'\);\n      if \(saved\) \{\n        try \{\n          const data = JSON\.parse\(saved\);\n          const today = getEgyptDateString\(\);\n          if \(data\.date === today\) \{\n            setSignals\(data\.signals\);\n            if \(data\.signals && data\.signals\.length > 0\) \{\n              const lastSignal = data\.signals\[data\.signals\.length - 1\];\n              const lastSignalMinutes = parseTimeStrToMinutes\(lastSignal\.time\);\n              const currentMinutes = getEgyptCurrentMinutes\(\);\n              if \(currentMinutes > lastSignalMinutes\) \{\n                setIsExpired\(true\);\n              \}\n            \}\n          \}\n        \} catch\(e\) \{\}\n      \}\n    \};\n    checkSession\(\);\n    const interval = setInterval\(checkSession, 30000\);\n    return \(\) => clearInterval\(interval\);\n  \}, \[\]\);\n/, '');

// 3. In handleGenerate, remove localStorage check
content = content.replace(/      const saved = localStorage\.getItem\('ah_vip_daily_session'\);\n      if \(saved\) \{\n        try \{\n          const data = JSON\.parse\(saved\);\n          const today = getEgyptDateString\(\);\n          if \(data\.date === today && data\.signals && data\.signals\.length > 0\) \{\n            setSignals\(data\.signals\);\n            setIsGenerating\(false\);\n            return;\n          \}\n        \} catch\(e\) \{\}\n      \}\n/, '');

// 4. Remove 6-hour max duration limit
content = content.replace(/      if \(endTimeMinutes - startTimeMinutes > 6 \* 60\) \{\n         setTimeError\(lang === 'ar' \? 'المدة أطول من اللازم\. أقصى مدة هي 6 ساعات لضمان الجودة\.' : 'Duration too long\. Max duration is 6 hours for optimal quality\.'\);\n         setIsGenerating\(false\);\n         return;\n      \}\n/, '');

// 5. Update signal generation loop
const oldGenLoop = `      const maxSignals = 10;
      let currentTime = startTimeMinutes + 3;
      
      const avgGap = Math.max(3, Math.floor(duration / maxSignals));
      for (let i = 0; i < maxSignals && currentTime < endTimeMinutes; i++) {
        const timeStr = formatMinutesTo12Hour(currentTime);
        const randomPair = ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)];
        const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        generated.push({
          time: timeStr,
          pair: randomPair,
          direction: randomDir
        });
        const randomMinutesToAdd = avgGap + Math.floor(Math.random() * 5) - 2;
        currentTime += randomMinutesToAdd;
      }
      
      const sessionData = {
        date: getEgyptDateString(),
        signals: generated
      };
      localStorage.setItem('ah_vip_daily_session', JSON.stringify(sessionData));`;

const newGenLoop = `      let currentTime = startTimeMinutes + 3;
      
      const avgGap = 5; // average gap of 5 minutes between signals
      while (currentTime < endTimeMinutes) {
        const timeStr = formatMinutesTo12Hour(currentTime);
        const randomPair = ASSET_PAIRS[Math.floor(Math.random() * ASSET_PAIRS.length)];
        const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        generated.push({
          time: timeStr,
          pair: randomPair,
          direction: randomDir
        });
        const randomMinutesToAdd = avgGap + Math.floor(Math.random() * 4) - 1; // 4 to 7 mins
        currentTime += randomMinutesToAdd;
      }`;

content = content.replace(oldGenLoop, newGenLoop);

// 6. Remove isExpired block
// The block goes from "if (isExpired) {" to the closing brace before "return ("
const expiredRegex = /  if \(isExpired\) \{[\s\S]*?    \);\n  }\n\n/g;
content = content.replace(expiredRegex, '');

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
