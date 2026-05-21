const fs = require('fs');
const path = require('path');

const srcDir = '/Users/rudransh/Documents/Hardik/om-ionic/src/pages';
const files = fs.readdirSync(srcDir, { recursive: true })
  .filter(f => f.endsWith('List.tsx'))
  .map(f => path.join(srcDir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Generic regex for any variable name before .status
  content = content.replace(
    /variant=\{([a-zA-Z0-9_]+)\.status === 'active' \? 'success' : 'neutral'\}>\{\1\.status\}<\/Badge>/g,
    "variant={$1.status === 1 ? 'success' : 'neutral'}>{$1.status === 1 ? 'Active' : 'Inactive'}</Badge>"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
