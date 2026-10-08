import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import path from 'path';
// Data level kabinet dibaca dari MySQL (database_level_kabinet table) via kabinetMap

const extractFileOrder = (fileName: string): number => {
  const match = fileName.match(/^(\d+)_/);
  return match ? parseInt(match[1], 10) : 9999;
};

const getContinentFromOrder = (order: number): string => {
  if (order >= 1 && order <= 53) return 'Afrika';
  if (order >= 54 && order <= 102) return 'Asia';
  if (order >= 103 && order <= 151) return 'Eropa';
  if (order >= 152 && order <= 178) return 'Amerika Utara';
  if (order >= 179 && order <= 194) return 'Oceania';
  if (order >= 195 && order <= 207) return 'Amerika Selatan';
  return 'Lainnya';
};

const normalizeKey = (val: string) => val.trim().toLowerCase().replace(/[\s_-]+/g, '');

let cachedAllCountries: any[] | null = null;
const cachedCountryMap = new Map<string, any>();

async function loadAllCountriesFromMySQL(forceRefresh: boolean = false) {
  if (process.env.NODE_ENV === 'development') {
    forceRefresh = true;
  }
  if (!forceRefresh && cachedAllCountries && cachedAllCountries.length > 0) {
    return cachedAllCountries;
  }

  cachedAllCountries = null;
  cachedCountryMap.clear();

  try {
    // 1. Core Profile & Basic Info
    const queryOptional = (sql: string) => queryDb<any[]>(sql).catch(() => []);
    const [
      profiles,
      taxes,
      kabinet,
      sda,
      harga,
      doktrin,
      alokasiSubsidi,
      sistemEkonomi,
      databaseTempatWisata,
      listrik,
      mineral,
      manufaktur,
      peternakan,
      agrikultur,
      perikanan,
      olahan,
      infrastruktur,
      pendidikan,
      kesehatan,
      hukum,
      olahraga,
      komersial,
      hiburan,
      hunian,
      militer,
      pertahanan,
    ] = await Promise.all([
      queryDb<any[]>('SELECT * FROM database_profiles_negara'),
      queryOptional('SELECT * FROM database_pajak_negara'),
      queryOptional('SELECT * FROM database_level_kabinet'),
      queryOptional('SELECT * FROM database_sda'),
      queryOptional('SELECT * FROM database_harga_barang'),
      queryOptional('SELECT * FROM database_doktrin_keterbukaan'),
      queryOptional('SELECT * FROM database_alokasi_subsidi'),
      queryOptional('SELECT * FROM database_sistem_ekonomi'),
      queryOptional('SELECT * FROM database_tempat_wisata'),
      queryOptional('SELECT * FROM database_sektor_listrik_nasional'),
      queryOptional('SELECT * FROM database_sektor_mineral_kritis'),
      queryOptional('SELECT * FROM database_manufaktur'),
      queryOptional('SELECT * FROM database_sektor_peternakan'),
      queryOptional('SELECT * FROM database_sektor_agrikultur'),
      queryOptional('SELECT * FROM database_sektor_perikanan'),
      queryOptional('SELECT * FROM database_sektor_olahan_pangan'),
      queryOptional('SELECT * FROM database_infrastruktur'),
      queryOptional('SELECT * FROM database_pendidikan'),
      queryOptional('SELECT * FROM database_kesehatan'),
      queryOptional('SELECT * FROM database_hukum'),
      queryOptional('SELECT * FROM database_olahraga'),
      queryOptional('SELECT * FROM database_komersial'),
      queryOptional('SELECT * FROM database_hiburan'),
      queryOptional('SELECT * FROM database_hunian_permukiman'),
      queryOptional('SELECT * FROM database_armada_militer'),
      queryOptional('SELECT * FROM database_manajemen_pertahanan'),
    ]);
    let tempatWisata = databaseTempatWisata;
    if (!tempatWisata || tempatWisata.length === 0) {
      try {
        const fs = require('fs');
        const sqlPath = path.join(process.cwd(), '../json/database_tempat_wisata/database_tempat_wisata.pg.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        const rows: any[] = [];
        const regex = /\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']*(?:''[^']*)*)'\s*,\s*(\d+)\s*\)/g;
        let match;
        while ((match = regex.exec(sqlContent)) !== null) {
          rows.push({
            id: Number(match[1]),
            country_slug: match[2],
            nama_wisata: match[3].replace(/''/g, "'"),
            penghasilan: Number(match[4]),
          });
        }
        tempatWisata = rows;
      } catch (err) {
        tempatWisata = [];
      }
    }

    // Helper map build function
    const makeMap = (arr: any[]) => {
      const m = new Map<any, any>();
      for (const item of arr) {
        if (item.id !== undefined) m.set(Number(item.id), item);
        if (item.country_slug) {
          m.set(normalizeKey(item.country_slug), item);
          m.set(item.country_slug.toLowerCase(), item);
        }
      }
      return m;
    };

    const taxMap = makeMap(taxes);
    const kabinetMap = makeMap(kabinet);
    const sdaMap = makeMap(sda);
    const hargaMap = makeMap(harga);
    const doktrinMap = makeMap(doktrin);

    const listrikMap = makeMap(listrik);
    const mineralMap = makeMap(mineral);
    const manufakturMap = makeMap(manufaktur);
    const peternakanMap = makeMap(peternakan);
    const agrikulturMap = makeMap(agrikultur);
    const perikananMap = makeMap(perikanan);
    const olahanMap = makeMap(olahan);

    const infraMap = makeMap(infrastruktur);
    const pendMap = makeMap(pendidikan);
    const kesMap = makeMap(kesehatan);
    const hukumMap = makeMap(hukum);
    const olahMap = makeMap(olahraga);
    const komMap = makeMap(komersial);
    const hibMap = makeMap(hiburan);
    const hunMap = makeMap(hunian);

    const militerMap = makeMap(militer);
    const pertahananMap = makeMap(pertahanan);

    const subMap = new Map<string, any>();
    for (const item of alokasiSubsidi) {
      if (item.country_slug) {
        subMap.set(normalizeKey(item.country_slug), item);
      }
    }

    const sistemEkonomiMap = new Map<string, any>();
    for (const item of sistemEkonomi) {
      if (item.country_slug) {
        sistemEkonomiMap.set(normalizeKey(item.country_slug), item);
      }
    }

    const tourismMap = new Map<string, { total_wisata_penghasilan: number; total_tempat_wisata: number; tempat_wisata: any[] }>();
    for (const item of tempatWisata) {
      if (item.country_slug) {
        const key = normalizeKey(item.country_slug);
        if (!tourismMap.has(key)) {
          tourismMap.set(key, { total_wisata_penghasilan: 0, total_tempat_wisata: 0, tempat_wisata: [] });
        }
        const group = tourismMap.get(key)!;
        const p = Number(item.penghasilan) || 0;
        group.total_wisata_penghasilan += p;
        group.total_tempat_wisata += 1;
        group.tempat_wisata.push({
          id: Number(item.id) || 0,
          nama_wisata: item.nama_wisata || '',
          penghasilan: p,
        });
      }
    }

    const mergedList: any[] = [];

    for (const prof of profiles) {
      const id = Number(prof.id);
      const order = id;
      const slug = prof.country_slug || '';
      const normSlug = normalizeKey(slug);
      const underscoreSlug = slug.toLowerCase().replace(/[\s-]+/g, '_');
      const fileName = `${id}_${slug}.ts`;

      const t = taxMap.get(id) || (slug ? taxMap.get(normSlug) : {}) || {};
      const kFromDb = (slug ? kabinetMap.get(normSlug) : null) || kabinetMap.get(id) || {};
      const k = { ...kFromDb };

      const s = sdaMap.get(id) || (slug ? sdaMap.get(normSlug) : {}) || {};
      const h = hargaMap.get(id) || (slug ? hargaMap.get(normSlug) : {}) || {};
      const d = doktrinMap.get(id) || (slug ? doktrinMap.get(normSlug) : {}) || {};

      const lis = (slug ? listrikMap.get(normSlug) : null) || listrikMap.get(id) || {};
      const min = (slug ? mineralMap.get(normSlug) : null) || mineralMap.get(id) || {};
      const man = manufakturMap.get(id) || {};
      const pet = peternakanMap.get(id) || {};
      const agr = agrikulturMap.get(id) || {};
      const per = perikananMap.get(id) || {};
      const olh = olahanMap.get(id) || {};

      const inf = infraMap.get(id) || {};
      const pen = pendMap.get(id) || {};
      const kes = kesMap.get(id) || {};
      const huk = hukumMap.get(id) || {};
      const olg = olahMap.get(id) || {};
      const kom = komMap.get(id) || {};
      const hib = hibMap.get(id) || {};
      const hun = hunMap.get(id) || {};

      const mil = militerMap.get(id) || {};
      const pth = pertahananMap.get(id) || {};

      // Cabinet Level fields
      const levelFields: Record<string, number> = {};
      Object.keys(k).forEach((col) => {
        if (col.startsWith('kem_') || col.startsWith('keamanan_') || col.startsWith('layanan_')) {
          const val = Number(k[col]) || 0;
          const deptName = col.replace(/^kem_/, '').replace(/^keamanan_/, '').replace(/^layanan_/, '');
          levelFields[`level_${deptName}`] = val;
          levelFields[col] = val;
        }
      });

      // Production & Construction numerical counts
      const numericFields: Record<string, number> = {};

      const extractNums = (obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (!['id', 'country', 'country_slug', 'name_en', 'ideology'].includes(key)) {
            const val = Number(obj[key]);
            if (!isNaN(val)) {
              numericFields[key] = val;
            }
          }
        });
      };

      extractNums(lis);
      extractNums(min);
      extractNums(man);
      extractNums(pet);
      extractNums(agr);
      extractNums(per);
      extractNums(olh);
      extractNums(inf);
      extractNums(pen);
      extractNums(kes);
      extractNums(huk);
      extractNums(olg);
      extractNums(kom);
      extractNums(hib);
      extractNums(hun);
      extractNums(mil);
      extractNums(pth);

      const countryObj: any = {
        __fileName: fileName,
        __fileOrder: order,
        __continent: getContinentFromOrder(order),

        country_slug: slug,
        iso: prof.iso || slug,
        name_id: prof.name_id || prof.country || slug,
        name_en: prof.name_en || prof.name_id || slug,
        capital: prof.capital || '',
        lon: Number(prof.lon) || 0,
        lat: Number(prof.lat) || 0,
        flag: prof.flag || '🏳️',
        jumlah_penduduk: Number(prof.jumlah_penduduk) || 0,
        anggaran: Number(prof.anggaran) || 0,
        pendapatan_nasional: String(prof.pendapatan_nasional || '0'),
        religion: prof.religion || 'Lainnya',
        ideology: prof.ideology || 'Demokrasi',

        un_vote: Number(prof.un_vote) || 0,
        reputasi_diplomatik: prof.reputasi_diplomatik || 'Netral',
        pengaruh_global: Number(prof.pengaruh_global) || 0,
        peringkat_diplomasi: Number(prof.peringkat_diplomasi) || 100,
        sikap: prof.sikap || 'Netral',

        pengaruh_internasional: {
          kekuatan_lunak: Number(prof.kekuatan_lunak) || 0,
          kekuatan_keras: Number(prof.kekuatan_keras) || 0,
          prestise_diplomatik: Number(prof.prestise_diplomatik) || 0,
        },

        doktrin_keterbukaan: {
          speechScore: Number(d.speech_score) || 75,
          religionScore: Number(d.religion_score) || 80,
          demoScore: Number(d.demo_score) || 70,
          transparencyScore: Number(d.transparency_score) || 75,
          mediaScore: Number(d.media_score) || 75,
          internetScore: Number(d.internet_score) || 80,
          borderScore: Number(d.border_score) || 60,
          tradeScore: Number(d.trade_score) || 75,
          diplomacyScore: Number(d.diplomacy_score) || 70,
          opennessIndex: Number(d.openness_index) || 73,
        },

        pajak: {
          ppn: { tarif: Number(t.tarif_ppn) || 0 },
          korporasi: { tarif: Number(t.tarif_korporasi) || 0 },
          penghasilan: { tarif: Number(t.tarif_penghasilan) || 0 },
          bea_cukai: { tarif: Number(t.tarif_bea_cukai) || 0 },
          lingkungan: { tarif: Number(t.tarif_lingkungan) || 0 },
        },

        subsidy_states: (() => {
          const sub = subMap.get(normalizeKey(slug)) || {};
          const states: Record<string, boolean> = {};
          [
            'sub_bbm', 'sub_listrik', 'sub_lpg', 'sub_pdam', 'sub_pupuk', 'sub_sembako',
            'sub_bantuan_pangan', 'sub_pendidikan', 'sub_bpjs', 'sub_vaksin',
            'sub_transport_publik', 'sub_perumahan', 'sub_ev', 'sub_kur',
            'sub_pajak_umkm', 'sub_blt', 'sub_pensiun', 'sub_bencana'
          ].forEach((k) => {
            if (sub[k] !== undefined) {
              states[k] = Boolean(sub[k]);
            }
          });
          return Object.keys(states).length > 0 ? states : undefined;
        })(),

        ...(() => {
          const sys = sistemEkonomiMap.get(normalizeKey(slug)) || {};
          return {
            sistem_ekonomi_val: sys.spektrum_val !== undefined ? Number(sys.spektrum_val) : 50,
            sistem_ekonomi_name: sys.system_title || 'Ekonomi Campuran (Mixed Economy)',
            policy_price_control: sys.policy_price_control === 'Pasar Bebas' ? 'B' : 'A',
            policy_strategic_ownership: sys.policy_strategic_ownership === 'Pasar Bebas' ? 'B' : 'A',
            policy_trade_policy: sys.policy_trade === 'Pasar Bebas' ? 'B' : 'A',
            policy_labor_regulation: sys.policy_labor === 'Pasar Bebas' ? 'B' : 'A',
          };
        })(),

        ...(() => {
          const TOURISM_ALIAS: Record<string, string> = {
            "amerikaserikat": "americaserikat",
            "brazil": "brasil",
            "chile": "chili",
            "bolivia": "dinasti",
            "costarica": "kostrika",
            "komoro": "komori",
            "republikdemokratikkongo": "demokratikkongo",
            "saintlucia": "santolucia",
            "saintkittsdannevis": "santokittsnevis",
            "saintvincentdangrenadine": "santovincentgrenadines",
            "saintvincentdangrenadines": "santovincentgrenadines",
            "selandiabaru": "negaraneuzelandi",
            "trinidaddantobago": "trinidattobago",
            "capeverde": "caboverde",
            "tanjungverde": "caboverde",
            "madagaskar": "madagascar",
            "tahiti": "fijiprancis",
            "polinesiaprancis": "fijiprancis",
            "republikdominika": "dominikarepublik",
            "kongo": "congo",
            "sudan": "sudan",
            "republiksudan": "sudan",
            "republiktanzania": "tanzania",
            "republikuganda": "uganda",
            "republikzambia": "zambia",
            "republikzimbabwe": "zimbabwe",
            "samoaamerika": "samoa",
            "guianaprancis": "besar",
          };
          const resolvedSlug = TOURISM_ALIAS[normSlug] || normSlug;
          const tour = tourismMap.get(resolvedSlug) || tourismMap.get(normSlug) || { total_wisata_penghasilan: 0, total_tempat_wisata: 0, tempat_wisata: [] };
          return {
            total_wisata_penghasilan: tour.total_wisata_penghasilan,
            wisata_penghasilan: tour.total_wisata_penghasilan,
            total_tempat_wisata: tour.total_tempat_wisata,
            tempat_wisata: tour.tempat_wisata,
          };
        })(),

        sda: {
          emas: Boolean(s.emas),
          uranium: Boolean(s.uranium),
          batu_bara: Boolean(s.batu_bara),
          minyak_bumi: Boolean(s.minyak_bumi),
          gas_alam: Boolean(s.gas_alam),
          garam: Boolean(s.garam),
          litium: Boolean(s.litium),
          logam_tanah_jarang: Boolean(s.logam_tanah_jarang),
          bijih_besi: Boolean(s.bijih_besi),
        },

        harga: {
          harga_beras: Number(h.harga_beras) || 0,
          harga_daging_sapi: Number(h.harga_daging_sapi) || 0,
          harga_ayam: Number(h.harga_ayam) || 0,
          harga_minyak_goreng: Number(h.harga_minyak_goreng) || 0,
          harga_gula: Number(h.harga_gula) || 0,
          harga_telur: Number(h.harga_telur) || 0,
          harga_listrik: Number(h.harga_listrik) || 0,
          harga_air: Number(h.harga_air) || 0,
        },

        ...levelFields,
        ...numericFields,
      };

      mergedList.push(countryObj);

      // Cache keys
      const key1 = normalizeKey(prof.name_id || '');
      const key2 = normalizeKey(prof.name_en || '');
      const key3 = normalizeKey(slug);
      if (key1) cachedCountryMap.set(key1, countryObj);
      if (key2) cachedCountryMap.set(key2, countryObj);
      if (key3) cachedCountryMap.set(key3, countryObj);
    }

    cachedAllCountries = mergedList;
    return mergedList;
  } catch (error) {
    console.error('Error fetching country data from PostgreSQL:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryPath = searchParams.get('path');
  const requestAll = searchParams.get('all') === 'true';
  const forceRefresh = searchParams.get('force') === 'true';

  try {
    const allData = await loadAllCountriesFromMySQL(forceRefresh);

    if (requestAll || !countryPath) {
      return NextResponse.json(allData);
    }

    const baseName = path.basename(countryPath).replace(/\.ts$/, '');
    const normInput = normalizeKey(baseName);

    if (cachedCountryMap.has(normInput)) {
      return NextResponse.json(cachedCountryMap.get(normInput));
    }

    const matched = allData.find((c) => {
      const fileNameNorm = normalizeKey(c.__fileName.replace(/\.ts$/, ''));
      const nameIdNorm = normalizeKey(c.name_id || '');
      const nameEnNorm = normalizeKey(c.name_en || '');
      return (
        fileNameNorm === normInput ||
        nameIdNorm === normInput ||
        nameEnNorm === normInput ||
        fileNameNorm.includes(normInput) ||
        normInput.includes(fileNameNorm)
      );
    });

    if (matched) {
      cachedCountryMap.set(normInput, matched);
      return NextResponse.json(matched);
    }

    return NextResponse.json(allData[0] || {});
  } catch (e: any) {
    console.error('Failed to load country data from PostgreSQL:', e.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const countrySlug = typeof body?.country_slug === 'string' ? body.country_slug.trim() : '';
    if (!countrySlug) {
      return NextResponse.json({ error: 'country_slug wajib diisi.' }, { status: 400 });
    }

    const updates: Array<{ column: 'religion' | 'ideology'; value: string }> = [];
    for (const column of ['religion', 'ideology'] as const) {
      if (body[column] === undefined) continue;
      if (typeof body[column] !== 'string' || !body[column].trim() || body[column].trim().length > 100) {
        return NextResponse.json(
          { error: `${column} harus berupa teks 1-100 karakter.` },
          { status: 400 }
        );
      }
      updates.push({ column, value: body[column].trim() });
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada kolom agama atau ideologi yang diperbarui.' },
        { status: 400 }
      );
    }

    const values = updates.map(update => update.value);
    values.push(countrySlug);
    const setClause = updates
      .map((update, index) => `${update.column} = $${index + 1}`)
      .join(', ');
    const rows = await queryDb<any[]>(
      `UPDATE database_profiles_negara SET ${setClause} WHERE country_slug = $${values.length} RETURNING country_slug, religion, ideology`,
      values
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Negara tidak ditemukan.' }, { status: 404 });
    }

    cachedAllCountries = null;
    cachedCountryMap.clear();
    return NextResponse.json({ success: true, profile: rows[0] });
  } catch (error: any) {
    console.error('Failed to update country religion or ideology:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal memperbarui profil negara.' },
      { status: 500 }
    );
  }
}
