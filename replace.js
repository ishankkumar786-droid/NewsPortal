const fs = require('fs');
const path = require('path');

const targetStr = /KhabarPatra/g;
const replacementStr = 'Khabarpath';

const walkSync = (dir, filelist = []) => {
  if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('dist')) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
};

const files = walkSync('./frontend/src');
let replacedCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (targetStr.test(content)) {
    const newContent = content.replace(targetStr, replacementStr);
    fs.writeFileSync(file, newContent, 'utf8');
    replacedCount++;
  }
});

console.log(`Replaced "KhabarPatra" with "Khabarpath" in ${replacedCount} files.`);
