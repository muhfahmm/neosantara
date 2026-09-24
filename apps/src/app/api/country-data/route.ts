import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import path from 'path';

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

async function loadAllCountriesFromMySQL() {
  if (cachedAllCountries && cachedAllCountries.length > 0) {
    return cachedAllCountries;
  }

  try {
    // 1. Core Profile & Basic Info
    const profiles = await queryDb<any[]>('SELECT * FROM database_profiles_negara');
    const taxes = await queryDb<any[]>('SELECT * FROM database_pajak_negara').catch(() => []);
    const kabinet = await queryDb<any[]>('SELECT * FROM database_level_kabinet').catch(() => []);
    const sda = await queryDb<any[]>('SELECT * FROM database_sda').catch(() => []);
    const harga = await queryDb<any[]>('SELECT * FROM database_harga_barang').catch(() => []);
    const doktrin = await queryDb<any[]>('SELECT * FROM database_doktrin_keterbukaan').catch(() => []);

    // 2. Produksi & Pembangunan Tables
    const listrik = await queryDb<any[]>('SELECT * FROM database_sektor_listrik_nasional').catch(() => []);
    const mineral = await queryDb<any[]>('SELECT * FROM database_sektor_mineral_kritis').catch(() => []);
    const manufaktur = await queryDb<any[]>('SELECT * FROM database_manufaktur').catch(() => []);
    const peternakan = await queryDb<any[]>('SELECT * FROM database_sektor_peternakan').catch(() => []);
    const agrikultur = await queryDb<any[]>('SELECT * FROM database_sektor_agrikultur').catch(() => []);
    const perikanan = await queryDb<any[]>('SELECT * FROM database_sektor_perikanan').catch(() => []);
    const olahan = await queryDb<any[]>('SELECT * FROM database_sektor_olahan_pangan').catch(() => []);

    // 3. Tempat Umum & Layanan Publik Tables
    const infrastruktur = await queryDb<any[]>('SELECT * FROM database_infrastruktur').catch(() => []);
    const pendidikan = await queryDb<any[]>('SELECT * FROM database_pendidikan').catch(() => []);
    const kesehatan = await queryDb<any[]>('SELECT * FROM database_kesehatan').catch(() => []);
    const hukum = await queryDb<any[]>('SELECT * FROM database_hukum').catch(() => []);
    const olahraga = await queryDb<any[]>('SELECT * FROM database_olahraga').catch(() => []);
    const komersial = await queryDb<any[]>('SELECT * FROM database_komersial').catch(() => []);
    const hiburan = await queryDb<any[]>('SELECT * FROM database_hiburan').catch(() => []);
    const hunian = await queryDb<any[]>('SELECT * FROM database_hunian_permukiman').catch(() => []);

    // 4. Pertahanan Tables
    const militer = await queryDb<any[]>('SELECT * FROM database_armada_militer').catch(() => []);
    const polisi = await queryDb<any[]>('SELECT * FROM database_armada_polisi').catch(() => []);
    const pertahanan = await queryDb<any[]>('SELECT * FROM database_manajemen_pertahanan').catch(() => []);

    // Helper map build function
    const makeMap = (arr: any[]) => {
      const m = new Map<number, any>();
      for (const item of arr) {
        if (item.id !== undefined) m.set(Number(item.id), item);
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
    const polisiMap = makeMap(polisi);
    const pertahananMap = makeMap(pertahanan);

    const mergedList: any[] = [];

    for (const prof of profiles) {
      const id = Number(prof.id);
      const order = id;
      const slug = prof.country_slug || '';
      const fileName = `${id}_${slug}.ts`;

      const t = taxMap.get(id) || {};
      const k = kabinetMap.get(id) || {};
      const s = sdaMap.get(id) || {};
      const h = hargaMap.get(id) || {};
      const d = doktrinMap.get(id) || {};

      const lis = listrikMap.get(id) || {};
      const min = mineralMap.get(id) || {};
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
      const pol = polisiMap.get(id) || {};
      const pth = pertahananMap.get(id) || {};

      // Cabinet Level fields
      const levelFields: Record<string, number> = {};
      Object.keys(k).forEach((col) => {
        if (col.startsWith('kem_') || col.startsWith('keamanan_') || col.startsWith('layanan_')) {
          const deptName = col.replace(/^kem_/, '').replace(/^keamanan_/, '').replace(/^layanan_/, '');
          levelFields[`level_${deptName}`] = Number(k[col]) || 0;
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
      extractNums(pol);
      extractNums(pth);

      const countryObj: any = {
        __fileName: fileName,
        __fileOrder: order,
        __continent: getContinentFromOrder(order),

        country_slug: slug,
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
    console.error('Error fetching country data from XAMPP MySQL:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryPath = searchParams.get('path');
  const requestAll = searchParams.get('all') === 'true';

  try {
    const allData = await loadAllCountriesFromMySQL();

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
    console.error('Failed to load country data from MySQL:', e.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
