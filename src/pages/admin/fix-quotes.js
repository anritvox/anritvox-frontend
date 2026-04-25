import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target the src directory
const targetDir = path.join(__dirname, 'src');

function fixFilesInDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixFilesInDirectory(fullPath); // Recursively search folders
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If the file contains \", replace all of them with standard "
      if (content.includes('\\"')) {
        const fixedContent = content.replace(/\\"/g, '"');
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        console.log(`✅ Fixed quotes in: ${file}`);
      }
    }
  }
}

console.log('Scanning for broken quotes...');
fixFilesInDirectory(targetDir);
console.log('🎉 All files fixed!');
