// Cek bagaimana map-system mewarnai negara di canvas/wasm
const fs = require('fs');

const mapSystem = fs.readFileSync('apps/src/app/page/map_system/map-system.tsx', 'utf-8');
const lines = mapSystem.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('neosantara_diplomacy_map_') || l.includes('diplomacy_map')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});

