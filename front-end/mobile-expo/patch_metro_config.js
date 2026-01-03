const fs = require('fs');
const path = 'node_modules/metro-config/src/loadConfig.js';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    const target = 'const reversedConfigs = configs.toReversed();';
    if (content.includes(target)) {
        const replacement = `
  if (!configs.toReversed) {
      console.log('PATCH: Polyfilling toReversed. Node version: ' + process.version);
      try {
        Object.defineProperty(Array.prototype, 'toReversed', {
          value: function() { return this.slice().reverse(); },
          enumerable: false,
          writable: true,
          configurable: true
        });
      } catch(e) {
        configs.toReversed = function() { return this.slice().reverse(); };
      }
  }
  const reversedConfigs = configs.toReversed();
`;
        content = content.replace(target, replacement);
        fs.writeFileSync(path, content);
        console.log('Patched ' + path);
    } else {
        console.log('Target not found in ' + path);
    }
} else {
    console.log('File not found: ' + path);
}
