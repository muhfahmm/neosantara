// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\logic\logikaSistemEkonomi.ts

export interface EconomicSystemEffect {
  title: string;
  category: 'Terpusat' | 'Campuran' | 'Pasar Bebas';
  description: string;
  gdpGrowthBonus: number; // e.g. +2.5%
  inflationImpact: number; // e.g. -1.0%
  giniIndexImpact: number; // e.g. +0.05
  workerSatisfactionBonus: number;
  capitalistSatisfactionBonus: number;
  subsidyCostMultiplier: number;
}

export const getEconomicSystemDetails = (sliderValue: number): EconomicSystemEffect => {
  if (sliderValue <= 20) {
    return {
      title: "Ekonomi Komando (Command Economy)",
      category: "Terpusat",
      description: "Pemerintah memegang kendali mutlak atas penetapan harga, kuota produksi, dan alokasi sumber daya. BUMN mendominasi seluruh sektor ekonomi.",
      gdpGrowthBonus: 0.5,
      inflationImpact: -2.0,
      giniIndexImpact: -0.15,
      workerSatisfactionBonus: 15,
      capitalistSatisfactionBonus: -25,
      subsidyCostMultiplier: 2.2,
    };
  } else if (sliderValue <= 40) {
    return {
      title: "Sosialisme Pasar (Market Socialism)",
      category: "Terpusat",
      description: "Sektor vital dikuasai oleh negara dengan regulasi ketat, sementara usaha kecil dan menengah diizinkan beroperasi dengan aturan imbal hasil yang dibatasi.",
      gdpGrowthBonus: 1.5,
      inflationImpact: -0.8,
      giniIndexImpact: -0.08,
      workerSatisfactionBonus: 10,
      capitalistSatisfactionBonus: -10,
      subsidyCostMultiplier: 1.6,
    };
  } else if (sliderValue <= 60) {
    return {
      title: "Ekonomi Campuran (Mixed Economy)",
      category: "Campuran",
      description: "Keseimbangan ideal antara peran regulasi pemerintah dan kebebasan mekanisme pasar swasta. Negara mengelola layanan publik mendasar.",
      gdpGrowthBonus: 2.8,
      inflationImpact: 0.5,
      giniIndexImpact: 0.0,
      workerSatisfactionBonus: 5,
      capitalistSatisfactionBonus: 5,
      subsidyCostMultiplier: 1.0,
    };
  } else if (sliderValue <= 80) {
    return {
      title: "Pasar Bebas Terregulasi (Regulated Market)",
      category: "Pasar Bebas",
      description: "Pasar swasta menjadi penggerak utama pertumbuhan ekonomi. Pemerintah hanya berfokus pada pengawasan persaingan usaha dan stabilitas makro.",
      gdpGrowthBonus: 4.2,
      inflationImpact: 1.8,
      giniIndexImpact: 0.08,
      workerSatisfactionBonus: -5,
      capitalistSatisfactionBonus: 18,
      subsidyCostMultiplier: 0.6,
    };
  } else {
    return {
      title: "Laissez-Faire / Kapitalisme Bebas",
      category: "Pasar Bebas",
      description: "Deregulasi penuh dan kebebasan pasar tanpa batas. Kompetisi bisnis berjalan murni sesuai hukum penawaran dan permintaan.",
      gdpGrowthBonus: 5.8,
      inflationImpact: 3.5,
      giniIndexImpact: 0.18,
      workerSatisfactionBonus: -20,
      capitalistSatisfactionBonus: 30,
      subsidyCostMultiplier: 0.2,
    };
  }
};

export interface EconomicPolicyItem {
  id: string;
  name: string;
  description: string;
  optionA: { label: string; type: 'Terpusat'; effect: string };
  optionB: { label: string; type: 'Pasar Bebas'; effect: string };
}

export const ECONOMIC_POLICIES: EconomicPolicyItem[] = [
  {
    id: "price_control",
    name: "Pengendalian Harga Pokok",
    description: "Penetapan harga komoditas pangan & bahan baku utama di pasar domestik.",
    optionA: { label: "HET / Batas Harga Negara", type: "Terpusat", effect: "Stabilitas harga terjaga, tapi risiko kelangkaan stok barang" },
    optionB: { label: "Mekanisme Pasar Murni", type: "Pasar Bebas", effect: "Stok barang melimpah, namun rawan lonjakan inflasi mendadak" },
  },
  {
    id: "strategic_ownership",
    name: "Kepemilikan Industri Strategis",
    description: "Pengelolaan energi, pertambangan, dan infrastruktur transportasi utama.",
    optionA: { label: "Monopoli BUMN / Nasionalisasi", type: "Terpusat", effect: "Penerimaan kas negara meningkat, efisiensi operasional lebih rendah" },
    optionB: { label: "Privatisasi & Investor Swasta", type: "Pasar Bebas", effect: "Inovasi & efisiensi meningkat pesat, royalti negara lebih kecil" },
  },
  {
    id: "trade_policy",
    name: "Regulasi Perdagangan Luar Negeri",
    description: "Pengaturan kuota serta tarif bea masuk produk impor.",
    optionA: { label: "Proteksionisme Ketat", type: "Terpusat", effect: "Industri dalam negeri terlindungi, pilihan konsumen terbatas" },
    optionB: { label: "Perdagangan Bebas (Free Trade)", type: "Pasar Bebas", effect: "Ekspor-impor meningkat pesat, persaingan industri lokal lebih berat" },
  },
  {
    id: "labor_regulation",
    name: "Kebijakan Tenaga Kerja & UMR",
    description: "Standar upah minimum nasional dan perlindungan hak-hak pekerja.",
    optionA: { label: "Standar UMR High & Proteksi Ketat", type: "Terpusat", effect: "Kesejahteraan buruh meningkat, daya tarik investasi asing turun" },
    optionB: { label: "Fleksibilitas Kerja & Kontrak Bebas", type: "Pasar Bebas", effect: "Penyerapan tenaga kerja tinggi, potensi ketimpangan sosial naik" },
  }
];
