import { myersDiff, fuzzyMatch, generateSideBySide } from '../src/lib/diffEngine.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function testAlignment() {
  const templateDir = path.join(__dirname, '../public/templates');
  const files = [
    'Configuration_Cipherlab_95.ini',
    'Configuration_NewlandN7.ini'
  ];

  const texts = files.map(f => fs.readFileSync(path.join(templateDir, f), 'utf-8'));
  
  console.log("--- Testing Alignment Between Templates ---");
  
  const linesA = texts[0].split(/\r?\n/);
  const linesB = texts[1].split(/\r?\n/);
  
  const { map1, map2 } = generateSideBySide(linesA, linesB);
  
  console.log(`File A: ${files[0]} (${linesA.length} lines)`);
  console.log(`File B: ${files[1]} (${linesB.length} lines)`);
  console.log(`Aligned Length: ${map1.length}`);
  
  let diffCount = 0;
  for (let i = 0; i < map1.length; i++) {
    if (map1[i].type !== 'unchanged') {
        diffCount++;
    }
  }
  
  console.log(`Total differences found: ${diffCount}`);
  
  console.log("\n--- Sample Alignment (first 10 lines) ---");
  for (let i = 0; i < Math.min(10, map1.length); i++) {
    const l1 = map1[i];
    const l2 = map2[i];
    console.log(`${i.toString().padStart(3)} | ${l1.type.padEnd(10)} | ${l1.text.substring(0, 30).padEnd(30)} || ${l2.type.padEnd(10)} | ${l2.text.substring(0, 30)}`);
  }
}

testAlignment();
