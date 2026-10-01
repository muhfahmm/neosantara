'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FlaskConical, X, Sparkles, Cpu, Shield, Zap, BookOpen, Leaf, Globe2,
  Palette, Lock, CheckCircle2, Clock, Coins, Beaker, Atom, Rocket,
  Wifi, Crosshair, HeartPulse, Wheat, Banknote, Search, TrendingUp,
  ChevronUp,
} from 'lucide-react';

interface BottomLeftPenelitianIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
}

// ================================================================
// TIPE DATA
// ================================================================
type CategoryKey = 'sains' | 'ekonomi' | 'militer' | 'sosial' | 'lingkungan' | 'diplomasi' | 'budaya';

interface ResearchEffect {
  stat: string;
  value: number;
  label: string;
}

interface Research {
  id: string;
  name: string;
  category: CategoryKey;
  cost: number;
  duration: number;
  prerequisites: string[];
  effects: ResearchEffect[];
  icon: React.ElementType;
  description: string;
}

// ================================================================
// SISTEM LEVEL CARD — Level 1 s/d Level 5
// ================================================================
// Bonus multiplier per level (dalam persen)
const CARD_LEVEL_BONUS = [0, 2, 5, 8, 12, 15]; // index 1-5
const MAX_CARD_LEVEL = 5;

// Biaya upgrade per level (dari base cost riset)
const CARD_UPGRADE_COST_MULTIPLIER = [0, 1, 1.5, 2.2, 3.2, 4.5]; // Level 2 = 1.5x, dll
const CARD_UPGRADE_DURATION_MULTIPLIER = [0, 1, 1.3, 1.7, 2.2, 3]; // Level 2 = 1.3x, dll

const getCardUpgradeCost = (research: Research, targetLevel: number): number => {
  return Math.floor(research.cost * CARD_UPGRADE_COST_MULTIPLIER[targetLevel]);
};

const getCardUpgradeDuration = (research: Research, targetLevel: number): number => {
  return Math.ceil(research.duration * CARD_UPGRADE_DURATION_MULTIPLIER[targetLevel]);
};

const getCardBonus = (level: number): number => {
  if (level < 1) return 0;
  if (level > MAX_CARD_LEVEL) return CARD_LEVEL_BONUS[MAX_CARD_LEVEL];
  return CARD_LEVEL_BONUS[level];
};

// ================================================================
// DATA PENELITIAN
// ================================================================
const RESEARCH_DATA: Research[] = [
  // ============ SAINS DASAR ============
  { id: 'metode_ilmiah', name: 'Metode Ilmiah Modern', category: 'sains', cost: 500, duration: 5, prerequisites: [], icon: Beaker, description: 'Standarisasi metodologi riset nasional.', effects: [{ stat: 'riset', value: 10, label: '+10% Kecepatan Riset' }] },
  { id: 'bioteknologi', name: 'Bioteknologi Dasar', category: 'sains', cost: 1200, duration: 12, prerequisites: ['metode_ilmiah'], icon: HeartPulse, description: 'Rekayasa genetika untuk pangan & medis.', effects: [{ stat: 'pangan', value: 5, label: '+5% Produksi Pangan' }, { stat: 'kesehatan', value: 5, label: '+5% Kesehatan' }] },
  { id: 'nanoteknologi', name: 'Nanoteknologi', category: 'sains', cost: 3500, duration: 20, prerequisites: ['metode_ilmiah'], icon: Atom, description: 'Material skala nano untuk industri presisi.', effects: [{ stat: 'manufaktur', value: 10, label: '+10% Efisiensi Manufaktur' }] },
  { id: 'kecerdasan_buatan', name: 'Kecerdasan Buatan (AI)', category: 'sains', cost: 6000, duration: 35, prerequisites: ['metode_ilmiah', 'nanoteknologi'], icon: Cpu, description: 'AI untuk otomasi & efisiensi nasional.', effects: [{ stat: 'semua_kementerian', value: 10, label: '+10% Efisiensi Semua Kementerian' }] },
  { id: 'komputasi_kuantum', name: 'Komputasi Kuantum', category: 'sains', cost: 5000, duration: 30, prerequisites: ['metode_ilmiah', 'kecerdasan_buatan'], icon: Atom, description: 'Komputer kuantum untuk simulasi kompleks.', effects: [{ stat: 'riset', value: 15, label: '+15% Kecepatan Riset' }] },
  { id: 'rekayasa_genetika', name: 'Rekayasa Genetika Lanjut', category: 'sains', cost: 8000, duration: 45, prerequisites: ['bioteknologi', 'nanoteknologi'], icon: HeartPulse, description: 'Modifikasi gen untuk kesehatan & pangan.', effects: [{ stat: 'pangan', value: 15, label: '+15% Produksi Pangan' }, { stat: 'harapan_hidup', value: 10, label: '+10% Harapan Hidup' }] },

  // ============ EKONOMI & INDUSTRI ============
  { id: 'otomasi_industri', name: 'Otomasi Industri', category: 'ekonomi', cost: 2000, duration: 15, prerequisites: [], icon: Cpu, description: 'Robotik & otomasi lini produksi.', effects: [{ stat: 'manufaktur', value: 15, label: '+15% Produksi Manufaktur' }] },
  { id: 'pertanian_presisi', name: 'Pertanian Presisi', category: 'ekonomi', cost: 1500, duration: 12, prerequisites: [], icon: Wheat, description: 'Sensor & drone untuk hasil panen optimal.', effects: [{ stat: 'agrikultur', value: 12, label: '+12% Hasil Agrikultur' }] },
  { id: 'pertambangan_cerdas', name: 'Pertambangan Cerdas', category: 'ekonomi', cost: 1800, duration: 14, prerequisites: [], icon: Beaker, description: 'Tambang otomatis dengan AI.', effects: [{ stat: 'mineral', value: 10, label: '+10% Produksi Mineral & Energi' }] },
  { id: 'digitalisasi_pajak', name: 'Digitalisasi Pajak', category: 'ekonomi', cost: 2200, duration: 16, prerequisites: [], icon: Banknote, description: 'Sistem pajak digital anti-korupsi.', effects: [{ stat: 'pajak', value: 10, label: '+10% Penerimaan Pajak' }] },
  { id: 'logistik_terintegrasi', name: 'Logistik Terintegrasi', category: 'ekonomi', cost: 2000, duration: 15, prerequisites: [], icon: Rocket, description: 'AI & IoT untuk distribusi barang.', effects: [{ stat: 'logistik', value: 10, label: '+10% Efisiensi Logistik' }] },
  { id: 'bank_digital', name: 'Bank Digital', category: 'ekonomi', cost: 2500, duration: 18, prerequisites: ['digitalisasi_pajak'], icon: Banknote, description: 'Sistem keuangan digital nasional.', effects: [{ stat: 'inflasi', value: 5, label: '-5% Inflasi Nasional' }] },
  { id: 'ekspor_bernilai', name: 'Ekspor Bernilai Tambah', category: 'ekonomi', cost: 3000, duration: 20, prerequisites: ['otomasi_industri'], icon: Globe2, description: 'Hilirisasi industri untuk ekspor.', effects: [{ stat: 'bea_cukai', value: 8, label: '+8% Pendapatan Bea Cukai' }] },
  { id: 'ekonomi_sirkular', name: 'Ekonomi Sirkular', category: 'ekonomi', cost: 4000, duration: 25, prerequisites: ['logistik_terintegrasi'], icon: Leaf, description: 'Daur ulang & ekonomi berkelanjutan.', effects: [{ stat: 'pdb', value: 8, label: '+8% PDB dari Ekonomi Hijau' }] },
  { id: 'energi_fusi', name: 'Energi Fusi Nuklir', category: 'ekonomi', cost: 15000, duration: 60, prerequisites: ['komputasi_kuantum'], icon: Atom, description: 'Reaktor fusi untuk listrik murah.', effects: [{ stat: 'pltn', value: 25, label: '+25% Output PLTN' }] },

  // ============ MILITER & PERTAHANAN ============
  { id: 'tank_generasi_baru', name: 'Tank Generasi Baru', category: 'militer', cost: 2500, duration: 18, prerequisites: [], icon: Shield, description: 'Tank modern dengan armor komposit.', effects: [{ stat: 'militer_darat', value: 15, label: '+15% Kekuatan Darat' }] },
  { id: 'kapal_stealth', name: 'Kapal Perang Stealth', category: 'militer', cost: 4000, duration: 25, prerequisites: ['tank_generasi_baru'], icon: Shield, description: 'Kapal perang tak terdeteksi radar.', effects: [{ stat: 'militer_laut', value: 15, label: '+15% Kekuatan Laut' }] },
  { id: 'jet_siluman', name: 'Jet Tempur Siluman', category: 'militer', cost: 5000, duration: 30, prerequisites: ['kapal_stealth'], icon: Rocket, description: 'Pesawat tempur generasi ke-5.', effects: [{ stat: 'militer_udara', value: 20, label: '+20% Kekuatan Udara' }] },
  { id: 'rudal_hipersonik', name: 'Rudal Hipersonik', category: 'militer', cost: 6000, duration: 35, prerequisites: ['jet_siluman'], icon: Crosshair, description: 'Rudal kecepatan 5x suara.', effects: [{ stat: 'serangan', value: 25, label: '+25% Kekuatan Serangan' }] },
  { id: 'drone_otonom', name: 'Drone Otonom', category: 'militer', cost: 3000, duration: 20, prerequisites: ['otomasi_industri'], icon: Wifi, description: 'Drone tempur tanpa awak.', effects: [{ stat: 'militer', value: 10, label: '+10% Efisiensi Operasi Militer' }] },
  { id: 'satelit_mata_mata', name: 'Satelit Mata-mata', category: 'militer', cost: 4500, duration: 28, prerequisites: ['drone_otonom'], icon: Wifi, description: 'Satelit pengintai global.', effects: [{ stat: 'spionase', value: 20, label: '+20% Deteksi Spionase' }] },
  { id: 'perang_siber', name: 'Perang Siber', category: 'militer', cost: 4000, duration: 25, prerequisites: ['kecerdasan_buatan'], icon: Cpu, description: 'Serangan siber ofensif & defensif.', effects: [{ stat: 'sabotase', value: 15, label: '+15% Efektivitas Sabotase' }] },
  { id: 'program_nuklir', name: 'Program Nuklir', category: 'militer', cost: 10000, duration: 45, prerequisites: ['nanoteknologi'], icon: Atom, description: 'Pengembangan senjata nuklir.', effects: [{ stat: 'nuklir', value: 50, label: 'Membuka Riset Nuklir Lanjutan' }] },
  { id: 'pertahanan_nuklir', name: 'Pertahanan Nuklir', category: 'militer', cost: 12000, duration: 60, prerequisites: ['program_nuklir'], icon: Shield, description: 'Sistem pertahanan anti-rudal.', effects: [{ stat: 'defense', value: 30, label: '+30% Pertahanan Nuklir' }] },
  { id: 'icbm', name: 'ICBM (Rudal Balistik)', category: 'militer', cost: 20000, duration: 90, prerequisites: ['rudal_hipersonik', 'program_nuklir'], icon: Rocket, description: 'Rudal balistik antar benua.', effects: [{ stat: 'nuklir', value: 100, label: 'Membuka Serangan Nuklir' }] },

  // ============ SOSIAL & KESEJAHTERAAN ============
  { id: 'obat_generik', name: 'Obat Generik Nasional', category: 'sosial', cost: 1500, duration: 12, prerequisites: [], icon: HeartPulse, description: 'Produksi obat murah dalam negeri.', effects: [{ stat: 'subsidi_kesehatan', value: 15, label: '-15% Biaya Subsidi Kesehatan' }] },
  { id: 'vaksin_universal', name: 'Vaksin Universal', category: 'sosial', cost: 2000, duration: 15, prerequisites: ['bioteknologi'], icon: HeartPulse, description: 'Vaksin untuk semua penyakit menular.', effects: [{ stat: 'penyakit', value: 20, label: '-20% Risiko Wabah' }] },
  { id: 'pendidikan_digital', name: 'Pendidikan Digital', category: 'sosial', cost: 1800, duration: 14, prerequisites: [], icon: BookOpen, description: 'E-learning nasional merata.', effects: [{ stat: 'pendidikan', value: 15, label: '+15% Efektivitas Pendidikan' }] },
  { id: 'beasiswa_nasional', name: 'Beasiswa Nasional', category: 'sosial', cost: 1200, duration: 10, prerequisites: [], icon: BookOpen, description: 'Program beasiswa untuk putra daerah.', effects: [{ stat: 'pengangguran', value: 10, label: '-10% Pengangguran Terdidik' }] },
  { id: 'smart_city', name: 'Smart City', category: 'sosial', cost: 3500, duration: 22, prerequisites: ['pendidikan_digital'], icon: Cpu, description: 'Kota pintar dengan IoT.', effects: [{ stat: 'layanan_publik', value: 10, label: '+10% Efisiensi Layanan Publik' }] },
  { id: 'transportasi_otonom', name: 'Transportasi Otonom', category: 'sosial', cost: 3000, duration: 20, prerequisites: ['smart_city'], icon: Rocket, description: 'Kendaraan tanpa awak.', effects: [{ stat: 'polusi', value: 10, label: '-10% Kemacetan & Polusi' }] },
  { id: 'rumah_pintar', name: 'Rumah Pintar (Smart Home)', category: 'sosial', cost: 2500, duration: 18, prerequisites: ['smart_city'], icon: Sparkles, description: 'Hunian dengan teknologi IoT.', effects: [{ stat: 'hunian', value: 10, label: '+10% Kualitas Hunian' }] },
  { id: 'jaminan_universal', name: 'Jaminan Sosial Universal', category: 'sosial', cost: 4000, duration: 25, prerequisites: ['obat_generik'], icon: HeartPulse, description: 'Jaminan sosial untuk semua rakyat.', effects: [{ stat: 'kepuasan', value: 10, label: '+10% Kepuasan Rakyat' }] },
  { id: 'kesehatan_mental', name: 'Program Kesehatan Mental', category: 'sosial', cost: 2200, duration: 15, prerequisites: ['obat_generik'], icon: HeartPulse, description: 'Layanan kesehatan mental nasional.', effects: [{ stat: 'kepuasan', value: 8, label: '+8% Kepuasan Rakyat' }, { stat: 'kriminalitas', value: 5, label: '-5% Kriminalitas' }] },

  // ============ LINGKUNGAN & ENERGI ============
  { id: 'surya_efisien', name: 'Panel Surya Efisiensi Tinggi', category: 'lingkungan', cost: 2000, duration: 15, prerequisites: [], icon: Zap, description: 'Panel surya generasi terbaru.', effects: [{ stat: 'plts', value: 20, label: '+20% Output PLTS' }] },
  { id: 'turbin_lepas_pantai', name: 'Turbin Angin Lepas Pantai', category: 'lingkungan', cost: 2500, duration: 18, prerequisites: [], icon: Zap, description: 'Kincir angin lepas pantai.', effects: [{ stat: 'pltb', value: 20, label: '+20% Output PLTB' }] },
  { id: 'daur_ulang_lanjut', name: 'Daur Ulang Tingkat Lanjut', category: 'lingkungan', cost: 2200, duration: 16, prerequisites: [], icon: Leaf, description: 'Sistem daur ulang modern.', effects: [{ stat: 'daur_ulang', value: 15, label: '+15% Efisiensi Daur Ulang' }] },
  { id: 'pertanian_berkelanjutan', name: 'Pertanian Berkelanjutan', category: 'lingkungan', cost: 1800, duration: 14, prerequisites: ['pertanian_presisi'], icon: Wheat, description: 'Pertanian ramah lingkungan.', effects: [{ stat: 'pangan', value: 10, label: '+10% Pangan' }, { stat: 'emisi', value: 10, label: '-10% Emisi' }] },
  { id: 'baterai_solid', name: 'Baterai Solid-State', category: 'lingkungan', cost: 3500, duration: 22, prerequisites: ['surya_efisien'], icon: Zap, description: 'Penyimpanan energi efisien.', effects: [{ stat: 'energi', value: 15, label: '+15% Efisiensi Energi' }] },
  { id: 'ccs', name: 'Penangkapan Karbon (CCS)', category: 'lingkungan', cost: 4000, duration: 25, prerequisites: [], icon: Leaf, description: 'Teknologi penangkap emisi CO2.', effects: [{ stat: 'emisi', value: 25, label: '-25% Emisi Industri' }] },
  { id: 'energi_terbarukan', name: 'Energi Terbarukan Terpadu', category: 'lingkungan', cost: 3000, duration: 20, prerequisites: ['surya_efisien', 'turbin_lepas_pantai'], icon: Zap, description: 'Integrasi energi terbarukan.', effects: [{ stat: 'energi', value: 15, label: '+15% Output Energi Hijau' }] },
  { id: 'kota_rendah_emisi', name: 'Kota Rendah Emisi', category: 'lingkungan', cost: 3200, duration: 20, prerequisites: ['ccs'], icon: Leaf, description: 'Kota bebas polusi.', effects: [{ stat: 'polusi', value: 20, label: '-20% Polusi Perkotaan' }] },
  { id: 'hidrogen_hijau', name: 'Hidrogen Hijau', category: 'lingkungan', cost: 8000, duration: 40, prerequisites: ['baterai_solid'], icon: Atom, description: 'Energi hidrogen bersih.', effects: [{ stat: 'energi_baru', value: 100, label: 'Membuka Sumber Energi Baru' }] },

  // ============ DIPLOMASI & INTELIJEN ============
  { id: 'diplomasi_digital', name: 'Diplomasi Digital', category: 'diplomasi', cost: 1800, duration: 12, prerequisites: [], icon: Globe2, description: 'Kanal diplomasi digital global.', effects: [{ stat: 'pbb', value: 10, label: '+10% Kecepatan Resolusi PBB' }] },
  { id: 'jaringan_intelijen', name: 'Jaringan Intelijen Global', category: 'diplomasi', cost: 3500, duration: 22, prerequisites: ['diplomasi_digital'], icon: Shield, description: 'Jaringan spionase internasional.', effects: [{ stat: 'spionase', value: 15, label: '+15% Efektivitas Spionase' }] },
  { id: 'kriptografi', name: 'Kriptografi Modern', category: 'diplomasi', cost: 3000, duration: 20, prerequisites: ['kecerdasan_buatan'], icon: Lock, description: 'Enkripsi data militer & negara.', effects: [{ stat: 'kebocoran', value: 20, label: '-20% Risiko Kebocoran Data' }] },
  { id: 'soft_power_cultural', name: 'Soft Power Cultural', category: 'diplomasi', cost: 2500, duration: 18, prerequisites: [], icon: Palette, description: 'Diplomasi budaya untuk pengaruh global.', effects: [{ stat: 'unesco', value: 10, label: '+10% Pengaruh di UNESCO' }] },
  { id: 'analitik_geopolitik', name: 'Analitik Geopolitik', category: 'diplomasi', cost: 3200, duration: 20, prerequisites: ['jaringan_intelijen'], icon: Globe2, description: 'Analisis prediktif konflik global.', effects: [{ stat: 'prediksi', value: 10, label: '+10% Akurasi Prediksi Konflik' }] },
  { id: 'kontra_intelijen', name: 'Kontra-Intelijen', category: 'diplomasi', cost: 2800, duration: 18, prerequisites: ['kriptografi'], icon: Shield, description: 'Sistem anti-spionase nasional.', effects: [{ stat: 'sabotase', value: 25, label: '-25% Risiko Sabotase' }] },
  { id: 'diplomasi_multilateral', name: 'Diplomasi Multilateral', category: 'diplomasi', cost: 3000, duration: 20, prerequisites: ['diplomasi_digital'], icon: Globe2, description: 'Jaringan diplomasi multilateral.', effects: [{ stat: 'blok_regional', value: 10, label: '+10% Kecepatan Bergabung Blok' }] },
  { id: 'cyber_defense', name: 'Cyber Defense Nasional', category: 'diplomasi', cost: 6000, duration: 35, prerequisites: ['kontra_intelijen', 'perang_siber'], icon: Cpu, description: 'Pertahanan siber nasional.', effects: [{ stat: 'cyber_defense', value: 30, label: '+30% Pertahanan Siber' }] },

  // ============ BUDAYA & IDENTITAS ============
  { id: 'digitalisasi_warisan', name: 'Digitalisasi Warisan Budaya', category: 'budaya', cost: 1500, duration: 12, prerequisites: [], icon: Palette, description: 'Arsip digital warisan budaya.', effects: [{ stat: 'unesco', value: 15, label: '+15% Peluang UNESCO' }] },
  { id: 'industri_kreatif', name: 'Industri Kreatif Digital', category: 'budaya', cost: 2500, duration: 18, prerequisites: ['digitalisasi_warisan'], icon: Palette, description: 'Ekonomi kreatif berbasis digital.', effects: [{ stat: 'pdb', value: 10, label: '+10% PDB Ekonomi Kreatif' }] },
  { id: 'pariwisata_virtual', name: 'Pariwisata Virtual', category: 'budaya', cost: 2000, duration: 15, prerequisites: ['digitalisasi_warisan'], icon: Globe2, description: 'Wisata virtual untuk pasar global.', effects: [{ stat: 'devisa', value: 10, label: '+10% Devisa Pariwisata' }] },
  { id: 'bahasa_global', name: 'Bahasa Nasional Global', category: 'budaya', cost: 3000, duration: 20, prerequisites: [], icon: Globe2, description: 'Promosi bahasa nasional di PBB.', effects: [{ stat: 'diplomasi', value: 10, label: '+10% Pengaruh Bahasa di PBB' }] },
  { id: 'sinema_nasional', name: 'Sinema & Animasi Nasional', category: 'budaya', cost: 2800, duration: 18, prerequisites: ['industri_kreatif'], icon: Palette, description: 'Industri film & animasi nasional.', effects: [{ stat: 'soft_power', value: 10, label: '+10% Soft Power' }] },
  { id: 'diplomasi_budaya', name: 'Diplomasi Budaya', category: 'budaya', cost: 3200, duration: 20, prerequisites: ['digitalisasi_warisan', 'soft_power_cultural'], icon: Globe2, description: 'Diplomasi budaya internasional.', effects: [{ stat: 'budaya_global', value: 15, label: '+15% Pengaruh Budaya Internasional' }] },
  { id: 'festival_internasional', name: 'Festival Internasional', category: 'budaya', cost: 2000, duration: 15, prerequisites: ['digitalisasi_warisan'], icon: Palette, description: 'Festival budaya berskala internasional.', effects: [{ stat: 'kepuasan', value: 8, label: '+8% Kepuasan Rakyat' }, { stat: 'devisa', value: 8, label: '+8% Devisa Pariwisata' }] },
];

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'sains', label: 'Sains Dasar', icon: Beaker },
  { key: 'ekonomi', label: 'Ekonomi & Industri', icon: Banknote },
  { key: 'militer', label: 'Militer & Pertahanan', icon: Shield },
  { key: 'sosial', label: 'Sosial & Kesejahteraan', icon: HeartPulse },
  { key: 'lingkungan', label: 'Lingkungan & Energi', icon: Leaf },
  { key: 'diplomasi', label: 'Diplomasi & Intelijen', icon: Globe2 },
  { key: 'budaya', label: 'Budaya & Identitas', icon: Palette },
];

// ================================================================
// KOMPONEN UTAMA
// ================================================================
export default function BottomLeftPenelitianIcon({
  onClick,
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
}: BottomLeftPenelitianIconProps) {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('sains');
  const [confirmTarget, setConfirmTarget] = useState<Research | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<{ research: Research; targetLevel: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const completedResearch: string[] = countryDetail?.completed_research || [];
  const researchLevels: Record<string, number> = countryDetail?.research_levels || {};
  const activeResearchId: string | null = countryDetail?.active_research || null;
  const activeResearchProgress: number = countryDetail?.active_research_progress || 0;
  const money = Number(countryDetail?.anggaran || 0);

  const isUnlocked = (id: string) => completedResearch.includes(id);
  const isActive = (id: string) => activeResearchId === id;
  const getLevel = (id: string) => researchLevels[id] || (isUnlocked(id) ? 1 : 0);

  const isLocked = (research: Research) => {
    if (research.prerequisites.length === 0) return false;
    return !research.prerequisites.every((p) => completedResearch.includes(p));
  };

  const canAfford = (cost: number) => money >= cost;

  const getSafeDateString = (): string => {
    if (countryDetail?.game_date) return countryDetail.game_date;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('simulation_date') : null;
    if (stored) return stored;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // Buka riset baru (Level 1)
  const handleStartResearch = (research: Research) => {
    if (!setCountryDetail || !countryDetail) return;
    if (isUnlocked(research.id) || isActive(research.id)) return;
    if (isLocked(research) || !canAfford(research.cost)) return;
    if (activeResearchId) return;

    const safeDate = getSafeDateString();
    const endDateStr = addDays(safeDate, research.duration);

    setCountryDetail({
      ...countryDetail,
      anggaran: money - research.cost,
      active_research: research.id,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
    });
    setConfirmTarget(null);
  };

  // Upgrade riset ke level berikutnya
  const handleUpgradeResearch = () => {
    if (!confirmUpgrade || !setCountryDetail || !countryDetail) return;
    const { research, targetLevel } = confirmUpgrade;
    const cost = getCardUpgradeCost(research, targetLevel);
    if (money < cost) return;
    if (activeResearchId) return;

    const safeDate = getSafeDateString();
    const duration = getCardUpgradeDuration(research, targetLevel);
    const endDateStr = addDays(safeDate, duration);

    setCountryDetail({
      ...countryDetail,
      anggaran: money - cost,
      active_research: `upgrade:${research.id}:${targetLevel}`,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
    });
    setConfirmUpgrade(null);
  };

  const activeResearch = RESEARCH_DATA.find((r) => r.id === activeResearchId) || null;
  const activeUpgradeData = (() => {
    if (!activeResearchId || !activeResearchId.startsWith('upgrade:')) return null;
    const parts = activeResearchId.split(':');
    const research = RESEARCH_DATA.find((r) => r.id === parts[1]);
    return research ? { research, targetLevel: Number(parts[2]) } : null;
  })();

  const filteredData = RESEARCH_DATA.filter((r) => {
    if (r.category !== activeCategory) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.effects.some((e) => e.label.toLowerCase().includes(q))
    );
  });

  const categoryStats = (cat: CategoryKey) => {
    const items = RESEARCH_DATA.filter((r) => r.category === cat);
    const done = items.filter((r) => isUnlocked(r.id)).length;
    return { done, total: items.length };
  };

  const globalStats = {
    done: completedResearch.length,
    total: RESEARCH_DATA.length,
  };

  // Apply level bonus ke efek
  const applyLevelBonus = (effect: ResearchEffect, level: number): string => {
    if (level <= 0) {
      return effect.label;
    }
    const bonus = getCardBonus(level);
    const amplified = effect.value * (1 + bonus / 100);
    const isReduction = effect.label.trim().startsWith('-') ||
      ['emisi','polusi','kriminalitas','pengangguran','penyakit','kebocoran','sabotase','inflasi','subsidi'].some((s) => effect.stat.includes(s));

    if (isReduction) {
      return `-${Math.abs(amplified).toFixed(1)}% ${effect.label.replace(/^[+-]?\d+(\.\d+)?%\s*/, '')}`;
    }
    return `+${amplified.toFixed(1)}% ${effect.label.replace(/^[+-]?\d+(\.\d+)?%\s*/, '')}`;
  };

  return (
    <>
      <button
        onClick={onClick}
        title="Penelitian - Riset dan Teknologi"
        className="fixed bottom-3 lg:bottom-4 xl:bottom-6 2xl:bottom-12 left-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <FlaskConical className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
      </button>

      {isOpen && createPortal(
        <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-[200] bg-[#0A1A1A] flex flex-col font-sans animate-in fade-in duration-300">

          {/* HEADER */}
          <div className="px-4 sm:px-8 py-3.5 bg-[#0F2424] border-b border-[#00FFAA]/30 flex items-center justify-between shadow-lg relative z-20 shrink-0 flex-wrap gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/40 text-[#00FFAA]">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black text-[#00FFAA] tracking-wider uppercase leading-none">
                  Pusat Penelitian & Riset Nasional
                </h1>
                <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-0.5">
                  Setiap riset dapat di-upgrade hingga Level 5
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg px-3 py-1.5">
                <span className="text-[10px] text-[#6B8A8A] font-black uppercase">Riset Selesai:</span>
                <span className="text-[11px] font-black text-[#00FFAA]">{globalStats.done}/{globalStats.total}</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari riset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-xs font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-40 sm:w-56 transition-all placeholder:text-[#6B8A8A]"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
              </div>

              <div className="text-[11px] sm:text-xs font-bold text-[#00FFAA] bg-[#0A1A1A] px-3 py-1.5 rounded-lg border border-[#00FFAA]/20">
                Kas: {money.toLocaleString('id-ID')} NEO
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 flex min-h-0 relative z-10">

            {/* SIDEBAR */}
            <div className="w-52 sm:w-60 lg:w-64 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2.5 sm:p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar shrink-0">
              <div className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest px-2 py-1.5">
                Kategori Riset
              </div>
              {CATEGORIES.map((cat) => {
                const isActiveTab = activeCategory === cat.key;
                const stats = categoryStats(cat.key);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActiveTab
                        ? 'bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md'
                        : 'bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                        {cat.label}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-1 shrink-0 ${
                        isActiveTab ? 'bg-[#0A1A1A]/20 text-[#0A1A1A]' : 'bg-[#0A1A1A] text-[#00FFAA]'
                      }`}
                    >
                      {stats.done}/{stats.total}
                    </span>
                  </button>
                );
              })}

              {/* PANEL RISET AKTIF */}
              {(activeResearch || activeUpgradeData) && (
                <div className="mt-4 p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-[#00FFAA] animate-pulse" />
                    <span className="text-[10px] font-black text-[#00FFAA] uppercase tracking-widest">
                      {activeUpgradeData ? 'Upgrade Aktif' : 'Riset Aktif'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#E0E0E0] truncate">
                    {activeUpgradeData ? activeUpgradeData.research.name : activeResearch?.name}
                  </p>
                  {activeUpgradeData && (
                    <p className="text-[10px] text-amber-300 font-black mt-0.5">
                      → Level {activeUpgradeData.targetLevel}
                    </p>
                  )}
                  <div className="w-full h-2 bg-[#0A1A1A] rounded-full mt-2 overflow-hidden border border-[#00FFAA]/20">
                    <div
                      className="h-full bg-[#00FFAA] transition-all duration-300"
                      style={{ width: `${activeResearchProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-black text-[#00FFAA] mt-1.5">
                    {activeResearchProgress}% selesai
                  </p>
                </div>
              )}

              {/* INFO SISTEM */}
              <div className="mt-2 p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-[#00FFAA]" />
                  <span className="text-[9px] font-black text-[#00FFAA] uppercase tracking-widest">
                    Bonus Level Card
                  </span>
                </div>
                <div className="space-y-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div key={lvl} className="flex items-center justify-between px-2 py-0.5 rounded bg-[#0A1A1A]">
                      <span className="text-[9px] font-black text-[#6B8A8A]">Level {lvl}</span>
                      <span className="text-[9px] font-black text-[#00FFAA]">+{CARD_LEVEL_BONUS[lvl]}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-[#6B8A8A] font-semibold mt-2 leading-tight">
                  Setiap card riset bisa di-upgrade dari Level 1 hingga Level 5. Bonus level mengamplifikasi semua efek riset tersebut.
                </p>
              </div>
            </div>

            {/* KONTEN UTAMA */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] custom-scrollbar">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-[#00FFAA] uppercase tracking-wider">
                  {CATEGORIES.find((c) => c.key === activeCategory)?.label}
                </h2>
                <p className="text-[11px] text-[#6B8A8A] font-semibold">
                  {filteredData.length} teknologi tersedia
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-4">
                {filteredData.map((research) => {
                  const unlocked = isUnlocked(research.id);
                  const active = isActive(research.id);
                  const locked = isLocked(research);
                  const level = getLevel(research.id);
                  const canUnlock = canAfford(research.cost);
                  const isMaxed = level >= MAX_CARD_LEVEL;
                  const nextLevel = level + 1;
                  const upgradeCost = !isMaxed && unlocked ? getCardUpgradeCost(research, nextLevel) : 0;
                  const canUpgrade = !isMaxed && unlocked && canAfford(upgradeCost) && !activeResearchId;
                  const Icon = research.icon;
                  const currentBonus = unlocked ? getCardBonus(level) : 0;
                  const isResearching = active || (activeUpgradeData !== null && activeUpgradeData.research.id === research.id);

                  return (
                    <div
                      key={research.id}
                      className={`relative rounded-2xl overflow-visible border transition-all ${
                        isResearching ? 'mt-6' : ''
                      } ${
                        isMaxed
                          ? 'bg-gradient-to-br from-emerald-950/40 to-amber-950/20 border-amber-500/60'
                          : unlocked
                          ? 'bg-[#00FFAA]/5 border-[#00FFAA]/40'
                          : active
                          ? 'bg-[#00FFAA]/10 border-[#00FFAA]/60 shadow-[0_0_20px_rgba(0,255,170,0.15)]'
                          : locked
                          ? 'bg-[#0A1A1A] border-gray-700/40 opacity-60'
                          : 'bg-[#0A1A1A] border-[#00FFAA]/30 hover:border-[#00FFAA]/60'
                      }`}
                    >
                      {/* 🔥 TANGGAL SELESAI RISET/PEMBANGUNAN (EXACT MATCH BASEPRODUKSIGRID LINE 204) */}
                      {isResearching && (() => {
                        const durationDays = activeUpgradeData ? getCardUpgradeDuration(research, activeUpgradeData.targetLevel) : research.duration;
                        const remainingDays = Math.max(1, Math.ceil(durationDays * (100 - activeResearchProgress) / 100));
                        const endDateStr = countryDetail?.active_research_end_date || addDays(getSafeDateString(), remainingDays);

                        const [y, m, d] = endDateStr.split('-').map(Number);
                        const date = new Date(y, m - 1, d);
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
                        const formattedDateStr = `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;

                        return (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                            {formattedDateStr}
                          </div>
                        );
                      })()}

                      {/* Header Card */}
                      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#00FFAA]/20 bg-[#0F2424] rounded-t-2xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg border shrink-0 ${
                              isMaxed
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                : unlocked
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-[#00FFAA]/10 border-[#00FFAA]/40 text-[#00FFAA]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#E0E0E0] truncate">
                            {research.name}
                          </span>
                        </div>

                        {/* Level Badge */}
                        {unlocked && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${
                              isMaxed
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-[#00FFAA]/15 text-[#00FFAA] border-[#00FFAA]/40'
                            }`}
                          >
                            LV.{level} {isMaxed ? '★ MAX' : `+${currentBonus}%`}
                          </span>
                        )}
                        {!unlocked && !active && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-gray-800/60 text-gray-400 border-gray-700 shrink-0">
                            Belum Diteliti
                          </span>
                        )}
                        {active && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-[#00FFAA]/20 text-[#00FFAA] border-[#00FFAA]/40 shrink-0 animate-pulse">
                            Riset...
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-[11px] text-[#6B8A8A] font-semibold leading-snug mb-3">
                          {research.description}
                        </p>

                        {/* Level Progress Bar (jika unlocked) */}
                        {unlocked && (
                          <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <div
                                key={lvl}
                                className={`flex-1 h-2 rounded-sm transition-all ${
                                  lvl <= level
                                    ? isMaxed
                                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                      : 'bg-[#00FFAA] shadow-[0_0_6px_rgba(0,255,170,0.5)]'
                                    : 'bg-[#0A1A1A] border border-[#00FFAA]/20'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Effects */}
                        <div className="space-y-1 mb-3">
                          {research.effects.map((eff, i) => {
                            const amplifiedLabel = applyLevelBonus(eff, level);
                            return (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] font-bold flex-wrap">
                                <Sparkles className="w-3 h-3 text-[#00FFAA] shrink-0" />
                                <span className="text-[#E0E0E0]">{amplifiedLabel}</span>
                                {level > 0 && (
                                  <span className="text-[9px] text-[#00FFAA]/70 font-black">
                                    (base: {eff.value > 0 ? '+' : ''}{eff.value}% + {currentBonus}%)
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-[10px] font-bold mb-3 flex-wrap">
                          {!unlocked && (
                            <>
                              <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3 text-amber-400" />
                                <span className="text-amber-300">
                                  {research.cost.toLocaleString('id-ID')} NEO
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sky-400" />
                                <span className="text-sky-300">{research.duration} hari</span>
                              </div>
                              {research.prerequisites.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-[#6B8A8A]" />
                                  <span className="text-[#6B8A8A]">
                                    {research.prerequisites.length} prasyarat
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          {unlocked && !isMaxed && (
                            <>
                              <div className="flex items-center gap-1">
                                <ChevronUp className="w-3 h-3 text-amber-400" />
                                <span className="text-amber-300">
                                  Upgrade Lv.{nextLevel}: {upgradeCost.toLocaleString('id-ID')} NEO
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sky-400" />
                                <span className="text-sky-300">
                                  {getCardUpgradeDuration(research, nextLevel)} hari
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {!unlocked && !active && (
                          locked ? (
                            <div className="w-full py-2 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center gap-2 text-gray-500 text-[11px] font-black uppercase">
                              <Lock className="w-3.5 h-3.5" />
                              Terkunci
                            </div>
                          ) : activeResearchId ? (
                            <div className="w-full py-2 rounded-lg bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-2 text-[#6B8A8A] text-[11px] font-black uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              Antrian Penuh
                            </div>
                          ) : (
                            <button
                              onClick={() => canUnlock && setConfirmTarget(research)}
                              disabled={!canUnlock}
                              className={`w-full py-2 rounded-lg border flex items-center justify-center gap-2 text-[11px] font-black uppercase transition-all cursor-pointer ${
                                canUnlock
                                  ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] hover:bg-[#00FFAA]/80 active:scale-95'
                                  : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Rocket className="w-3.5 h-3.5" />
                              {canUnlock ? 'Mulai Riset' : 'Kas Tidak Cukup'}
                            </button>
                          )
                        )}

                        {active && (
                          <div className="w-full py-2 rounded-lg bg-[#00FFAA]/20 border border-[#00FFAA]/50 flex items-center justify-center gap-2 text-[#00FFAA] text-[11px] font-black uppercase">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            Sedang Diteliti ({activeResearchProgress}%)
                          </div>
                        )}

                        {unlocked && (
                          isMaxed ? (
                            <div className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 flex items-center justify-center gap-2 text-amber-300 text-[11px] font-black uppercase">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Level Maksimum Tercapai
                            </div>
                          ) : activeResearchId ? (
                            <div className="w-full py-2 rounded-lg bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-2 text-[#6B8A8A] text-[11px] font-black uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              Antrian Penuh
                            </div>
                          ) : (
                            <button
                              onClick={() => canUpgrade && setConfirmUpgrade({ research, targetLevel: nextLevel })}
                              disabled={!canUpgrade}
                              className={`w-full py-2 rounded-lg border flex items-center justify-center gap-2 text-[11px] font-black uppercase transition-all cursor-pointer ${
                                canUpgrade
                                  ? 'bg-gradient-to-r from-[#00FFAA] to-emerald-400 text-[#0A1A1A] border-[#00FFAA] hover:opacity-90 active:scale-95 shadow-md'
                                  : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                              {canUpgrade ? `Upgrade ke Level ${nextLevel}` : 'Kas Tidak Cukup'}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-12 text-[#6B8A8A] text-sm font-bold">
                  Tidak ada riset yang cocok dengan "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL KONFIRMASI MULAI RISET */}
      {confirmTarget && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
          >
            <button onClick={() => setConfirmTarget(null)} className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                <confirmTarget.icon className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#E0E0E0] uppercase leading-tight">
                  {confirmTarget.name}
                </h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">
                  Mulai Riset — Level 1
                </p>
              </div>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Biaya Riset</span>
                <span className="text-sm font-black text-[#00FFAA]">
                  {confirmTarget.cost.toLocaleString('id-ID')} NEO
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Durasi</span>
                <span className="text-sm font-black text-sky-300">
                  {confirmTarget.duration} hari
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Setelah</span>
                <span className="text-sm font-black text-amber-400">
                  {(money - confirmTarget.cost).toLocaleString('id-ID')} NEO
                </span>
              </div>
            </div>

            <div className="bg-[#00FFAA]/5 border border-[#00FFAA]/20 rounded-lg p-3 mb-5">
              <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                Efek Level 1 (+{CARD_LEVEL_BONUS[1]}%):
              </p>
              {confirmTarget.effects.map((eff, i) => (
                <p key={i} className="text-[11px] font-bold text-[#E0E0E0]">
                  • {applyLevelBonus(eff, 1)}
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleStartResearch(confirmTarget)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                Mulai Riset
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL KONFIRMASI UPGRADE */}
      {confirmUpgrade && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmUpgrade(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
          >
            <button onClick={() => setConfirmUpgrade(null)} className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                <confirmUpgrade.research.icon className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#E0E0E0] uppercase leading-tight">
                  {confirmUpgrade.research.name}
                </h3>
                <p className="text-[10px] text-[#00FFAA] font-black mt-0.5">
                  Upgrade ke Level {confirmUpgrade.targetLevel}
                </p>
              </div>
            </div>

            {/* Level Transition */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-[9px] text-[#6B8A8A] font-black uppercase">Sekarang</p>
                <p className="text-lg font-black text-[#6B8A8A]">
                  LV.{getLevel(confirmUpgrade.research.id)}
                </p>
                <p className="text-[10px] text-[#6B8A8A] font-bold">
                  +{getCardBonus(getLevel(confirmUpgrade.research.id))}%
                </p>
              </div>
              <ChevronUp className="w-5 h-5 text-[#00FFAA] rotate-90" />
              <div className="text-center">
                <p className="text-[9px] text-[#00FFAA] font-black uppercase">Target</p>
                <p className="text-lg font-black text-[#00FFAA]">LV.{confirmUpgrade.targetLevel}</p>
                <p className="text-[10px] text-[#00FFAA] font-bold">
                  +{getCardBonus(confirmUpgrade.targetLevel)}%
                </p>
              </div>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Biaya Upgrade</span>
                <span className="text-sm font-black text-[#00FFAA]">
                  {getCardUpgradeCost(confirmUpgrade.research, confirmUpgrade.targetLevel).toLocaleString('id-ID')} NEO
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Durasi</span>
                <span className="text-sm font-black text-sky-300">
                  {getCardUpgradeDuration(confirmUpgrade.research, confirmUpgrade.targetLevel)} hari
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Setelah</span>
                <span className="text-sm font-black text-amber-400">
                  {(money - getCardUpgradeCost(confirmUpgrade.research, confirmUpgrade.targetLevel)).toLocaleString('id-ID')} NEO
                </span>
              </div>
            </div>

            <div className="bg-[#00FFAA]/5 border border-[#00FFAA]/20 rounded-lg p-3 mb-5">
              <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                Efek Baru (Level {confirmUpgrade.targetLevel} +{getCardBonus(confirmUpgrade.targetLevel)}%):
              </p>
              {confirmUpgrade.research.effects.map((eff, i) => (
                <p key={i} className="text-[11px] font-bold text-[#E0E0E0]">
                  • {applyLevelBonus(eff, confirmUpgrade.targetLevel)}
                </p>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUpgrade(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleUpgradeResearch}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00FFAA] to-emerald-400 text-[#0A1A1A] hover:opacity-90 active:scale-95 transition-all font-bold text-xs uppercase cursor-pointer shadow-md"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}