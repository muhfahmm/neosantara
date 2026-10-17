export interface CorruptionScheme {
  id: string;
  name: string;
  category: string;
  ministry: string; // Kementerian/Jabatan terkait
  description: string; // Deskripsi detail skandal
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
  // Kementerian Infrastruktur & Pembangunan
  { 
    id: 'mark_up_pengadaan', 
    name: 'Mark-up Proyek Infrastruktur', 
    category: 'Korupsi Anggaran',
    ministry: 'Kementerian Infrastruktur',
    description: 'Pejabat di Kementerian Infrastruktur diduga melakukan mark-up harga pada proyek pembangunan jalan dan jembatan, merugikan negara miliaran NEO'
  },
  { 
    id: 'anggaran_fiktif', 
    name: 'Proyek Fiktif Pembangunan', 
    category: 'Korupsi Anggaran',
    ministry: 'Kementerian Pembangunan',
    description: 'Terungkap penggelembungan anggaran proyek pembangunan yang tidak pernah dikerjakan oleh oknum di Kementerian Pembangunan'
  },
  { 
    id: 'double_budgeting', 
    name: 'Double Budgeting Infrastruktur', 
    category: 'Korupsi Anggaran',
    ministry: 'Kementerian Infrastruktur',
    description: 'Satu proyek infrastruktur dibiayai ganda dari dua sumber anggaran berbeda, menimbulkan kerugian negara'
  },
  
  // Kementerian Keuangan
  { 
    id: 'suap_pajak', 
    name: 'Suap Keringanan Pajak', 
    category: 'Suap & Gratifikasi',
    ministry: 'Kementerian Keuangan',
    description: 'Oknum pejabat Kementerian Keuangan menerima suap untuk memberikan keringanan pajak kepada konglomerat tertentu'
  },
  { 
    id: 'pajak_gelap', 
    name: 'Manipulasi Penerimaan Pajak', 
    category: 'Birokrasi & Layanan Publik',
    ministry: 'Kementerian Keuangan',
    description: 'Penerimaan pajak tidak tercatat dengan benar, diduga mengalir ke kantong oknum Dirjen Pajak'
  },
  
  // Kepala Bank Sentral
  { 
    id: 'bailout_palsu', 
    name: 'Bailout Fiktif Bank Bermasalah', 
    category: 'Keuangan & Perbankan',
    ministry: 'Kepala Bank Sentral',
    description: 'Dana bailout disalurkan ke bank yang sebenarnya tidak bermasalah, diduga ada kongkalikong dengan Kepala Bank Sentral'
  },
  { 
    id: 'kredit_macet_gelap', 
    name: 'Penghapusan Kredit Macet Ilegal', 
    category: 'Keuangan & Perbankan',
    ministry: 'Kepala Bank Sentral',
    description: 'Kredit macet pengusaha besar dihapus tanpa prosedur, merugikan perbankan nasional'
  },
  { 
    id: 'pencucian_uang', 
    name: 'Pencucian Uang Lintas Negara', 
    category: 'Keuangan & Perbankan',
    ministry: 'Kepala Bank Sentral',
    description: 'Uang hasil korupsi dicuci melalui transaksi perbankan yang lolos dari pengawasan Bank Sentral'
  },
  
  // Kementerian Pertahanan & Militer
  { 
    id: 'mark_up_alutsista', 
    name: 'Mark-up Alutsista', 
    category: 'Militer & Pertahanan',
    ministry: 'Kementerian Pertahanan',
    description: 'Pembelian alutsista di-mark-up hingga 300% dari harga pasar oleh oknum Kementerian Pertahanan'
  },
  { 
    id: 'alutsista_bekas', 
    name: 'Alutsista Bekas Dijual Baru', 
    category: 'Militer & Pertahanan',
    ministry: 'Kementerian Pertahanan',
    description: 'Alutsista bekas dipalsukan dokumennya sebagai barang baru dalam pengadaan Kementerian Pertahanan'
  },
  { 
    id: 'suap_lelang_militer', 
    name: 'Suap Tender Militer', 
    category: 'Militer & Pertahanan',
    ministry: 'Kementerian Pertahanan',
    description: 'Tender pengadaan alutsista dikondisikan untuk pemenang tertentu yang menyuap pejabat Kemhan'
  },
  { 
    id: 'korupsi_logistik', 
    name: 'Korupsi Logistik Militer', 
    category: 'Militer & Pertahanan',
    ministry: 'Komandan Angkatan Darat',
    description: 'Logistik untuk pasukan dikorupsi oleh oknum perwira tinggi, prajurit kekurangan supplies'
  },
  { 
    id: 'jual_bantuan_militer', 
    name: 'Bantuan Militer Dijual', 
    category: 'Militer & Pertahanan',
    ministry: 'Komandan Armada',
    description: 'Bantuan militer dari negara sekutu dijual ke pasar gelap oleh oknum komandan armada laut'
  },
  
  // Kementerian Pendidikan
  { 
    id: 'buku_fiktif', 
    name: 'Pengadaan Buku Fiktif', 
    category: 'Kesehatan, Pendidikan & Sosial',
    ministry: 'Kementerian Pendidikan',
    description: 'Dana pengadaan buku pelajaran dikorupsi, buku tidak pernah sampai ke sekolah-sekolah'
  },
  { 
    id: 'beasiswa_palsu', 
    name: 'Beasiswa Fiktif', 
    category: 'Kesehatan, Pendidikan & Sosial',
    ministry: 'Kementerian Pendidikan',
    description: 'Dana beasiswa untuk mahasiswa kurang mampu dikurangi dan dialihkan ke nama-nama fiktif'
  },
  
  // Kementerian Kesehatan
  { 
    id: 'obat_palsu', 
    name: 'Pengadaan Obat Palsu', 
    category: 'Kesehatan, Pendidikan & Sosial',
    ministry: 'Kementerian Kesehatan',
    description: 'Oknum pejabat Kementerian Kesehatan mengadakan obat palsu/kadaluarsa untuk rumah sakit pemerintah'
  },
  { 
    id: 'korupsi_vaksin', 
    name: 'Korupsi Program Vaksinasi', 
    category: 'Kesehatan, Pendidikan & Sosial',
    ministry: 'Kementerian Kesehatan',
    description: 'Dana program vaksinasi nasional dikorupsi, jumlah vaksin tidak sesuai dengan anggaran yang dikucurkan'
  },
  { 
    id: 'dana_bansos_gelap', 
    name: 'Bantuan Sosial Tidak Tepat Sasaran', 
    category: 'Kesehatan, Pendidikan & Sosial',
    ministry: 'Kementerian Kesehatan',
    description: 'Dana bantuan sosial untuk rakyat miskin dipotong dan tidak sampai pada penerima yang berhak'
  },
  
  // Kementerian Kehakiman & Polisi
  { 
    id: 'mafia_peradilan', 
    name: 'Mafia Peradilan', 
    category: 'Peradilan & Penegakan Hukum',
    ministry: 'Kementerian Kehakiman',
    description: 'Jaringan mafia peradilan melibatkan hakim, jaksa, dan panitera untuk memperjualbelikan putusan'
  },
  { 
    id: 'jual_putusan', 
    name: 'Jual Beli Putusan Hakim', 
    category: 'Peradilan & Penegakan Hukum',
    ministry: 'Kementerian Kehakiman',
    description: 'Hakim menerima suap untuk meringankan atau membebaskan terdakwa koruptor dalam persidangan'
  },
  { 
    id: 'rekayasa_kasus', 
    name: 'Rekayasa Kasus Hukum', 
    category: 'Peradilan & Penegakan Hukum',
    ministry: 'Kementerian Kehakiman',
    description: 'Kasus hukum direkayasa untuk menjerat atau membebaskan pihak tertentu sesuai pesanan'
  },
  { 
    id: 'suap_polisi', 
    name: 'Suap Penegakan Hukum', 
    category: 'Peradilan & Penegakan Hukum',
    ministry: 'Polisi',
    description: 'Oknum polisi menerima suap untuk menghentikan penyidikan atau memanipulasi bukti dalam kasus korupsi'
  },
  { 
    id: 'tahanan_bayar', 
    name: 'Fasilitas Tahanan Berbayar', 
    category: 'Peradilan & Penegakan Hukum',
    ministry: 'Polisi',
    description: 'Tahanan koruptor mendapat fasilitas mewah dengan membayar oknum penjaga lapas dan polisi'
  },
  
  // Kementerian Perdagangan
  { 
    id: 'suap_izin_usaha', 
    name: 'Suap Izin Usaha', 
    category: 'Suap & Gratifikasi',
    ministry: 'Kementerian Perdagangan',
    description: 'Pengusaha menyuap pejabat Kementerian Perdagangan untuk mempercepat atau mendapatkan izin usaha'
  },
  { 
    id: 'kolusi_pengusaha', 
    name: 'Kolusi Izin Monopoli', 
    category: 'Nepotisme & Kolusi',
    ministry: 'Kementerian Perdagangan',
    description: 'Pejabat Kemdag berkolusi dengan pengusaha tertentu untuk memberikan hak monopoli impor/ekspor'
  },
  
  // Kementerian Luar Negeri
  { 
    id: 'transfer_gelap', 
    name: 'Transfer Gelap ke Luar Negeri', 
    category: 'Keuangan & Perbankan',
    ministry: 'Kementerian Luar Negeri',
    description: 'Dana pemerintah ditransfer ke luar negeri menggunakan jalur diplomatik untuk menghindari deteksi'
  },
  { 
    id: 'gratifikasi_pejabat', 
    name: 'Gratifikasi Diplomatik', 
    category: 'Suap & Gratifikasi',
    ministry: 'Kementerian Luar Negeri',
    description: 'Pejabat Kemenlu menerima gratifikasi dari negara asing untuk mempengaruhi kebijakan diplomatik'
  },
  
  // Kementerian Lingkungan Hidup
  { 
    id: 'royalti_tambang_gelap', 
    name: 'Royalti Tambang Tidak Masuk Kas', 
    category: 'Energi & SDA',
    ministry: 'Kementerian Lingkungan Hidup',
    description: 'Royalti dari perusahaan tambang tidak masuk kas negara, diduga dikorupsi oknum Kementerian LH'
  },
  { 
    id: 'izin_tambang_liar', 
    name: 'Izin Tambang Tanpa Kajian', 
    category: 'Energi & SDA',
    ministry: 'Kementerian Lingkungan Hidup',
    description: 'Izin tambang diterbitkan tanpa kajian lingkungan yang proper setelah ada suap ke pejabat KLH'
  },
  { 
    id: 'reklamasi_palsu', 
    name: 'Reklamasi Tambang Fiktif', 
    category: 'Energi & SDA',
    ministry: 'Kementerian Lingkungan Hidup',
    description: 'Dana reklamasi bekas tambang dikorupsi, lokasi tambang tidak pernah direklamasi'
  },
  { 
    id: 'smuggling_minyak', 
    name: 'Penyelundupan Sumber Daya Alam', 
    category: 'Energi & SDA',
    ministry: 'Kementerian Lingkungan Hidup',
    description: 'Penyelundupan minyak dan SDA lainnya terjadi dengan sepengetahuan oknum di Kementerian LH'
  },
  { 
    id: 'korupsi_pertamina', 
    name: 'Korupsi BUMN Energi', 
    category: 'Energi & SDA',
    ministry: 'Kementerian Lingkungan Hidup',
    description: 'BUMN pengelola energi dan SDA dikorupsi oleh direksi yang ditunjuk secara politis'
  },
  
  // Kementerian Perumahan
  { 
    id: 'subsidi_bocor', 
    name: 'Subsidi Perumahan Rakyat Bocor', 
    category: 'Korupsi Anggaran',
    ministry: 'Kementerian Perumahan',
    description: 'Dana subsidi untuk program rumah rakyat dipotong oleh oknum di Kementerian Perumahan'
  },
  { 
    id: 'dana_hibah_gelap', 
    name: 'Hibah Tanah Untuk Kroni', 
    category: 'Korupsi Anggaran',
    ministry: 'Kementerian Perumahan',
    description: 'Tanah negara untuk program perumahan rakyat dihibahkan kepada kroni pejabat Kemenpera'
  },
  
  // Kementerian Pariwisata
  { 
    id: 'uang_pelicin', 
    name: 'Uang Pelicin Perizinan Pariwisata', 
    category: 'Suap & Gratifikasi',
    ministry: 'Kementerian Pariwisata',
    description: 'Investor pariwisata harus membayar uang pelicin ke oknum Kementerian Pariwisata untuk mendapat izin'
  },
  
  // Kementerian Olahraga
  { 
    id: 'kickback_kontrak', 
    name: 'Kickback Pembangunan Stadion', 
    category: 'Suap & Gratifikasi',
    ministry: 'Kementerian Olahraga',
    description: 'Kontraktor pembangunan stadion memberikan kickback ke pejabat Kementerian Olahraga untuk memenangkan tender'
  },
  
  // Kementerian Kebudayaan
  { 
    id: 'titip_proyek', 
    name: 'Titipan Proyek Kebudayaan', 
    category: 'Nepotisme & Kolusi',
    ministry: 'Kementerian Kebudayaan',
    description: 'Proyek pelestarian budaya dititipkan kepada kerabat dan kroni pejabat Kemendikbud'
  },
  { 
    id: 'nepotisme_jabatan', 
    name: 'Nepotisme Jabatan Kebudayaan', 
    category: 'Nepotisme & Kolusi',
    ministry: 'Kementerian Kebudayaan',
    description: 'Jabatan strategis di museum dan lembaga budaya diberikan kepada keluarga dan kerabat pejabat'
  },
  
  // Sains dan Penelitian
  { 
    id: 'data_palsu', 
    name: 'Manipulasi Data Penelitian', 
    category: 'Birokrasi & Layanan Publik',
    ministry: 'Sains dan Penelitian',
    description: 'Data hasil penelitian negara dipalsukan untuk membenarkan kebijakan yang menguntungkan pihak tertentu'
  },
  
  // Garda Nasional
  { 
    id: 'pungli_layanan', 
    name: 'Pungutan Liar Pengamanan', 
    category: 'Birokrasi & Layanan Publik',
    ministry: 'Garda Nasional',
    description: 'Oknum Garda Nasional melakukan pungli kepada warga di wilayah kependudukan yang dijaga'
  },
  
  // Layanan Darurat
  { 
    id: 'calo_birokrasi', 
    name: 'Calo Layanan Darurat', 
    category: 'Birokrasi & Layanan Publik',
    ministry: 'Layanan Darurat',
    description: 'Muncul calo yang menjanjikan respons cepat layanan darurat dengan membayar sejumlah uang'
  },
  { 
    id: 'proses_lambat', 
    name: 'Bantuan Darurat Sengaja Diperlambat', 
    category: 'Birokrasi & Layanan Publik',
    ministry: 'Layanan Darurat',
    description: 'Proses bantuan darurat diperlambat kecuali ada uang pelicin kepada oknum petugas'
  },
  
  // Politik Umum
  { 
    id: 'beli_suara', 
    name: 'Politik Uang Pemilu', 
    category: 'Politik & Pemilu',
    ministry: 'Kabinet',
    description: 'Praktik politik uang dan pembelian suara rakyat terdeteksi dalam pemilu yang baru saja berlangsung'
  },
  { 
    id: 'dana_kampanye_gelap', 
    name: 'Dana Kampanye Gelap', 
    category: 'Politik & Pemilu',
    ministry: 'Kabinet',
    description: 'Sumber dana kampanye tidak jelas, diduga dari hasil korupsi dan pencucian uang'
  },
  { 
    id: 'penggelembungan_dpt', 
    name: 'Manipulasi Daftar Pemilih', 
    category: 'Politik & Pemilu',
    ministry: 'Kabinet',
    description: 'Daftar pemilih tetap dimanipulasi untuk menguntungkan kandidat tertentu dalam pemilu'
  },
  { 
    id: 'politik_uang', 
    name: 'Suap Untuk Jabatan', 
    category: 'Politik & Pemilu',
    ministry: 'Kabinet',
    description: 'Jabatan menteri dan pejabat tinggi diperjualbelikan dalam praktik politik uang'
  },
  { 
    id: 'suap_parlemen', 
    name: 'Suap Anggota Parlemen', 
    category: 'Politik & Pemilu',
    ministry: 'Kabinet',
    description: 'Anggota parlemen menerima suap untuk meloloskan atau menggagalkan RUU tertentu'
  },
  { 
    id: 'kroni_kabinet', 
    name: 'Kronisme dalam Kabinet', 
    category: 'Nepotisme & Kolusi',
    ministry: 'Kabinet',
    description: 'Penunjukan menteri dan pejabat tinggi lebih mengutamakan kedekatan pribadi daripada kompetensi'
  },
  { 
    id: 'dinasti_politik', 
    name: 'Dinasti Politik Keluarga', 
    category: 'Nepotisme & Kolusi',
    ministry: 'Kabinet',
    description: 'Anggota keluarga pejabat tinggi menduduki posisi strategis di berbagai kementerian'
  },
  { 
    id: 'obligasi_fiktif', 
    name: 'Obligasi Negara Fiktif', 
    category: 'Keuangan & Perbankan',
    ministry: 'Kabinet',
    description: 'Penerbitan obligasi negara dimanipulasi, dana tidak masuk kas negara sepenuhnya'
  },
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
    agencyLevel: Math.round(clamp(1 + ((seed >>> 7) % 4) + ruleOfLawLevel * 0.3, 1, 20)),
    auditCoverage: Math.round(clamp(
      8 + ((seed >>> 13) % 24) + (hasTransparency ? clamp(transparency, 0, 100) * 0.12 : 0),
      2,
      65,
    )),
    whistleblowerProtection: Math.round(clamp(
      ((seed >>> 19) % 3) + (hasTransparency ? clamp(transparency, 0, 100) * 0.025 : 0),
      1,
      20,
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
    ? clamp(currentAgencyLevel, 1, 20)
    : defaults.agencyLevel;
  const auditCoverage = currentAuditCoverage !== null
    ? clamp(currentAuditCoverage, 0, 100)
    : defaults.auditCoverage;
  const whistleblowerProtection = currentWhistleblowerProtection !== null
    ? clamp(currentWhistleblowerProtection, 1, 20)
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
  const agencyLevel = Math.floor(clamp(Number(initialized.anti_corruption_agency_level), 1, 20));
  const auditCoverage = clamp(Number(initialized.audit_coverage), 0, 100);
  const whistleblowerProtection = Math.floor(clamp(Number(initialized.whistleblower_protection), 1, 20));
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

export function getCorruptionMinistries(): string[] {
  return Array.from(new Set(CORRUPTION_SCHEMES.map(scheme => scheme.ministry)));
}

export function getSchemesByMinistry(ministry: string): CorruptionScheme[] {
  return CORRUPTION_SCHEMES.filter(scheme => scheme.ministry === ministry);
}

export function getSchemeDescription(schemeId: string): string {
  const scheme = CORRUPTION_SCHEMES.find(s => s.id === schemeId);
  return scheme?.description || 'Kasus korupsi terdeteksi dalam pemerintahan.';
}

