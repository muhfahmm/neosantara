const fs = require('fs');

const sqlPath = 'd:\\project-sendiri\\em\\json\\database_sistem_ekonomi\\database_sistem_ekonomi.sql';
const content = fs.readFileSync(sqlPath, 'utf8');

const regex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'/g;
let match;
const countries = [];
while ((match = regex.exec(content)) !== null) {
  countries.push({
    id: parseInt(match[1]),
    slug: match[2],
    name: match[3],
    iso: match[4]
  });
}

console.log('Countries count:', countries.length);

const subsidyKeys = [
  'sub_bbm', 'sub_listrik', 'sub_lpg', 'sub_pdam',
  'sub_pupuk', 'sub_sembako', 'sub_bantuan_pangan',
  'sub_pendidikan', 'sub_bpjs', 'sub_vaksin',
  'sub_transport_publik', 'sub_perumahan', 'sub_ev',
  'sub_kur', 'sub_pajak_umkm',
  'sub_blt', 'sub_pensiun', 'sub_bencana'
];

let sqlHeader = `-- ========================================================\n` +
`-- DATABASE ALOKASI & KEBIJAKAN SUBSIDI (207 NEGARA)\n` +
`-- File: d:\\project-sendiri\\em\\json\\database_alokasi_subsidi\\database_alokasi_subsidi.sql\n` +
`-- Description: Menyimpan status aktif (true/false) 18 kartu subsidi untuk 207 negara\n` +
`-- ========================================================\n\n` +
`DROP TABLE IF EXISTS database_alokasi_subsidi;\n` +
`CREATE TABLE IF NOT EXISTS database_alokasi_subsidi (\n` +
`    id INT AUTO_INCREMENT PRIMARY KEY,\n` +
`    country_id INT NOT NULL,\n` +
`    country_slug VARCHAR(100) NOT NULL UNIQUE,\n` +
`    country_name VARCHAR(100) NOT NULL,\n` +
`    iso VARCHAR(10) NOT NULL,\n` +
`    sub_bbm BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_listrik BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_lpg BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_pdam BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_pupuk BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_sembako BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_bantuan_pangan BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_pendidikan BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_bpjs BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_vaksin BOOLEAN NOT NULL DEFAULT false,\n` +
`    sub_transport_publik BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_perumahan BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_ev BOOLEAN NOT NULL DEFAULT false,\n` +
`    sub_kur BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_pajak_umkm BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_blt BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_pensiun BOOLEAN NOT NULL DEFAULT true,\n` +
`    sub_bencana BOOLEAN NOT NULL DEFAULT true\n` +
`);\n\n` +
`INSERT INTO database_alokasi_subsidi \n` +
`(country_id, country_slug, country_name, iso, sub_bbm, sub_listrik, sub_lpg, sub_pdam, sub_pupuk, sub_sembako, sub_bantuan_pangan, sub_pendidikan, sub_bpjs, sub_vaksin, sub_transport_publik, sub_perumahan, sub_ev, sub_kur, sub_pajak_umkm, sub_blt, sub_pensiun, sub_bencana) \nVALUES\n`;

const rows = [];
countries.forEach((c, idx) => {
  const flags = subsidyKeys.map((subId, sIdx) => {
    let isSub = true;
    if (subId === 'sub_ev') {
      isSub = (idx % 5 === 0);
    } else if (subId === 'sub_vaksin') {
      isSub = (idx % 2 === 0);
    } else if (subId === 'sub_blt' || subId === 'sub_kur') {
      isSub = (idx % 7 !== 0);
    } else {
      isSub = ((idx + sIdx) % 11 !== 0);
    }
    return isSub ? 'true' : 'false';
  });

  const safeName = c.name.replace(/'/g, "''");
  rows.push(`(${c.id}, '${c.slug}', '${safeName}', '${c.iso}', ${flags.join(', ')})`);
});

const fullSql = sqlHeader + rows.join(',\n') + ';\n';
fs.writeFileSync('d:\\project-sendiri\\em\\json\\database_alokasi_subsidi\\database_alokasi_subsidi.sql', fullSql);
console.log('Done! Compact 1-row-per-country SQL generated with rows:', countries.length);
