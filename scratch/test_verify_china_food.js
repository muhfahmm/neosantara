const mysql = require('mysql2/promise');

async function test() {
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_presiden_simulator'
  });

  const [p] = await db.execute('SELECT id, country_slug, name_id, jumlah_penduduk FROM database_profiles_negara WHERE country_slug = "china"');
  const china = p[0];
  const pop = Number(china.jumlah_penduduk);

  const [a] = await db.execute('SELECT * FROM database_sektor_agrikultur WHERE country_slug = "china"');
  const agri = a[0];

  console.log('--- CHINA VERIFICATION ---');
  console.log('Population:', pop);
  console.log('Agrikultur Buildings:', {
    kedelai: agri.kedelai,
    kakao: agri.kakao,
    padi: agri.padi,
    gandum: agri.gandum,
    sayur: agri.sayur,
    umbi: agri.umbi,
  });

  // Calculate Kedelai
  const kedelaiProdPerBldg = 25;
  const kedelaiGrossProd = agri.kedelai * kedelaiProdPerBldg;
  const kedelaiPopCons = (pop / 1000) * 0.15;
  console.log(`Kedelai Gross Prod: ${kedelaiGrossProd} | Pop Cons: ${kedelaiPopCons} | Net Daily Surplus: +${kedelaiGrossProd - kedelaiPopCons}`);

  // Calculate Kakao
  const kakaoProdPerBldg = 10;
  const kakaoGrossProd = agri.kakao * kakaoProdPerBldg;
  const kakaoPopCons = (pop / 1000) * 0.04;
  console.log(`Kakao Gross Prod: ${kakaoGrossProd} | Pop Cons: ${kakaoPopCons} | Net Daily Surplus: +${kakaoGrossProd - kakaoPopCons}`);

  await db.end();
}

test().catch(err => console.error(err));
