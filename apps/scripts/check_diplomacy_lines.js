const fs = require('fs');

const content = fs.readFileSync('apps/src/app/page/map_system/map-system.tsx', 'utf-8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('updateDiplomacyMapColors') || l.includes('country_relations_updated') || l.includes('activeViewMode === \'diplomacy\'')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});

