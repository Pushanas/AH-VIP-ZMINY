const fs = require('fs');
let content = fs.readFileSync('src/components/SignalGenerator.tsx', 'utf8');

content = content.replace(/      const generated: Signal\[\] = \[\];\n      let currentTime = startTimeMinutes \+ 3; \/\/ start 3 minutes in\n\n      while \(currentTime < endTimeMinutes\) \{\n        const timeStr = formatMinutesTo12Hour\(currentTime\);\n        const randomPair = ASSET_PAIRS\[Math\.floor\(Math\.random\(\) \* ASSET_PAIRS\.length\)\];\n        const randomDir = DIRECTIONS\[Math\.floor\(Math\.random\(\) \* DIRECTIONS\.length\)\];\n\n        generated\.push\(\{\n          time: timeStr,\n          pair: randomPair,\n          direction: randomDir\n        \}\);\n\n        \/\/ Add a random gap of 3 to 8 minutes as described\n        const randomMinutesToAdd = Math\.floor\(Math\.random\(\) \* 6\) \+ 3;\n        currentTime \+= randomMinutesToAdd;\n      \}/g,
`      const generated: Signal[] = [];
      const duration = endTimeMinutes - startTimeMinutes;
      const maxSignals = 10;
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
      }`);

fs.writeFileSync('src/components/SignalGenerator.tsx', content);
