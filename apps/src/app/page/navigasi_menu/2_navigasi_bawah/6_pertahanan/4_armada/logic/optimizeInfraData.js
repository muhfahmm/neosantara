const fs = require('fs');
const path = require('path');

const armadaSqlPath = path.join(process.cwd(), 'json/semua_fitur_negara/2_pertahanan/1_armada_militer/database_armada_militer.sql');
const mgmtSqlPath = path.join(process.cwd(), 'json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/database_manajemen_pertahanan.sql');

const armadaSql = fs.readFileSync(armadaSqlPath, 'utf8');

const parseValues = (sqlText) => {
  const lines = sqlText.split('\n');
  const valuesLines = [];
  let capture = false;
  for (const line of lines) {
    if (line.includes('VALUES')) { capture = true; continue; }
    if (capture) {
      const trimmed = line.trim();
      if (trimmed.startsWith('(')) {
        valuesLines.push(trimmed);
      }
    }
  }
  return valuesLines;
};

const armadaLines = parseValues(armadaSql);
const newMgmtRows = [];

for (const line of armadaLines) {
  const cleanLine = line.replace(/^\(/, '').replace(/\),?$/, '');
  const parts = cleanLine.split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  if (parts.length < 26) continue;

  const id = parseInt(parts[0]);
  const country = parts[1];
  const slug = parts[2];

  const apc = parseInt(parts[3]) || 0;
  const artileri = parseInt(parts[4]) || 0;
  const droneIntai = parseInt(parts[5]) || 0;
  const droneKamikaze = parseInt(parts[6]) || 0;
  const helikopter = parseInt(parts[7]) || 0;
  const interceptor = parseInt(parts[8]) || 0;
  const siluman = parseInt(parts[9]) || 0;
  const destroyer = parseInt(parts[10]) || 0;
  const kapalInduk = parseInt(parts[11]) || 0;
  const kapalIndukNuklir = parseInt(parts[12]) || 0;
  const korvet = parseInt(parts[13]) || 0;
  const logistik = parseInt(parts[14]) || 0;
  const ranjau = parseInt(parts[15]) || 0;
  const selamNuklir = parseInt(parts[16]) || 0;
  const selamReguler = parseInt(parts[17]) || 0;
  const taktis = parseInt(parts[18]) || 0;
  const infanteri = parseInt(parts[19]) || 0;
  const sam = parseInt(parts[20]) || 0;
  const angkut = parseInt(parts[21]) || 0;
  const pengebom = parseInt(parts[22]) || 0;
  const pengintai = parseInt(parts[23]) || 0;
  const roket = parseInt(parts[24]) || 0;
  const mbt = parseInt(parts[25]) || 0;

  const totalUdara = siluman + interceptor + pengebom + helikopter + pengintai + droneIntai + droneKamikaze + angkut;
  const totalKapal = kapalInduk + kapalIndukNuklir + destroyer + korvet + selamNuklir + selamReguler + ranjau + logistik;
  const totalGudang = artileri + roket + sam + taktis;
  const totalHangar = mbt + apc;

  // Margin buffer +25% untuk kapasitas infrastruktur yang memadai
  const finalBarak = Math.max(infanteri > 0 ? 1 : 0, Math.ceil((infanteri * 1.25) / 10000));
  const finalGudang = Math.max(totalGudang > 0 ? 1 : 0, Math.ceil((totalGudang * 1.25) / 2500));
  const finalHangar = Math.max(totalHangar > 0 ? 1 : 0, Math.ceil((totalHangar * 1.25) / 3000));
  const finalUdara = Math.max(totalUdara > 0 ? 1 : 0, Math.ceil((totalUdara * 1.25) / 500));
  const finalLaut = Math.max(totalKapal > 0 ? 1 : 0, Math.ceil((totalKapal * 1.25) / 50));

  const safeCountry = country.replace(/'/g, "''");
  newMgmtRows.push(`    (${id}, '${safeCountry}', '${slug}', ${finalBarak}, ${finalGudang}, ${finalHangar}, ${finalUdara}, ${finalLaut})`);
}

const chinaRow = newMgmtRows.find(r => r.includes("'china'"));
console.log('Calculated China Row:', chinaRow);

const sqlHeader = `DROP TABLE IF EXISTS database_manajemen_pertahanan;
CREATE TABLE IF NOT EXISTS database_manajemen_pertahanan (
    id INT PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    country_slug VARCHAR(100) NOT NULL,
    barak INT NOT NULL DEFAULT 0,
    gudang_senjata INT NOT NULL DEFAULT 0,
    hangar_tank INT NOT NULL DEFAULT 0,
    pangkalan_udara INT NOT NULL DEFAULT 0,
    pangkalan_laut INT NOT NULL DEFAULT 0
);

INSERT INTO database_manajemen_pertahanan (
    id, country, country_slug, barak, gudang_senjata, hangar_tank, pangkalan_udara, pangkalan_laut
) VALUES
`;

const newMgmtSql = sqlHeader + newMgmtRows.join(',\n') + ';\n';
fs.writeFileSync(mgmtSqlPath, newMgmtSql, 'utf8');
console.log('Successfully recalculated all 207 countries infrastructure capacity!');

