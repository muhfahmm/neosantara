// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\logic\logikaSubsidi.ts

export interface SubsidyItem {
  id: string;
  name: string;
  category: 'Energi' | 'Pangan' | 'Pendidikan & Kesehatan' | 'Transportasi & Perumahan' | 'UMKM & Ekonomi' | 'Perlindungan Sosial';
  description: string;
  isSubsidized: boolean;
  budgetCost: number; // Nominal penuh angka baku per tahun (contoh: 145000000000000)
  approvalImpact: number; // Persentase kepuasan rakyat (%)
  inflationReduction: number; // Penekanan inflasi (%)
  demoRiskIfDisabled: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
}

export const INITIAL_SUBSIDY_ITEMS: SubsidyItem[] = [
  // 1. ENERGI
  {
    id: "sub_bbm",
    name: "Subsidi Bahan Bakar & Energi Transportasi",
    category: "Energi",
    description: "Menjaga harga bahan bakar tetap terjangkau untuk kendaraan armada publik, distribusi logistik, dan masyarakat.",
    isSubsidized: true,
    budgetCost: 145,
    approvalImpact: 25,
    inflationReduction: 4,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_listrik",
    name: "Subsidi Tarif Listrik Rumah Tangga",
    category: "Energi",
    description: "Bantuan tarif tenaga listrik khusus rumah tangga berpenghasilan rendah dan fasilitas pelayanan publik.",
    isSubsidized: true,
    budgetCost: 69,
    approvalImpact: 18,
    inflationReduction: 2,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_lpg",
    name: "Subsidi Gas Memasak Rumah Tangga",
    category: "Energi",
    description: "Menjamin ketersediaan tabung gas bersubsidi untuk kebutuhan memasak keluarga kurang mampu dan usaha mikro.",
    isSubsidized: true,
    budgetCost: 85,
    approvalImpact: 20,
    inflationReduction: 2,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_pdam",
    name: "Subsidi Layanan Air Bersih",
    category: "Energi",
    description: "Tarif suplai air minum bersubsidi untuk kawasan pemukiman padat dan daerah rawan krisis air.",
    isSubsidized: true,
    budgetCost: 12,
    approvalImpact: 10,
    inflationReduction: 1,
    demoRiskIfDisabled: "Sedang",
  },

  // 2. PANGAN & PERTANIAN
  {
    id: "sub_pupuk",
    name: "Subsidi Pupuk & Saprodi Pertanian",
    category: "Pangan",
    description: "Alokasi pupuk dan benih bersubsidi untuk memangkas biaya produksi tani dan menjaga pasokan pangan nasional.",
    isSubsidized: true,
    budgetCost: 32,
    approvalImpact: 15,
    inflationReduction: 2,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_sembako",
    name: "Operasi Stabilisasi Harga Pangan Pokok",
    category: "Pangan",
    description: "Intervensi pasar pasokan gandum, beras, minyak masak, dan gula saat terjadi lonjakan inflasi.",
    isSubsidized: true,
    budgetCost: 24,
    approvalImpact: 16,
    inflationReduction: 2,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_bantuan_pangan",
    name: "Bantuan Pasokan Pangan Darurat",
    category: "Pangan",
    description: "Distribusi paket bahan pangan pokok bulanan secara gratis untuk keluarga penerima manfaat sosial.",
    isSubsidized: true,
    budgetCost: 19,
    approvalImpact: 14,
    inflationReduction: 1,
    demoRiskIfDisabled: "Sedang",
  },

  // 3. PENDIDIKAN & KESEHATAN
  {
    id: "sub_pendidikan",
    name: "Subsidi Biaya Pendidikan & Beasiswa Pelajar",
    category: "Pendidikan & Kesehatan",
    description: "Pembebasan uang sekolah negeri dan beasiswa penuh bagi pelajar serta mahasiswa berprestasi kurang mampu.",
    isSubsidized: true,
    budgetCost: 55,
    approvalImpact: 22,
    inflationReduction: 1,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_bpjs",
    name: "Jaminan Layanan Kesehatan Nasional",
    category: "Pendidikan & Kesehatan",
    description: "Pembayaran iuran asuransi kesehatan publik gratis bagi masyarakat tidak mampu dan pekerja sektor informal.",
    isSubsidized: true,
    budgetCost: 48,
    approvalImpact: 24,
    inflationReduction: 1,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_vaksin",
    name: "Program Immunisasi & Vaksinasi Publik",
    category: "Pendidikan & Kesehatan",
    description: "Program imunisasi dasar anak dan vaksinasi kesehatan publik bebas biaya di seluruh klinik dan rumah sakit daerah.",
    isSubsidized: false,
    budgetCost: 15,
    approvalImpact: 12,
    inflationReduction: 1,
    demoRiskIfDisabled: "Sedang",
  },

  // 4. TRANSPORTASI & PERUMAHAN
  {
    id: "sub_transport_publik",
    name: "Subsidi Layanan Transportasi Publik",
    category: "Transportasi & Perumahan",
    description: "Diskon tarif komuter kereta api publik dan armada bus kota untuk menekan emisi & beban pengeluaran warga.",
    isSubsidized: true,
    budgetCost: 11,
    approvalImpact: 14,
    inflationReduction: 1,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_perumahan",
    name: "Subsidi Perumahan & Pemukiman Rakyat",
    category: "Transportasi & Perumahan",
    description: "Bantuan suku bunga rendah dan insentif hunian bersubsidi bagi keluarga berpenghasilan rendah.",
    isSubsidized: true,
    budgetCost: 21,
    approvalImpact: 16,
    inflationReduction: 1,
    demoRiskIfDisabled: "Sedang",
  },
  {
    id: "sub_ev",
    name: "Insentif Transisi Transportasi Ramah Lingkungan",
    category: "Transportasi & Perumahan",
    description: "Potongan harga dan insentif pajak untuk adopsi kendaraan bermotor berbasis energi ramah lingkungan.",
    isSubsidized: false,
    budgetCost: 8,
    approvalImpact: 6,
    inflationReduction: 1,
    demoRiskIfDisabled: "Rendah",
  },

  // 5. UMKM & EKONOMI
  {
    id: "sub_kur",
    name: "Subsidi Bunga Kredit Usaha Mikro",
    category: "UMKM & Ekonomi",
    description: "Bantuan suku bunga ringan untuk pinjaman modal usaha kecil, pedagang mandiri, dan kewirausahaan lokal.",
    isSubsidized: true,
    budgetCost: 36,
    approvalImpact: 19,
    inflationReduction: 1,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_pajak_umkm",
    name: "Insentif Bebas Pajak Pengusaha Mikro",
    category: "UMKM & Ekonomi",
    description: "Pembebasan kewajiban pajak penghasilan bagi usaha skala mikro yang baru berkembang.",
    isSubsidized: true,
    budgetCost: 14,
    approvalImpact: 15,
    inflationReduction: 1,
    demoRiskIfDisabled: "Sedang",
  },

  // 6. PERLINDUNGAN SOSIAL
  {
    id: "sub_blt",
    name: "Bantuan Langsung Tunai (BLT)",
    category: "Perlindungan Sosial",
    description: "Transfer dana tunai langsung bagi masyarakat kelompok terbawah untuk menjaga daya beli.",
    isSubsidized: true,
    budgetCost: 42,
    approvalImpact: 26,
    inflationReduction: 0,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_pensiun",
    name: "Tunjangan Jaminan Sosial Lansia",
    category: "Perlindungan Sosial",
    description: "Bantuan santunan dana pensiun dan jaminan sosial bulanan bagi lansia serta pejuang veteran.",
    isSubsidized: true,
    budgetCost: 17,
    approvalImpact: 11,
    inflationReduction: 0,
    demoRiskIfDisabled: "Sedang",
  },
  {
    id: "sub_bencana",
    name: "Dana Tanggap Bencana & Krisis",
    category: "Perlindungan Sosial",
    description: "Dana tak terduga untuk pemulihan infrastruktur publik dan jaringan pengaman sosial saat krisis/bencana.",
    isSubsidized: true,
    budgetCost: 15,
    approvalImpact: 13,
    inflationReduction: 0,
    demoRiskIfDisabled: "Sedang",
  }
];

export interface TotalSubsidySummary {
  totalCost: number;
  activeCount: number;
  totalCount: number;
  totalApprovalBonus: number;
  totalInflationReduction: number;
  highestDemoRisk: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
}

export const calculateSubsidySummary = (items: SubsidyItem[]): TotalSubsidySummary => {
  let totalCost = 0;
  let activeCount = 0;
  let approvalBonus = 0;
  let inflationRed = 0;
  let demoRisks: ('Rendah' | 'Sedang' | 'Tinggi' | 'Kritis')[] = [];

  items.forEach((item) => {
    if (item.isSubsidized) {
      totalCost += item.budgetCost;
      activeCount += 1;
      approvalBonus += item.approvalImpact;
      inflationRed += item.inflationReduction;
    } else {
      demoRisks.push(item.demoRiskIfDisabled);
    }
  });

  let highestDemoRisk: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis' = 'Rendah';
  if (demoRisks.includes('Kritis')) highestDemoRisk = 'Kritis';
  else if (demoRisks.includes('Tinggi')) highestDemoRisk = 'Tinggi';
  else if (demoRisks.includes('Sedang')) highestDemoRisk = 'Sedang';

  return {
    totalCost,
    activeCount,
    totalCount: items.length,
    totalApprovalBonus: approvalBonus,
    totalInflationReduction: inflationRed,
    highestDemoRisk,
  };
};

/**
 * Format nominal ke tampilan mata uang game (EM)
 */
export const formatCurrencyCompact = (amount: number): string => {
  return `${amount.toLocaleString('id-ID')} EM`;
};


