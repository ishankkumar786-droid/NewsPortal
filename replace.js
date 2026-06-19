const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'frontend', 'src'));

let changed = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('News Portal')) {
    const newContent = content.replace(/News Portal/g, 'KhabarPatra');
    fs.writeFileSync(file, newContent, 'utf8');
    changed++;
    console.log('Updated:', file);
  }
});

console.log(`Replaced "News Portal" in ${changed} files.`);
