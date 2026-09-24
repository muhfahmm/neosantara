const mysql = require('mysql2/promise');

async function checkKomoro() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator',
  });

  const [profile] = await db.execute("SELECT * FROM database_profiles_negara WHERE name_id LIKE '%Komoro%' OR country_slug = 'komoro'");
  console.log('--- PROFIL KOMORO ---');
  console.log(profile[0]);

  const tables = [
    { name: 'Kelistrikan', table: 'database_sektor_listrik_nasional' },
    { name: 'Mineral & Energi', table: 'database_sektor_mineral_kritis' },
    { name: 'Manufaktur', table: 'database_manufaktur' },
    { name: 'Peternakan', table: 'database_sektor_peternakan' },
    { name: 'Agrikultur', table: 'database_sektor_agrikultur' },
    { name: 'Perikanan', table: 'database_sektor_perikanan' },
    { name: 'Olahan Pangan', table: 'database_sektor_olahan_pangan' },
    { name: 'Infrastruktur', table: 'database_infrastruktur' },
    { name: 'Pendidikan', table: 'database_pendidikan' },
    { name: 'Kesehatan', table: 'database_kesehatan' },
    { name: 'Hukum', table: 'database_hukum' },
    { name: 'Olahraga', table: 'database_olahraga' },
    { name: 'Komersial', table: 'database_komersial' },
    { name: 'Hiburan', table: 'database_hiburan' },
    { name: 'Hunian Permukiman', table: 'database_hunian_permukiman' },
  ];

  const countryId = profile[0] ? profile[0].id : null;
  let grandTotalBuildings = 0;

  console.log('\n==========================================');
  console.log('   RINCIAN BANGUNAN NEGARA KOMORO');
  console.log('==========================================\n');

  for (const t of tables) {
    let query = `SELECT * FROM ${t.table} WHERE country LIKE '%Komoro%' OR country_slug = 'komoro'`;
    if (countryId) query += ` OR id = ${countryId}`;
    const [rows] = await db.execute(query);
    console.log(`--- Sektor: ${t.name} ---`);
    if (rows.length > 0) {
      const data = { ...rows[0] };
      delete data.id;
      delete data.country;
      delete data.country_slug;
      
      let sectorTotal = 0;
      Object.entries(data).forEach(([key, val]) => {
        const count = Number(val) || 0;
        if (count > 0) {
          console.log(`  - ${key}: ${count.toLocaleString('id-ID')} bangunan`);
          sectorTotal += count;
        }
      });
      console.log(`  > Subtotal Sektor ${t.name}: ${sectorTotal.toLocaleString('id-ID')} bangunan\n`);
      grandTotalBuildings += sectorTotal;
    } else {
      console.log('  Data tidak ditemukan\n');
    }
  }

  console.log('==========================================');
  console.log(`GRAND TOTAL BANGUNAN KOMORO: ${grandTotalBuildings.toLocaleString('id-ID')} Bangunan`);
  console.log('==========================================');

  db.end();
}

checkKomoro().catch(console.error);
