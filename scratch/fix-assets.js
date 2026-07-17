import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const replaceInFile = (filePath) => {
  try {
    let content = readFileSync(filePath, 'utf-8');
    if (content.includes('/src/assets/')) {
      const updated = content.replaceAll('/src/assets/', '/assets/');
      writeFileSync(filePath, updated, 'utf-8');
      console.log(`Updated assets path in: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
};

const walk = (dir) => {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.html') || file.endsWith('.css')) {
      replaceInFile(fullPath);
    }
  }
};

walk('./src');
replaceInFile('./index.html');
console.log('Path updates complete.');
