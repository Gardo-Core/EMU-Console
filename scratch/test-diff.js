const { myersDiff, fuzzyMatch, generateSideBySide } = require('../src/lib/diffEngine');
const fs = require('fs');
const path = require('path');

function testAlignment() {
  const templateDir = path.join(__dirname, '../public/templates');
  const files = [
    'Configuration_Cipherlab_95.ini',
    'Configuration_NewlandN7.ini',
    'Configuration_PLUS995.ini'
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
}

testAlignment();
