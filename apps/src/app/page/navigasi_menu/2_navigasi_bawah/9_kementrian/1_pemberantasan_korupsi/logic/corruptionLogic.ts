export interface CorruptionScheme {
  id: string;
  name: string;
  category: string;
}

export interface ActiveCorruptionScandal extends CorruptionScheme {
  id: string;
  schemeId: string;
  severity: 'ringan' | 'sedang' | 'berat';
  investigationStatus: 'belum_diselidiki' | 'diselidiki' | 'bukti_ditemukan';
  investigationAttempts: number;
  lastInvestigationDate?: string;
  exposedDate: string;
  resolvedDate?: string;
  budgetLoss: number;
  satisfactionLoss: number;
  resolved: boolean;
}

export interface CorruptionCountryDetail extends Record<string, unknown> {
  anggaran?: number;
  corruption_index?: number;
  anti_corruption_agency_level?: number;
  audit_coverage?: number;
  whistleblower_protection?: number;
  active_scandals?: ActiveCorruptionScandal[];
  corruption_last_processed_month?: string;
  kepuasan?: number;
  kepuasan_masyarakat?: number;
  presidentRating?: number;
  international_reputation?: number;
  reputasi_diplomatik?: number;
  reputasi_diplomatik_poin?: number;
  pending_notifications?: unknown[];
}

export const CORRUPTION_SCHEMES: CorruptionScheme[] = [
  { id: 'mark_up_pengadaan', name: 'Mark-up Pengadaan', category: 'Korupsi Anggaran' },
  { id: 'anggaran_fiktif', name: 'Anggaran Fiktif', category: 'Korupsi Anggaran' },
  { id: 'double_budgeting', name: 'Double Budgeting', category: 'Korupsi Anggaran' },
  { id: 'dana_hibah_gelap', name: 'Dana Hibah Gelap', category: 'Korupsi Anggaran' },
  { id: 'subsidi_bocor', name: 'Subsidi Bocor', category: 'Korupsi Anggaran' },
  { id: 'suap_izin_usaha', name: 'Suap Izin Usaha', category: 'Suap & Gratifikasi' },
  { id: 'gratifikasi_pejabat', name: 'Gratifikasi Pejabat', category: 'Suap & Gratifikasi' },
  { id: 'uang_pelicin', name: 'Uang Pelicin', category: 'Suap & Gratifikasi' },
  { id: 'kickback_kontrak', name: 'Kickback Kontrak', category: 'Suap & Gratifikasi' },
  { id: 'suap_pajak', name: 'Suap Pajak', category: 'Suap & Gratifikasi' },
  { id: 'nepotisme_jabatan', name: 'Nepotisme Jabatan', category: 'Nepotisme & Kolusi' },
  { id: 'kolusi_pengusaha', name: 'Kolusi Pengusaha', category: 'Nepotisme & Kolusi' },
  { id: 'kroni_kabinet', name: 'Kroni Kabinet', category: 'Nepotisme & Kolusi' },
  { id: 'dinasti_politik', name: 'Dinasti Politik', category: 'Nepotisme & Kolusi' },
  { id: 'titip_proyek', name: 'Titip Proyek', category: 'Nepotisme & Kolusi' },
  { id: 'mark_up_alutsista', name: 'Mark-up Alutsista', category: 'Militer & Pertahanan' },
  { id: 'alutsista_bekas', name: 'Alutsista Bekas Dijual Baru', category: 'Militer & Pertahanan' },
  { id: 'suap_lelang_militer', name: 'Suap Lelang Militer', category: 'Militer & Pertahanan' },
  { id: 'korupsi_logistik', name: 'Korupsi Logistik', category: 'Militer & Pertahanan' },
  { id: 'jual_bantuan_militer', name: 'Jual Bantuan Militer', category: 'Militer & Pertahanan' },
  { id: 'royalti_tambang_gelap', name: 'Royalti Tambang Gelap', category: 'Energi & SDA' },
  { id: 'izin_tambang_liar', name: 'Izin Tambang Liar', category: 'Energi & SDA' },
  { id: 'smuggling_minyak', name: 'Penyelundupan Minyak', category: 'Energi & SDA' },
  { id: 'korupsi_pertamina', name: 'Korupsi BUMN Energi', category: 'Energi & SDA' },
  { id: 'reklamasi_palsu', name: 'Reklamasi Palsu', category: 'Energi & SDA' },
  { id: 'beli_suara', name: 'Beli Suara', category: 'Politik & Pemilu' },
  { id: 'dana_kampanye_gelap', name: 'Dana Kampanye Gelap', category: 'Politik & Pemilu' },
  { id: 'penggelembungan_dpt', name: 'Penggelembungan DPT', category: 'Politik & Pemilu' },
  { id: 'politik_uang', name: 'Politik Uang', category: 'Politik & Pemilu' },
  { id: 'suap_parlemen', name: 'Suap Parlemen', category: 'Politik & Pemilu' },
  { id: 'pungli_layanan', name: 'Pungli Layanan', category: 'Birokrasi & Layanan Publik' },
  { id: 'calo_birokrasi', name: 'Calo Birokrasi', category: 'Birokrasi & Layanan Publik' },
  { id: 'proses_lambat', name: 'Proses Sengaja Dilambatkan', category: 'Birokrasi & Layanan Publik' },
  { id: 'data_palsu', name: 'Manipulasi Data', category: 'Birokrasi & Layanan Publik' },
  { id: 'pajak_gelap', name: 'Pajak Gelap', category: 'Birokrasi & Layanan Publik' },
  { id: 'mafia_peradilan', name: 'Mafia Peradilan', category: 'Peradilan & Penegakan Hukum' },
  { id: 'suap_polisi', name: 'Suap Polisi', category: 'Peradilan & Penegakan Hukum' },
  { id: 'jual_putusan', name: 'Jual Putusan', category: 'Peradilan & Penegakan Hukum' },
  { id: 'rekayasa_kasus', name: 'Rekayasa Kasus', category: 'Peradilan & Penegakan Hukum' },
  { id: 'tahanan_bayar', name: 'Tahanan Bayar', category: 'Peradilan & Penegakan Hukum' },
  { id: 'bailout_palsu', name: 'Bailout Palsu', category: 'Keuangan & Perbankan' },
  { id: 'kredit_macet_gelap', name: 'Kredit Macet Gelap', category: 'Keuangan & Perbankan' },
  { id: 'pencucian_uang', name: 'Pencucian Uang', category: 'Keuangan & Perbankan' },
  { id: 'transfer_gelap', name: 'Transfer Gelap ke Luar Negeri', category: 'Keuangan & Perbankan' },
  { id: 'obligasi_fiktif', name: 'Obligasi Fiktif', category: 'Keuangan & Perbankan' },
  { id: 'dana_bansos_gelap', name: 'Dana Bansos Gelap', category: 'Kesehatan, Pendidikan & Sosial' },
  { id: 'obat_palsu', name: 'Obat Palsu', category: 'Kesehatan, Pendidikan & Sosial' },
  { id: 'buku_fiktif', name: 'Buku Fiktif', category: 'Kesehatan, Pendidikan & Sosial' },
  { id: 'beasiswa_palsu', name: 'Beasiswa Palsu', category: 'Kesehatan, Pendidikan & Sosial' },
  { id: 'korupsi_vaksin', name: 'Korupsi Vaksin', category: 'Kesehatan, Pendidikan & Sosial' },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

function getCountryIdentity(detail: CorruptionCountryDetail): string {
  return String(
    detail.iso ??
    detail.country_slug ??
    detail.country ??
    detail.name_en ??
    detail.name_id ??
    detail.nama_negara ??
    detail.name ??
    'unknown-country',
  ).trim().toLowerCase();
}

function hashCountryIdentity(identity: string, salt: string): number {
  let hash = 2166136261;
  for (const character of `${identity}:${salt}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getCountryCorruptionDefaults(detail: CorruptionCountryDetail) {
  const identity = getCountryIdentity(detail);
  const seed = hashCountryIdentity(identity, 'corruption-profile');
  const openness = detail.doktrin_keterbukaan && typeof detail.doktrin_keterbukaan === 'object'
    ? detail.doktrin_keterbukaan as Record<string, unknown>
    : {};
  const transparency = Number(openness.transparencyScore);
  const hasTransparency = Number.isFinite(transparency);
  const ruleOfLawLevel = Math.max(
    0,
    Number(detail.kem_kehakiman ?? detail.level_kehakiman ?? detail.kehakiman ?? 0),
    Number(detail.keamanan_polisi ?? detail.level_polisi ?? detail.polisi ?? 0),
  );
  const legalInfrastructure = [
    detail.pusat_bantuan_hukum,
    detail.pengadilan,
    detail.kejaksaan,
    detail.kantor_polisi,
    detail.pos_polisi,
  ].reduce<number>((total, value) => total + Math.max(0, Number(value) || 0), 0);
  const transparencyAdjustment = hasTransparency ? (50 - clamp(transparency, 0, 100)) * 0.3 : 0;
  const legalAdjustment = Math.min(12, ruleOfLawLevel * 1.5 + Math.sqrt(legalInfrastructure) * 0.8);
  const baseIndex = clamp(25 + (seed % 41) + transparencyAdjustment - legalAdjustment, 5, 85);

  return {
    index: Math.round(baseIndex),
    agencyLevel: Math.round(clamp(1 + ((seed >>> 7) % 4) + ruleOfLawLevel * 0.3, 0, 10)),
    auditCoverage: Math.round(clamp(
      8 + ((seed >>> 13) % 24) + (hasTransparency ? clamp(transparency, 0, 100) * 0.12 : 0),
      2,
      65,
    )),
    whistleblowerProtection: Math.round(clamp(
      ((seed >>> 19) % 3) + (hasTransparency ? clamp(transparency, 0, 100) * 0.025 : 0),
      0,
      10,
    )),
  };
}

export function initializeCorruptionProfile<T extends CorruptionCountryDetail>(detail: T): T {
  const defaults = getCountryCorruptionDefaults(detail);
  const existingNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const currentIndex = existingNumber(detail.corruption_index);
  const currentAgencyLevel = existingNumber(detail.anti_corruption_agency_level);
  const currentAuditCoverage = existingNumber(detail.audit_coverage);
  const currentWhistleblowerProtection = existingNumber(detail.whistleblower_protection);
  const corruptionIndex = currentIndex !== null
    ? clamp(currentIndex, 0, 100)
    : defaults.index;
  const agencyLevel = currentAgencyLevel !== null
    ? clamp(currentAgencyLevel, 0, 10)
    : defaults.agencyLevel;
  const auditCoverage = currentAuditCoverage !== null
    ? clamp(currentAuditCoverage, 0, 100)
    : defaults.auditCoverage;
  const whistleblowerProtection = currentWhistleblowerProtection !== null
    ? clamp(currentWhistleblowerProtection, 0, 10)
    : defaults.whistleblowerProtection;
  const activeScandals = Array.isArray(detail.active_scandals) ? detail.active_scandals : [];

  if (
    detail.corruption_index === corruptionIndex &&
    detail.anti_corruption_agency_level === agencyLevel &&
    detail.audit_coverage === auditCoverage &&
    detail.whistleblower_protection === whistleblowerProtection &&
    detail.active_scandals === activeScandals
  ) {
    return detail;
  }

  return {
    ...detail,
    corruption_index: corruptionIndex,
    anti_corruption_agency_level: agencyLevel,
    audit_coverage: auditCoverage,
    whistleblower_protection: whistleblowerProtection,
    active_scandals: activeScandals,
  };
}

export function getCorruptionMetrics(detail: CorruptionCountryDetail | null | undefined) {
  const initialized = initializeCorruptionProfile(detail ?? {});
  const index = clamp(Number(initialized.corruption_index), 0, 100);
  const agencyLevel = Math.floor(clamp(Number(initialized.anti_corruption_agency_level), 0, 10));
  const auditCoverage = clamp(Number(initialized.audit_coverage), 0, 100);
  const whistleblowerProtection = Math.floor(clamp(Number(initialized.whistleblower_protection), 0, 10));
  return {
    index,
    agencyLevel,
    auditCoverage,
    whistleblowerProtection,
    bribeRisk: Math.round(clamp(index * 0.9 + (100 - auditCoverage) * 0.15 - agencyLevel * 2, 0, 100)),
    kickbackRate: Math.round(clamp(index * 0.2 + agencyLevel * 0.25, 0, 30)),
    ottChance: Math.round(clamp(5 + agencyLevel * 5 + auditCoverage * 0.25 + whistleblowerProtection * 2 + index * 0.1, 0, 95)),
    scandals: Array.isArray(initialized.active_scandals)
      ? initialized.active_scandals
        .filter(scandal => scandal && typeof scandal.id === 'string')
        .map((scandal): ActiveCorruptionScandal => ({
          ...scandal,
          schemeId: typeof scandal.schemeId === 'string' ? scandal.schemeId : scandal.id,
          severity: scandal.severity === 'sedang' || scandal.severity === 'berat' ? scandal.severity : 'ringan',
          investigationStatus:
            scandal.investigationStatus === 'diselidiki' || scandal.investigationStatus === 'bukti_ditemukan'
              ? scandal.investigationStatus
              : 'belum_diselidiki',
          investigationAttempts: Math.max(0, Number(scandal.investigationAttempts) || 0),
          budgetLoss: Math.max(0, Number(scandal.budgetLoss) || 0),
          satisfactionLoss: Math.max(0, Number(scandal.satisfactionLoss) || 0),
          resolved: Boolean(scandal.resolved),
        }))
      : [],
  };
}

export function getExposureChance(detail: CorruptionCountryDetail | null | undefined): number {
  const metrics = getCorruptionMetrics(detail);
  const chance = 0.02 +
    metrics.index * 0.003 +
    metrics.auditCoverage * 0.001 +
    metrics.agencyLevel * 0.015 +
    metrics.whistleblowerProtection * 0.012;
  return Math.round(clamp(chance, 0.01, 0.75) * 100);
}

export function getActiveSectorImpacts(detail: CorruptionCountryDetail | null | undefined) {
  const metrics = getCorruptionMetrics(detail);
  const unresolved = metrics.scandals.filter(scandal => !scandal.resolved);
  const countMatching = (ids: string[]) => unresolved.filter(scandal => ids.includes(scandal.schemeId)).length;
  const taxLeakCases = countMatching(['suap_pajak', 'pajak_gelap']);
  const militaryCases = countMatching([
    'mark_up_alutsista',
    'alutsista_bekas',
    'suap_lelang_militer',
    'korupsi_logistik',
    'jual_bantuan_militer',
  ]);
  const publicServiceCases = countMatching([
    'dana_bansos_gelap',
    'obat_palsu',
    'buku_fiktif',
    'beasiswa_palsu',
    'korupsi_vaksin',
    'pungli_layanan',
  ]);
  const diplomacyCases = countMatching(['pencucian_uang', 'transfer_gelap']);

  return {
    taxRevenueLossPercent: Math.min(25, taxLeakCases * 5),
    militaryEffectivenessLossPercent: Math.min(30, militaryCases * 5),
    publicServiceLossPercent: Math.min(25, publicServiceCases * 5),
    internationalReputationLoss: Math.min(30, diplomacyCases * 5),
    internationalReputationScore: Math.max(0, Math.min(100,
      (() => {
        const reputation = detail?.reputasi_diplomatik_poin ?? detail?.international_reputation;
        const numericReputation = Number(reputation);
        const baseReputation = reputation !== null && reputation !== undefined && Number.isFinite(numericReputation)
          ? numericReputation
          : 45 + ((hashCountryIdentity(getCountryIdentity(detail ?? {}), 'diplomatic-standing') >>> 23) % 56);
        return baseReputation - Math.min(30, diplomacyCases * 5);
      })(),
    )),
    activeScandals: unresolved.length,
  };
}

export function formatCorruptionCurrency(value: number): string {
  return `${Math.max(0, Math.round(value)).toLocaleString('id-ID')} NEO`;
}

export function getCorruptionCategories(): string[] {
  return Array.from(new Set(CORRUPTION_SCHEMES.map(scheme => scheme.category)));
}
