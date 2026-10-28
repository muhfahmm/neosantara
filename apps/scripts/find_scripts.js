// Cek apakah ada script lain di apps/scripts yang terkait relations
const fs = require('fs');

const scripts = fs.readdirSync('apps/scripts');
console.log('Scripts:', scripts.filter(s => s.includes('relation') || s.includes('sql') || s.includes('seed') || s.includes('db')));

