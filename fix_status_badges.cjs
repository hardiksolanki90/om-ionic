const fs = require('fs');
const path = require('path');

const srcDir = '/Users/rudransh/Documents/Hardik/om-ionic/src/pages';
const files = fs.readdirSync(srcDir, { recursive: true })
  .filter(f => f.endsWith('List.tsx'))
  .map(f => path.join(srcDir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace table render badge
  content = content.replace(
    /variant=\{r\.status === 'active' \? 'success' : 'neutral'\}>\{r\.status\}<\/Badge>/g,
    "variant={r.status === 1 ? 'success' : 'neutral'}>{r.status === 1 ? 'Active' : 'Inactive'}</Badge>"
  );
  content = content.replace(
    /variant=\{customer\.status === 'active' \? 'success' : 'neutral'\}>\{customer\.status\}<\/Badge>/g,
    "variant={customer.status === 1 ? 'success' : 'neutral'}>{customer.status === 1 ? 'Active' : 'Inactive'}</Badge>"
  );

  // Replace modal render badge
  content = content.replace(
    /variant=\{selected\.status === 'active' \? 'success' : 'neutral'\}>\{selected\.status\}<\/Badge>/g,
    "variant={selected.status === 1 ? 'success' : 'neutral'}>{selected.status === 1 ? 'Active' : 'Inactive'}</Badge>"
  );

  // Replace EMPTY form status string with 1
  content = content.replace(/status:\s*'active'/g, "status: 1");
  content = content.replace(/status:\s*'inactive'/g, "status: 0");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
