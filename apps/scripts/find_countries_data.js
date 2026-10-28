const fs = require('fs');

const mapData = fs.readFileSync('apps/src/app/page/map_system/map-data.ts', 'utf-8');
const lines = mapData.split('\n');

const russiaLines = lines.filter(l => l.toLowerCase().includes('rus') || l.toLowerCase().includes('united'));
console.log('Russia lines:', russiaLines.slice(0, 10));

