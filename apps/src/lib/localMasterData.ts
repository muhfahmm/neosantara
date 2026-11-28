import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

type DataRow = Record<string, unknown>;
type MasterDataTables = Record<string, DataRow[]>;

interface LocalMasterData {
  tables: MasterDataTables;
}

type FetchFunction = typeof window.fetch;

const EXCLUDED_COUNTRY_TABLES = new Set([
  'database_building_metadata',
  'database_hubungan_antar_negara',
  'database_kebijakan_subsidi',
  'database_kedutaan_besar',
  'database_mitra_perdagangan',
  'database_perjalanan_antar_negara',
]);

let masterDataPromise: Promise<LocalMasterData> | null = null;
let allCountryData: DataRow[] | null = null;

function normalizeKey(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function loadMasterData(originalFetch: FetchFunction): Promise<LocalMasterData> {
  if (!masterDataPromise) {
    masterDataPromise = (async () => {
      const response = await originalFetch('/local-master-data.json', { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`Local game database could not be loaded (HTTP ${response.status}).`);
      }

      const data: unknown = await response.json();
      if (
        typeof data !== 'object' ||
        data === null ||
        !('tables' in data) ||
        typeof data.tables !== 'object' ||
        data.tables === null
      ) {
        throw new Error('Local game database has an invalid format.');
      }
      return data as LocalMasterData;
    })().catch((error: unknown) => {
      masterDataPromise = null;
      throw error;
    });
  }
  return masterDataPromise;
}

function getCountryData(data: LocalMasterData): DataRow[] {
  if (allCountryData) return allCountryData;

  const profiles = data.tables.database_profiles_negara ?? [];
  const countryByName = new Map<string, (typeof COUNTRIES_DATA)[number]>();
  for (const country of COUNTRIES_DATA) {
    countryByName.set(normalizeKey(country.country), country);
  }

  allCountryData = profiles.map((profile) => {
    const slug = String(profile.country_slug ?? '');
    const countryName = String(profile.name_id ?? profile.country ?? slug);
    const countryMatch = countryByName.get(normalizeKey(countryName));
    const detail: DataRow = {
      __fileName: `${profile.id}_${slug}.ts`,
      __fileOrder: toNumber(profile.id),
      __continent: countryMatch?.continent ?? 'Lainnya',
      ...profile,
      iso: countryMatch?.iso ?? slug,
      name_id: countryName,
      name_en: profile.name_en ?? countryName,
      jumlah_penduduk: toNumber(profile.jumlah_penduduk),
      anggaran: toNumber(profile.anggaran),
      pendapatan_nasional: String(profile.pendapatan_nasional ?? '0'),
      un_vote: toNumber(profile.un_vote),
      pengaruh_global: toNumber(profile.pengaruh_global),
      peringkat_diplomasi: toNumber(profile.peringkat_diplomasi),
    };

    const lookupKeys = new Set([
      normalizeKey(slug),
      normalizeKey(profile.name_id),
      normalizeKey(profile.name_en),
      normalizeKey(profile.country),
    ].filter(Boolean));

    const matchedRows: Record<string, DataRow | undefined> = {};
    for (const [tableName, rows] of Object.entries(data.tables)) {
      if (EXCLUDED_COUNTRY_TABLES.has(tableName) || tableName === 'database_profiles_negara') continue;

      const matched = rows.find((row) => {
        const rowSlug = normalizeKey(row.country_slug);
        const rowNames = [row.country, row.country_name, row.name_en, row.name_id]
          .map(normalizeKey)
          .filter(Boolean);
        return (rowSlug && lookupKeys.has(rowSlug)) || rowNames.some((name) => lookupKeys.has(name));
      });
      if (!matched) continue;

      matchedRows[tableName] = matched;
      for (const [key, value] of Object.entries(matched)) {
        if (
          ['id', 'country', 'country_id', 'country_name', 'country_slug', 'iso', 'name_id', 'name_en'].includes(key) ||
          value === null ||
          value === undefined
        ) continue;

        if (typeof value === 'number') {
          detail[key] = value;
        } else if (typeof value === 'string') {
          const numericValue = Number(value);
          detail[key] = value.trim() !== '' && Number.isFinite(numericValue) ? numericValue : value;
        } else {
          detail[key] = value;
        }
      }
    }

    const tax = matchedRows.database_pajak_negara ?? {};
    detail.pajak = {
      ppn: { tarif: toNumber(tax.tarif_ppn) },
      korporasi: { tarif: toNumber(tax.tarif_korporasi) },
      penghasilan: { tarif: toNumber(tax.tarif_penghasilan) },
      bea_cukai: { tarif: toNumber(tax.tarif_bea_cukai) },
      lingkungan: { tarif: toNumber(tax.tarif_lingkungan) },
    };

    const resources = matchedRows.database_sda ?? {};
    detail.sda = Object.fromEntries(
      ['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi']
        .map((key) => [key, Boolean(resources[key])]),
    );

    const prices = matchedRows.database_harga_barang ?? {};
    detail.harga = Object.fromEntries(
      ['harga_beras', 'harga_daging_sapi', 'harga_ayam', 'harga_minyak_goreng', 'harga_gula', 'harga_telur', 'harga_listrik', 'harga_air']
        .map((key) => [key, toNumber(prices[key])]),
    );

    const doctrine = matchedRows.database_doktrin_keterbukaan ?? {};
    detail.doktrin_keterbukaan = {
      speechScore: toNumber(doctrine.speech_score) || 75,
      religionScore: toNumber(doctrine.religion_score) || 80,
      demoScore: toNumber(doctrine.demo_score) || 70,
      transparencyScore: toNumber(doctrine.transparency_score) || 75,
      mediaScore: toNumber(doctrine.media_score) || 75,
      internetScore: toNumber(doctrine.internet_score) || 80,
      borderScore: toNumber(doctrine.border_score) || 60,
      tradeScore: toNumber(doctrine.trade_score) || 75,
      diplomacyScore: toNumber(doctrine.diplomacy_score) || 70,
      opennessIndex: toNumber(doctrine.openness_index) || 73,
    };

    const ownership = matchedRows.database_kepemilikian_produksi ?? {};
    detail.sector_nationalization = Object.fromEntries(
      ['kelistrikan', 'mineral_energi', 'manufaktur', 'peternakan', 'agrikultur', 'perikanan', 'olahan_pangan']
        .map((key) => [key, toNumber(ownership[key])]),
    );

    const subsidy = matchedRows.database_alokasi_subsidi ?? {};
    const subsidyStates = Object.fromEntries(
      Object.entries(subsidy)
        .filter(([key]) => key.startsWith('sub_'))
        .map(([key, value]) => [key, Boolean(value)]),
    );
    if (Object.keys(subsidyStates).length > 0) detail.subsidy_states = subsidyStates;

    const tourism = (data.tables.database_tempat_wisata ?? []).filter((row) =>
      lookupKeys.has(normalizeKey(row.country_slug)),
    );
    detail.tempat_wisata = tourism.map((row) => ({
      id: toNumber(row.id),
      nama_wisata: String(row.nama_wisata ?? ''),
      penghasilan: toNumber(row.penghasilan),
    }));
    detail.total_tempat_wisata = tourism.length;
    detail.total_wisata_penghasilan = tourism.reduce((total, row) => total + toNumber(row.penghasilan), 0);
    detail.wisata_penghasilan = detail.total_wisata_penghasilan;

    return detail;
  });

  return allCountryData;
}

function getBuildingMetadata(data: LocalMasterData): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};
  for (const row of data.tables.database_building_metadata ?? []) {
    if (typeof row.entry_key !== 'string') continue;
    const value = row.metadata;
    if (typeof value === 'string') {
      try {
        metadata[row.entry_key] = JSON.parse(value);
      } catch {
        metadata[row.entry_key] = value;
      }
    } else {
      metadata[row.entry_key] = value;
    }
  }
  return metadata;
}

function getCountryRows(
  data: LocalMasterData,
  tableName: string,
  countryName: string,
): DataRow[] {
  const normalized = normalizeKey(countryName);
  return (data.tables[tableName] ?? []).filter((row) =>
    [row.country_slug, row.country, row.country_name]
      .map(normalizeKey)
      .includes(normalized),
  );
}

export async function handleLocalMasterDataRequest(
  requestPath: string,
  originalFetch: FetchFunction,
  method: string,
): Promise<Response | null> {
  const url = new URL(requestPath, window.location.origin);
  if (method.toUpperCase() !== 'GET' ||
      (url.pathname !== '/api/country-data' &&
      url.pathname !== '/api/sda-data' &&
      url.pathname !== '/api/price-data' &&
      url.pathname !== '/api/game-bootstrap' &&
      url.pathname !== '/api/building-metadata')) {
    return null;
  }

  try {
    const data = await loadMasterData(originalFetch);

    if (url.pathname === '/api/country-data') {
      const countries = getCountryData(data);
      if (url.searchParams.get('summary') === 'true') {
        return jsonResponse(countries.map((country) => ({
          id: country.id,
          country_slug: country.country_slug,
          name_id: country.name_id,
          name_en: country.name_en,
          capital: country.capital,
          jumlah_penduduk: country.jumlah_penduduk,
          anggaran: country.anggaran,
          religion: country.religion,
          ideology: country.ideology,
        })));
      }
      if (url.searchParams.get('all') === 'true' || !url.searchParams.has('path')) {
        return jsonResponse(countries);
      }

      const path = url.searchParams.get('path') ?? '';
      const baseName = path.split(/[\\/]/).pop()?.replace(/\.ts$/i, '') ?? '';
      const normalizedPath = normalizeKey(baseName.replace(/^\d+_/, ''));
      const numericId = Number(baseName.match(/^\d+/)?.[0]);
      const country = countries.find((entry) =>
        (numericId > 0 && toNumber(entry.id) === numericId) ||
        [entry.country_slug, entry.name_id, entry.name_en]
          .map(normalizeKey)
          .includes(normalizedPath),
      );
      return country
        ? jsonResponse(country)
        : jsonResponse({ error: 'Country not found', requestedPath: path }, 404);
    }

    if (url.pathname === '/api/price-data') {
      const country = url.searchParams.get('country') ?? '';
      const row = getCountryRows(data, 'database_harga_barang', country)[0];
      if (!row) return jsonResponse({ country, prices: null });
      return jsonResponse({
        country,
        prices: Object.fromEntries(
          ['harga_beras', 'harga_daging_sapi', 'harga_ayam', 'harga_minyak_goreng', 'harga_gula', 'harga_telur', 'harga_listrik', 'harga_air']
            .map((key) => [key, toNumber(row[key])]),
        ),
      });
    }

    if (url.pathname === '/api/sda-data') {
      const fields = ['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi'];
      const country = url.searchParams.get('country');
      if (country) {
        const row = getCountryRows(data, 'database_sda', country)[0];
        if (!row) return jsonResponse({ error: 'Country not found' }, 404);
        return jsonResponse(Object.fromEntries(fields.map((key) => [key, Boolean(row[key])])));
      }

      return jsonResponse(Object.fromEntries(
        (data.tables.database_sda ?? []).map((row) => [
          String(row.country ?? row.country_slug ?? ''),
          Object.fromEntries(fields.map((key) => [key, Boolean(row[key])])),
        ]),
      ));
    }

    if (url.pathname === '/api/game-bootstrap') {
      const relations = data.tables.database_hubungan_antar_negara ?? [];
      const embassies = data.tables.database_kedutaan_besar ?? [];
      const tradeAgreements = data.tables.database_mitra_perdagangan ?? [];
      return jsonResponse({
        relations: relations.map(({ country_slug, target_country, relation }) => ({
          country_slug,
          target_country,
          relation: toNumber(relation),
        })),
        embassies: embassies.map(({ country_slug, mitra_country, embassy_type, status }) => ({
          country_slug,
          mitra_country,
          embassy_type,
          status,
        })),
        tradeAgreements: tradeAgreements.map(({ country_slug, mitra_no, mitra_country, trade_type, status }) => ({
          country_slug,
          mitra_no: toNumber(mitra_no),
          mitra_country,
          trade_type,
          status,
        })),
        buildingMetadata: getBuildingMetadata(data),
      });
    }

    return jsonResponse(getBuildingMetadata(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Local master data request failed.';
    console.error('[LocalMasterData] Request failed:', error);
    return jsonResponse({ error: message }, 500);
  }
}
