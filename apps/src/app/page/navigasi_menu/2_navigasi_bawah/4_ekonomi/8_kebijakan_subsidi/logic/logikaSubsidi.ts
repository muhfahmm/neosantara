// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\logic\logikaSubsidi.ts

export interface SubsidyItem {
  id: string;
  name: string;
  category: 'Energi' | 'Pangan' | 'Pendidikan & Kesehatan' | 'Transportasi & Perumahan' | 'UMKM & Ekonomi' | 'Perlindungan Sosial';
  description: string;
  isSubsidized: boolean;
  apbnCostTrillion: number; // Dalam Triliun Rp per tahun
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
    apbnCostTrillion: 145.0,
    approvalImpact: 25,
    inflationReduction: 3.5,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_listrik",
    name: "Subsidi Tarif Listrik Rumah Tangga",
    category: "Energi",
    description: "Bantuan tarif tenaga listrik khusus rumah tangga berpenghasilan rendah dan fasilitas pelayanan publik.",
    isSubsidized: true,
    apbnCostTrillion: 68.5,
    approvalImpact: 18,
    inflationReduction: 1.8,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_lpg",
    name: "Subsidi Gas Memasak Rumah Tangga",
    category: "Energi",
    description: "Menjamin ketersediaan tabung gas bersubsidi untuk kebutuhan memasak keluarga kurang mampu dan usaha mikro.",
    isSubsidized: true,
    apbnCostTrillion: 85.2,
    approvalImpact: 20,
    inflationReduction: 2.2,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_pdam",
    name: "Subsidi Layanan Air Bersih",
    category: "Energi",
    description: "Tarif suplai air minum bersubsidi untuk kawasan pemukiman padat dan daerah rawan krisis air.",
    isSubsidized: true,
    apbnCostTrillion: 12.0,
    approvalImpact: 10,
    inflationReduction: 0.5,
    demoRiskIfDisabled: "Sedang",
  },

  // 2. PANGAN & PERTANIAN
  {
    id: "sub_pupuk",
    name: "Subsidi Pupuk & Saprodi Pertanian",
    category: "Pangan",
    description: "Alokasi pupuk dan benih bersubsidi untuk memangkas biaya produksi tani dan menjaga pasokan pangan nasional.",
    isSubsidized: true,
    apbnCostTrillion: 32.4,
    approvalImpact: 15,
    inflationReduction: 1.5,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_sembako",
    name: "Operasi Stabilisasi Harga Pangan Pokok",
    category: "Pangan",
    description: "Intervensi pasar pasokan gandum, beras, minyak masak, dan gula saat terjadi lonjakan inflasi.",
    isSubsidized: true,
    apbnCostTrillion: 24.0,
    approvalImpact: 16,
    inflationReduction: 2.0,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_bantuan_pangan",
    name: "Bantuan Pasokan Pangan Darurat",
    category: "Pangan",
    description: "Distribusi paket bahan pangan pokok bulanan secara gratis untuk keluarga penerima manfaat sosial.",
    isSubsidized: true,
    apbnCostTrillion: 18.5,
    approvalImpact: 14,
    inflationReduction: 0.8,
    demoRiskIfDisabled: "Sedang",
  },

  // 3. PENDIDIKAN & KESEHATAN
  {
    id: "sub_pendidikan",
    name: "Subsidi Biaya Pendidikan & Beasiswa Pelajar",
    category: "Pendidikan & Kesehatan",
    description: "Pembebasan uang sekolah negeri dan beasiswa penuh bagi pelajar serta mahasiswa berprestasi kurang mampu.",
    isSubsidized: true,
    apbnCostTrillion: 55.0,
    approvalImpact: 22,
    inflationReduction: 0.4,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_bpjs",
    name: "Jaminan Layanan Kesehatan Nasional",
    category: "Pendidikan & Kesehatan",
    description: "Pembayaran iuran asuransi kesehatan publik gratis bagi masyarakat tidak mampu dan pekerja sektor informal.",
    isSubsidized: true,
    apbnCostTrillion: 48.0,
    approvalImpact: 24,
    inflationReduction: 0.6,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_vaksin",
    name: "Program Immunisasi & Vaksinasi Publik",
    category: "Pendidikan & Kesehatan",
    description: "Program imunisasi dasar anak dan vaksinasi kesehatan publik bebas biaya di seluruh klinik dan rumah sakit daerah.",
    isSubsidized: false,
    apbnCostTrillion: 15.0,
    approvalImpact: 12,
    inflationReduction: 0.2,
    demoRiskIfDisabled: "Sedang",
  },

  // 4. TRANSPORTASI & PERUMAHAN
  {
    id: "sub_transport_publik",
    name: "Subsidi Layanan Transportasi Publik",
    category: "Transportasi & Perumahan",
    description: "Diskon tarif komuter kereta api publik dan armada bus kota untuk menekan emisi & beban pengeluaran warga.",
    isSubsidized: true,
    apbnCostTrillion: 10.5,
    approvalImpact: 14,
    inflationReduction: 0.7,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_perumahan",
    name: "Subsidi Perumahan & Pemukiman Rakyat",
    category: "Transportasi & Perumahan",
    description: "Bantuan suku bunga rendah dan insentif hunian bersubsidi bagi keluarga berpenghasilan rendah.",
    isSubsidized: true,
    apbnCostTrillion: 21.0,
    approvalImpact: 16,
    inflationReduction: 0.3,
    demoRiskIfDisabled: "Sedang",
  },
  {
    id: "sub_ev",
    name: "Insentif Transisi Transportasi Ramah Lingkungan",
    category: "Transportasi & Perumahan",
    description: "Potongan harga dan insentif pajak untuk adopsi kendaraan bermotor berbasis energi ramah lingkungan.",
    isSubsidized: false,
    apbnCostTrillion: 8.0,
    approvalImpact: 6,
    inflationReduction: 0.1,
    demoRiskIfDisabled: "Rendah",
  },

  // 5. UMKM & EKONOMI
  {
    id: "sub_kur",
    name: "Subsidi Bunga Kredit Usaha Mikro",
    category: "UMKM & Ekonomi",
    description: "Bantuan suku bunga ringan untuk pinjaman modal usaha kecil, pedagang mandiri, dan kewirausahaan lokal.",
    isSubsidized: true,
    apbnCostTrillion: 36.0,
    approvalImpact: 19,
    inflationReduction: 0.5,
    demoRiskIfDisabled: "Tinggi",
  },
  {
    id: "sub_pajak_umkm",
    name: "Insentif Bebas Pajak Pengusaha Mikro",
    category: "UMKM & Ekonomi",
    description: "Pembebasan kewajiban pajak penghasilan bagi usaha skala mikro yang baru berkembang.",
    isSubsidized: true,
    apbnCostTrillion: 14.2,
    approvalImpact: 15,
    inflationReduction: 0.4,
    demoRiskIfDisabled: "Sedang",
  },

  // 6. PERLINDUNGAN SOSIAL
  {
    id: "sub_blt",
    name: "Bantuan Langsung Tunai (BLT)",
    category: "Perlindungan Sosial",
    description: "Transfer dana tunai langsung bagi masyarakat kelompok terbawah untuk menjaga daya beli.",
    isSubsidized: true,
    apbnCostTrillion: 42.0,
    approvalImpact: 26,
    inflationReduction: 0.0,
    demoRiskIfDisabled: "Kritis",
  },
  {
    id: "sub_pensiun",
    name: "Tunjangan Jaminan Sosial Lansia",
    category: "Perlindungan Sosial",
    description: "Bantuan santunan dana pensiun dan jaminan sosial bulanan bagi lansia serta pejuang veteran.",
    isSubsidized: true,
    apbnCostTrillion: 16.8,
    approvalImpact: 11,
    inflationReduction: 0.0,
    demoRiskIfDisabled: "Sedang",
  },
  {
    id: "sub_bencana",
    name: "Dana Tanggap Bencana & Krisis",
    category: "Perlindungan Sosial",
    description: "Dana tak terduga untuk pemulihan infrastruktur publik dan jaringan pengaman sosial saat krisis/bencana.",
    isSubsidized: true,
    apbnCostTrillion: 15.0,
    approvalImpact: 13,
    inflationReduction: 0.0,
    demoRiskIfDisabled: "Sedang",
  }
];

export interface TotalSubsidySummary {
  totalCostTrillion: number;
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
      totalCost += item.apbnCostTrillion;
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
    totalCostTrillion: totalCost,
    activeCount,
    totalCount: items.length,
    totalApprovalBonus: approvalBonus,
    totalInflationReduction: inflationRed,
    highestDemoRisk,
  };
};
