const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const foodPerCapita = {
  // Peternakan
  ayam_unggas: 0.15,
  sapi_potong: 0.08,
  sapi_perah: 0.12,
  domba_kambing: 0.05,
  // Agrikultur
  padi: 0.35,
  gandum: 0.24,
  jagung: 0.18,
  sayur: 0.30,
  umbi: 0.20,
  kedelai: 0.15,
  kelapa_sawit: 0.10,
  kopi: 0.05,
  teh: 0.06,
  kakao: 0.04,
  tebu: 0.15,
  karet: 0.02,
  // Perikanan
  udang: 0.08,
  ikan: 0.25,
  mutiara: 0.01,
  // Olahan Pangan
  air_mineral: 0.05,
  garam: 0.0005,
  gula: 0.0015,
  roti: 0.18,
  pengolahan_daging: 0.10,
  mie_instan: 0.25,
  minyak_goreng: 0.10,
  susu: 0.15,
  beras: 0.35,
};

const metaAgri = JSON.parse(fs.readFileSync('d:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/5_metadata_agrikultur.json'));
const metaPeter = JSON.parse(fs.readFileSync('d:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.json'));
const metaPeri = JSON.parse(fs.readFileSync('d:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.json'));
const metaOlahan = JSON.parse(fs.readFileSync('d:/project-sendiri/em/json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/7_metadata_olahan_pangan.json'));

const allMeta = { ...metaAgri, ...metaPeter, ...metaPeri, ...metaOlahan };

async function run() {
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator'
  });

  const [profiles] = await db.execute('SELECT id, country_slug, name_id, jumlah_penduduk FROM database_profiles_negara');
  console.log('Total countries:', profiles.length);

  for (const p of profiles) {
    const pop = Number(p.jumlah_penduduk) || 1000000;
    
    // 1. Calculate Olahan Pangan buildings first
    const olahanKeys = ['air_mineral', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras'];
    const olahanUpdates = {};
    for (const key of olahanKeys) {
      const perCapita = foodPerCapita[key];
      const meta = allMeta[key];
      const baseProd = meta ? meta.produksi : 100;
      const popCons = (pop / 1000) * perCapita;
      // 40% surplus buffer
      const needed = Math.max(10, Math.ceil((popCons / baseProd) * 1.40));
      olahanUpdates[key] = needed;
    }

    // Factory consumption for raw materials
    const rawFactoryCons = {
      gandum: (olahanUpdates.roti || 0) * 150 * 0.5 + (olahanUpdates.mie_instan || 0) * 500 * 0.4,
      padi: (olahanUpdates.beras || 0) * 300 * 0.8,
      kelapa_sawit: (olahanUpdates.minyak_goreng || 0) * 250 * 0.6,
      tebu: (olahanUpdates.gula || 0) * 250 * 1.0,
      sapi_perah: (olahanUpdates.susu || 0) * 180 * 0.8,
      sapi_potong: (olahanUpdates.pengolahan_daging || 0) * 120 * 0.5,
      ayam_unggas: (olahanUpdates.pengolahan_daging || 0) * 120 * 0.5,
    };

    // 2. Calculate Agrikultur buildings
    const agriKeys = ['padi', 'gandum', 'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao', 'tebu', 'karet'];
    const agriUpdates = {};
    for (const key of agriKeys) {
      const perCapita = foodPerCapita[key];
      const meta = allMeta[key];
      const baseProd = meta ? meta.produksi : 25;
      const popCons = (pop / 1000) * perCapita;
      const facCons = rawFactoryCons[key] || 0;
      const totalCons = popCons + facCons;
      // 40% surplus buffer
      const needed = Math.max(10, Math.ceil((totalCons / baseProd) * 1.40));
      agriUpdates[key] = needed;
    }

    // 3. Calculate Peternakan buildings
    const peterKeys = ['ayam_unggas', 'sapi_potong', 'sapi_perah', 'domba_kambing'];
    const peterUpdates = {};
    for (const key of peterKeys) {
      const perCapita = foodPerCapita[key];
      const meta = allMeta[key];
      const baseProd = meta ? meta.produksi : 100;
      const popCons = (pop / 1000) * perCapita;
      const facCons = rawFactoryCons[key] || 0;
      const totalCons = popCons + facCons;
      const needed = Math.max(10, Math.ceil((totalCons / baseProd) * 1.40));
      peterUpdates[key] = needed;
    }

    // 4. Calculate Perikanan buildings
    const periKeys = ['udang', 'ikan', 'mutiara'];
    const periUpdates = {};
    for (const key of periKeys) {
      const perCapita = foodPerCapita[key];
      const meta = allMeta[key];
      const baseProd = meta ? meta.produksi : 25;
      const popCons = (pop / 1000) * perCapita;
      const needed = Math.max(10, Math.ceil((popCons / baseProd) * 1.40));
      periUpdates[key] = needed;
    }

    // SQL Updates
    const agriSet = Object.keys(agriUpdates).map(k => `${k} = ?`).join(', ');
    await db.execute(`UPDATE database_sektor_agrikultur SET ${agriSet} WHERE country_slug = ?`, [...Object.values(agriUpdates), p.country_slug]);

    const peterSet = Object.keys(peterUpdates).map(k => `${k} = ?`).join(', ');
    await db.execute(`UPDATE database_sektor_peternakan SET ${peterSet} WHERE country_slug = ?`, [...Object.values(peterUpdates), p.country_slug]);

    const periSet = Object.keys(periUpdates).map(k => `${k} = ?`).join(', ');
    await db.execute(`UPDATE database_sektor_perikanan SET ${periSet} WHERE country_slug = ?`, [...Object.values(periUpdates), p.country_slug]);

    const olahanSet = Object.keys(olahanUpdates).map(k => `${k} = ?`).join(', ');
    await db.execute(`UPDATE database_sektor_olahan_pangan SET ${olahanSet} WHERE country_slug = ?`, [...Object.values(olahanUpdates), p.country_slug]);
  }

  // Check China results specifically
  const [cAgri] = await db.execute('SELECT kedelai, kakao, padi, gandum, sayur, umbi FROM database_sektor_agrikultur WHERE country_slug = "china"');
  console.log('NEW China Agrikultur building counts:', cAgri[0]);

  await db.end();
}

run().catch(err => console.error(err));
