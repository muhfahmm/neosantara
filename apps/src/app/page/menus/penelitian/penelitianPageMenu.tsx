'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FlaskConical, X, Sparkles, Cpu, Shield, Zap, BookOpen, Leaf, Globe2,
  Palette, Lock, CheckCircle2, Clock, Coins, Beaker, Atom, Rocket,
  Wifi, Crosshair, HeartPulse, Wheat, Banknote, Search, TrendingUp,
  ChevronUp,
} from 'lucide-react';
import {
  applyAtheismResearchSpeedBonus,
  ATHEISM_RESEARCH_SPEED_BONUS,
} from '@/app/page/bonus_logic/agama_bonus_logic/ateisme';
import {
  calculateEducationPoints,
  getEducationResearchModifier,
  calculateCombinedResearchDurationModifier,
  applyCombinedResearchDuration,
} from '@/app/page/downgrade_logic';
import { isMemberOfUNESCO, isMemberOfITU } from '@/app/page/bonus_logic';

export type CategoryKey = 'sains' | 'ekonomi' | 'militer' | 'sosial' | 'lingkungan' | 'diplomasi' | 'budaya';

interface ResearchEffect {
  stat: string;
  value: number;
  label: string;
}

interface Research {
  id: string;
  name: string;
  category: CategoryKey;
  tier: number; // Tier 1, 2, 3, 4, 5
  cost: number;
  duration: number;
  prerequisites: string[];
  effects: ResearchEffect[];
  icon: React.ElementType;
  description: string;
}

const CARD_LEVEL_BONUS = [0, 2, 5, 8, 12, 15];
const MAX_CARD_LEVEL = 5;

const CARD_UPGRADE_COST_MULTIPLIER = [0, 1, 1.5, 2.2, 3.2, 4.5];
const CARD_UPGRADE_DURATION_MULTIPLIER = [0, 1, 1.3, 1.7, 2.2, 3];

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

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

const getResearchTier = (research: Research, data: Research[]): number => {
  if (research.tier) return research.tier;
  if (research.prerequisites.length === 0) return 1;
  const prereqObj = data.find((r) => research.prerequisites.includes(r.id));
  if (!prereqObj) return 1;
  return Math.min(5, getResearchTier(prereqObj, data) + 1);
};

const RESEARCH_DATA: Research[] = [
  // ================= SAINS DASAR (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'metode_ilmiah', name: 'Metode Ilmiah Modern', category: 'sains', tier: 1, cost: 500, duration: 5, prerequisites: [], icon: Beaker, description: 'Standarisasi metodologi riset nasional.', effects: [{ stat: 'riset', value: 10, label: '+10% Kecepatan Riset' }] },
  { id: 'laboratorium_dasar', name: 'Laboratorium Nasional', category: 'sains', tier: 1, cost: 600, duration: 6, prerequisites: [], icon: Atom, description: 'Fasilitas riset dasar negara.', effects: [{ stat: 'riset', value: 8, label: '+8% Kapasitas Lab' }] },
  { id: 'matematika_terapan', name: 'Matematika Terapan', category: 'sains', tier: 1, cost: 550, duration: 5, prerequisites: [], icon: Cpu, description: 'Pemodelan algoritma matematis.', effects: [{ stat: 'riset', value: 7, label: '+7% Akurasi Data' }] },
  { id: 'fisika_dasar', name: 'Fisika Kuantum Dasar', category: 'sains', tier: 1, cost: 700, duration: 7, prerequisites: [], icon: Atom, description: 'Teori partikel dasar.', effects: [{ stat: 'riset', value: 9, label: '+9% Riset Energi' }] },
  { id: 'kimia_organik', name: 'Kimia Organik Sintetis', category: 'sains', tier: 1, cost: 650, duration: 6, prerequisites: [], icon: Beaker, description: 'Formulasi senyawa kimia baru.', effects: [{ stat: 'manufaktur', value: 6, label: '+6% Industri Kimia' }] },

  // TIER 2
  { id: 'bioteknologi', name: 'Bioteknologi Dasar', category: 'sains', tier: 2, cost: 1200, duration: 12, prerequisites: ['metode_ilmiah'], icon: HeartPulse, description: 'Rekayasa genetika untuk pangan & medis.', effects: [{ stat: 'pangan', value: 5, label: '+5% Produksi Pangan' }] },
  { id: 'analisis_data', name: 'Analisis Data Spasial', category: 'sains', tier: 2, cost: 1300, duration: 13, prerequisites: ['laboratorium_dasar'], icon: Cpu, description: 'Pengolahan big data nasional.', effects: [{ stat: 'efisiensi', value: 8, label: '+8% Efisiensi Sistem' }] },
  { id: 'optik_presisi', name: 'Optik & Fotonika Presisi', category: 'sains', tier: 2, cost: 1400, duration: 14, prerequisites: ['matematika_terapan'], icon: Zap, description: 'Teknologi lensa & fasa cahaya.', effects: [{ stat: 'presisi', value: 10, label: '+10% Instrumentasi' }] },
  { id: 'termodinamika', name: 'Termodinamika Lanjut', category: 'sains', tier: 2, cost: 1500, duration: 15, prerequisites: ['fisika_dasar'], icon: Atom, description: 'Konversi panas & energi efisien.', effects: [{ stat: 'energi', value: 10, label: '+10% Efisiensi Panas' }] },
  { id: 'biokimia_molekuler', name: 'Biokimia Molekuler', category: 'sains', tier: 2, cost: 1350, duration: 13, prerequisites: ['kimia_organik'], icon: HeartPulse, description: 'Struktur protein & enzim.', effects: [{ stat: 'kesehatan', value: 7, label: '+7% Farmasi' }] },

  // TIER 3
  { id: 'nanoteknologi', name: 'Nanoteknologi Material', category: 'sains', tier: 3, cost: 3500, duration: 20, prerequisites: ['bioteknologi'], icon: Atom, description: 'Material skala nano presisi tinggi.', effects: [{ stat: 'manufaktur', value: 10, label: '+10% Efisiensi Industri' }] },
  { id: 'sensor_pintar', name: 'Sensor Pintar & IoT', category: 'sains', tier: 3, cost: 3200, duration: 18, prerequisites: ['analisis_data'], icon: Wifi, description: 'Jaringan sensor otomatis.', effects: [{ stat: 'otomasi', value: 10, label: '+10% Otomasi Lab' }] },
  { id: 'laser_industri', name: 'Laser Semikonduktor', category: 'sains', tier: 3, cost: 3400, duration: 19, prerequisites: ['optik_presisi'], icon: Zap, description: 'Pemotongan laser mikro.', effects: [{ stat: 'produksi', value: 12, label: '+12% Pembuatan Chip' }] },
  { id: 'superkonduktor', name: 'Superkonduktor Suhu Tinggi', category: 'sains', tier: 3, cost: 3800, duration: 22, prerequisites: ['termodinamika'], icon: Rocket, description: 'Konduksi tanpa hambatan.', effects: [{ stat: 'listrik', value: 15, label: '+15% Transmisi Listrik' }] },
  { id: 'sintesis_gen', name: 'Sintesis DNA & RNA', category: 'sains', tier: 3, cost: 3600, duration: 21, prerequisites: ['biokimia_molekuler'], icon: HeartPulse, description: 'Sintesis sekuens genetik.', effects: [{ stat: 'medis', value: 12, label: '+12% Vaksin Medis' }] },

  // TIER 4
  { id: 'kecerdasan_buatan', name: 'Kecerdasan Buatan (AI)', category: 'sains', tier: 4, cost: 6000, duration: 35, prerequisites: ['nanoteknologi'], icon: Cpu, description: 'AI untuk otomasi & efisiensi.', effects: [{ stat: 'kementerian', value: 10, label: '+10% Efisiensi Kementerian' }] },
  { id: 'jaringan_neural', name: 'Jaringan Neural Deep Learning', category: 'sains', tier: 4, cost: 5800, duration: 32, prerequisites: ['sensor_pintar'], icon: Wifi, description: 'Model saraf buatan mandiri.', effects: [{ stat: 'prediksi', value: 12, label: '+12% Analisis Riset' }] },
  { id: 'mikroba_rekayasa', name: 'Rekayasa Organisme Mikroba', category: 'sains', tier: 4, cost: 6200, duration: 36, prerequisites: ['laser_industri'], icon: Leaf, description: 'Bakteri pengurai limbah.', effects: [{ stat: 'lingkungan', value: 15, label: '+15% Pembersihan Limbah' }] },
  { id: 'kristalografi', name: 'Kristalografi Kuantum', category: 'sains', tier: 4, cost: 6400, duration: 38, prerequisites: ['superkonduktor'], icon: Sparkles, description: 'Struktur kristal kisi sub-atomik.', effects: [{ stat: 'material', value: 14, label: '+14% Kekuatan Material' }] },
  { id: 'terapi_genetika', name: 'Terapi Genetik Presisi', category: 'sains', tier: 4, cost: 6500, duration: 40, prerequisites: ['sintesis_gen'], icon: HeartPulse, description: 'Penyembuhan penyakit genetis.', effects: [{ stat: 'kesehatan', value: 15, label: '+15% Kesehatan Nasional' }] },

  // TIER 5
  { id: 'komputasi_kuantum', name: 'Komputasi Kuantum', category: 'sains', tier: 5, cost: 12000, duration: 50, prerequisites: ['kecerdasan_buatan'], icon: Atom, description: 'Komputer kuantum simulasi.', effects: [{ stat: 'riset', value: 25, label: '+25% Kecepatan Riset' }] },
  { id: 'rekayasa_genetika', name: 'Rekayasa Genetika Lanjut', category: 'sains', tier: 5, cost: 13000, duration: 55, prerequisites: ['jaringan_neural'], icon: HeartPulse, description: 'Modifikasi gen tingkat lanjut.', effects: [{ stat: 'hidup', value: 20, label: '+20% Harapan Hidup' }] },
  { id: 'singulartas_ai', name: 'AI Otonom Berkesadaran', category: 'sains', tier: 5, cost: 15000, duration: 60, prerequisites: ['mikroba_rekayasa'], icon: Cpu, description: 'AI independen tingkat tinggi.', effects: [{ stat: 'semua', value: 20, label: '+20% Semua Produktivitas' }] },
  { id: 'materi_eksotis', name: 'Materi Eksotis Antimateri', category: 'sains', tier: 5, cost: 16000, duration: 65, prerequisites: ['kristalografi'], icon: Atom, description: 'Eksperimen fisika materi baru.', effects: [{ stat: 'energi', value: 30, label: '+30% Output Energi' }] },
  { id: 'panacea_medis', name: 'Bio-Molekuler Universal', category: 'sains', tier: 5, cost: 14000, duration: 58, prerequisites: ['terapi_genetika'], icon: HeartPulse, description: 'Obat pemulih sel imun universal.', effects: [{ stat: 'imun', value: 25, label: '+25% Imunitas Nasional' }] },

  // ================= EKONOMI & INDUSTRI (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'pertanian_presisi', name: 'Pertanian Presisi', category: 'ekonomi', tier: 1, cost: 1500, duration: 12, prerequisites: [], icon: Wheat, description: 'Sensor & drone hasil panen.', effects: [{ stat: 'agrikultur', value: 12, label: '+12% Hasil Panen' }] },
  { id: 'pertambangan_cerdas', name: 'Pertambangan Cerdas', category: 'ekonomi', tier: 1, cost: 1800, duration: 14, prerequisites: [], icon: Beaker, description: 'Tambang otomatis AI.', effects: [{ stat: 'mineral', value: 10, label: '+10% Hasil Tambang' }] },
  { id: 'perikanan_modern', name: 'Perikanan Tangkap Modern', category: 'ekonomi', tier: 1, cost: 1400, duration: 11, prerequisites: [], icon: Leaf, description: 'Armada laut & sonar ikan.', effects: [{ stat: 'maritim', value: 10, label: '+10% Hasil Perikanan' }] },
  { id: 'pasar_digital', name: 'Pasar Digital UMKM', category: 'ekonomi', tier: 1, cost: 1200, duration: 10, prerequisites: [], icon: Banknote, description: 'Platform dagang online lokal.', effects: [{ stat: 'umkm', value: 15, label: '+15% Transaksi UMKM' }] },
  { id: 'standardisasi_mutu', name: 'Standardisasi Mutu Produk', category: 'ekonomi', tier: 1, cost: 1300, duration: 11, prerequisites: [], icon: CheckCircle2, description: 'Sertifikasi ekspor barang.', effects: [{ stat: 'ekspor', value: 8, label: '+8% Nilai Ekspor' }] },

  // TIER 2
  { id: 'otomasi_industri', name: 'Otomasi Lini Fabrikasi', category: 'ekonomi', tier: 2, cost: 2000, duration: 15, prerequisites: ['pertanian_presisi'], icon: Cpu, description: 'Robotik & otomasi pabrik.', effects: [{ stat: 'manufaktur', value: 15, label: '+15% Produksi Pabrik' }] },
  { id: 'digitalisasi_pajak', name: 'Digitalisasi Pajak', category: 'ekonomi', tier: 2, cost: 2200, duration: 16, prerequisites: ['pertambangan_cerdas'], icon: Banknote, description: 'Sistem pajak digital transparan.', effects: [{ stat: 'pajak', value: 10, label: '+10% Penerimaan Pajak' }] },
  { id: 'gudang_otomatis', name: 'Gudang Robotik Otomatis', category: 'ekonomi', tier: 2, cost: 2100, duration: 15, prerequisites: ['perikanan_modern'], icon: Rocket, description: 'Penyimpanan stok modern.', effects: [{ stat: 'stok', value: 12, label: '+12% Efisiensi Gudang' }] },
  { id: 'fintech_nasional', name: 'Fintech Kredit Usaha', category: 'ekonomi', tier: 2, cost: 2300, duration: 17, prerequisites: ['pasar_digital'], icon: Banknote, description: 'Pinjaman cepat bagi usaha.', effects: [{ stat: 'kredit', value: 14, label: '+14% Modal Usaha' }] },
  { id: 'pengolahan_pangan', name: 'Industri Pengolahan Pangan', category: 'ekonomi', tier: 2, cost: 1900, duration: 14, prerequisites: ['standardisasi_mutu'], icon: Wheat, description: 'Pengemasan & pengawetan.', effects: [{ stat: 'pangan', value: 10, label: '+10% Ketahanan Pangan' }] },

  // TIER 3
  { id: 'logistik_terintegrasi', name: 'Logistik Terintegrasi', category: 'ekonomi', tier: 3, cost: 3000, duration: 20, prerequisites: ['otomasi_industri'], icon: Rocket, description: 'AI & IoT distribusi barang.', effects: [{ stat: 'logistik', value: 15, label: '+15% Pengiriman Barang' }] },
  { id: 'bank_digital', name: 'Bank Sentral Digital', category: 'ekonomi', tier: 3, cost: 3200, duration: 22, prerequisites: ['digitalisasi_pajak'], icon: Banknote, description: 'Mata uang digital resmi.', effects: [{ stat: 'inflasi', value: 8, label: '-8% Inflasi Negara' }] },
  { id: 'pembangkit_industri', name: 'Pembangkit Industri Khusus', category: 'ekonomi', tier: 3, cost: 3400, duration: 24, prerequisites: ['gudang_otomatis'], icon: Zap, description: 'Listrik dedicated untuk pabrik.', effects: [{ stat: 'listrik', value: 18, label: '+18% Daya Pabrik' }] },
  { id: 'hilirisasi_tambang', name: 'Hilirisasi Olahan Mineral', category: 'ekonomi', tier: 3, cost: 3600, duration: 25, prerequisites: ['fintech_nasional'], icon: Beaker, description: 'Smelter bijih besi & nikel.', effects: [{ stat: 'smelter', value: 20, label: '+20% Hasil Smelter' }] },
  { id: 'kawasan_berikat', name: 'Kawasan Bebas Bea Kawasan', category: 'ekonomi', tier: 3, cost: 3100, duration: 21, prerequisites: ['pengolahan_pangan'], icon: Globe2, description: 'Zona ekonomi khusus impor.', effects: [{ stat: 'bea', value: 12, label: '+12% Devisa Kawasan' }] },

  // TIER 4
  { id: 'ekspor_bernilai', name: 'Ekspor Manufaktur Canggih', category: 'ekonomi', tier: 4, cost: 6000, duration: 35, prerequisites: ['logistik_terintegrasi'], icon: Globe2, description: 'Hilirisasi manufaktur berat.', effects: [{ stat: 'bea_cukai', value: 18, label: '+18% Bea Ekspor' }] },
  { id: 'ekonomi_sirkular', name: 'Ekonomi Sirkular Hijau', category: 'ekonomi', tier: 4, cost: 6500, duration: 38, prerequisites: ['bank_digital'], icon: Leaf, description: 'Daur ulang industri nol-limbah.', effects: [{ stat: 'pdb', value: 15, label: '+15% PDB Ekonomi Hijau' }] },
  { id: 'otomasi_port', name: 'Pelabuhan Otomatis Kargo', category: 'ekonomi', tier: 4, cost: 6200, duration: 36, prerequisites: ['pembangkit_industri'], icon: Rocket, description: 'Dermaga kargo robotic.', effects: [{ stat: 'pelabuhan', value: 20, label: '+20% Kargo Ekspor' }] },
  { id: 'bursa_komoditas', name: 'Bursa Komoditas Berjangka', category: 'ekonomi', tier: 4, cost: 6400, duration: 37, prerequisites: ['hilirisasi_tambang'], icon: Banknote, description: 'Pasar perdagangan mineral.', effects: [{ stat: 'bursa', value: 16, label: '+16% Pendapatan Bursa' }] },
  { id: 'konsorsium_bumn', name: 'Konsorsium Industri BUMN', category: 'ekonomi', tier: 4, cost: 6300, duration: 36, prerequisites: ['kawasan_berikat'], icon: Cpu, description: 'Sinergi megaproyek nasional.', effects: [{ stat: 'bumn', value: 15, label: '+15% Profit BUMN' }] },

  // TIER 5
  { id: 'energi_fusi', name: 'Energi Fusi Nuklir Komersial', category: 'ekonomi', tier: 5, cost: 15000, duration: 60, prerequisites: ['ekspor_bernilai'], icon: Atom, description: 'Listrik murah tanpa batas.', effects: [{ stat: 'pltn', value: 35, label: '+35% Listrik Murah' }] },
  { id: 'megaproyek_selatan', name: 'Kawasan Industri Megastruktur', category: 'ekonomi', tier: 5, cost: 16000, duration: 65, prerequisites: ['ekonomi_sirkular'], icon: Rocket, description: 'Zona ekonomi raksasa terpadu.', effects: [{ stat: 'pdb', value: 30, label: '+30% PDB Nasional' }] },
  { id: 'otonomi_pasar', name: 'Sistem Moneter Algoritmik', category: 'ekonomi', tier: 5, cost: 14000, duration: 58, prerequisites: ['otomasi_port'], icon: Banknote, description: 'Stabilitas mata uang otomatis.', effects: [{ stat: 'moneter', value: 25, label: '+25% Stabilitas Moneter' }] },
  { id: 'hulu_antariksa', name: 'Tambang Asteroid & Ruang Angkasa', category: 'ekonomi', tier: 5, cost: 18000, duration: 70, prerequisites: ['bursa_komoditas'], icon: Rocket, description: 'Ekstraksi mineral luar angkasa.', effects: [{ stat: 'mineral', value: 50, label: '+50% Mineral Logam' }] },
  { id: 'global_trade_hub', name: 'Hub Perdagangan Dunia', category: 'ekonomi', tier: 5, cost: 17000, duration: 68, prerequisites: ['konsorsium_bumn'], icon: Globe2, description: 'Pusat logistik maritim dunia.', effects: [{ stat: 'devisa', value: 40, label: '+40% Devisa Negara' }] },

  // ================= MILITER & PERTAHANAN (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'tank_generasi_baru', name: 'Tank Tempur Komposit', category: 'militer', tier: 1, cost: 2500, duration: 18, prerequisites: [], icon: Shield, description: 'Armor komposit baja ringan.', effects: [{ stat: 'darat', value: 15, label: '+15% Kekuatan Darat' }] },
  { id: 'drone_otonom', name: 'Drone Pengintai Taktis', category: 'militer', tier: 1, cost: 2200, duration: 16, prerequisites: [], icon: Wifi, description: 'Drone tanpa awak skala udara.', effects: [{ stat: 'intel', value: 10, label: '+10% Pengintaian' }] },
  { id: 'senjata_infanteri', name: 'Senapan Serbu Presisi', category: 'militer', tier: 1, cost: 2000, duration: 15, prerequisites: [], icon: Crosshair, description: 'Senjata otomatis infanteri.', effects: [{ stat: 'infanteri', value: 12, label: '+12% Efektivitas Pasukan' }] },
  { id: 'radar_pesisir', name: 'Radar Pesisir Pantai', category: 'militer', tier: 1, cost: 2300, duration: 17, prerequisites: [], icon: Wifi, description: 'Deteksi maritim jarak jauh.', effects: [{ stat: 'radar', value: 10, label: '+10% Deteksi Pantai' }] },
  { id: 'benteng_perbatasan', name: 'Pos Pertahanan Perbatasan', category: 'militer', tier: 1, cost: 2100, duration: 15, prerequisites: [], icon: Shield, description: 'Bunker perbatasan diperkuat.', effects: [{ stat: 'bunker', value: 14, label: '+14% Pertahanan Darat' }] },

  // TIER 2
  { id: 'kapal_stealth', name: 'Kapal Korvet Siluman', category: 'militer', tier: 2, cost: 4000, duration: 25, prerequisites: ['tank_generasi_baru'], icon: Shield, description: 'Kapal perang penyerap radar.', effects: [{ stat: 'laut', value: 15, label: '+15% Kekuatan Laut' }] },
  { id: 'perang_siber', name: 'Komando Siber Ofensif', category: 'militer', tier: 2, cost: 3800, duration: 24, prerequisites: ['drone_otonom'], icon: Cpu, description: 'Peretasan & jaringan militer.', effects: [{ stat: 'sabotase', value: 15, label: '+15% Sabotase Musuh' }] },
  { id: 'artileri_presisi', name: 'Artileri Roket Otonom', category: 'militer', tier: 2, cost: 4200, duration: 26, prerequisites: ['senjata_infanteri'], icon: Crosshair, description: 'Meriam roket jarak jauh.', effects: [{ stat: 'artileri', value: 18, label: '+18% Serangan Darat' }] },
  { id: 'kapal_selam_diesel', name: 'Kapal Selam Modern', category: 'militer', tier: 2, cost: 4500, duration: 28, prerequisites: ['radar_pesisir'], icon: Shield, description: 'Patroli laut dalam.', effects: [{ stat: 'patroli', value: 16, label: '+16% Keamanan Laut' }] },
  { id: 'helikopter_serang', name: 'Helikopter Tempur', category: 'militer', tier: 2, cost: 4100, duration: 25, prerequisites: ['benteng_perbatasan'], icon: Rocket, description: 'Dukungan udara jarak dekat.', effects: [{ stat: 'helikopter', value: 15, label: '+15% Bantuan Udara' }] },

  // TIER 3
  { id: 'jet_siluman', name: 'Jet Tempur Generasi 5', category: 'militer', tier: 3, cost: 7000, duration: 35, prerequisites: ['kapal_stealth'], icon: Rocket, description: 'Pesawat tempur siluman radar.', effects: [{ stat: 'udara', value: 20, label: '+20% Kekuatan Udara' }] },
  { id: 'satelit_mata_mata', name: 'Satelit Pengintai Optik', category: 'militer', tier: 3, cost: 6800, duration: 34, prerequisites: ['perang_siber'], icon: Wifi, description: 'Spionase ruang angkasa.', effects: [{ stat: 'spionase', value: 20, label: '+20% Deteksi Spionase' }] },
  { id: 'rudal_jelajah', name: 'Rudal Jelajah Presisi', category: 'militer', tier: 3, cost: 7200, duration: 36, prerequisites: ['artileri_presisi'], icon: Crosshair, description: 'Serangan jarak jauh presisi.', effects: [{ stat: 'rudal', value: 22, label: '+22% Serangan Presisi' }] },
  { id: 'sistem_sam', name: 'Sistem Anti-Udara (SAM)', category: 'militer', tier: 3, cost: 7100, duration: 35, prerequisites: ['kapal_selam_diesel'], icon: Shield, description: 'Pertahanan udara jarak medium.', effects: [{ stat: 'sam', value: 20, label: '+20% Pertahanan Udara' }] },
  { id: 'pasukan_khusus', name: 'Reorganisasi Pasukan Khusus', category: 'militer', tier: 3, cost: 6500, duration: 32, prerequisites: ['helikopter_serang'], icon: Crosshair, description: 'Kualifikasi komando elit.', effects: [{ stat: 'elit', value: 25, label: '+25% Efektivitas Elit' }] },

  // TIER 4
  { id: 'rudal_hipersonik', name: 'Rudal Hipersonik Mach 7', category: 'militer', tier: 4, cost: 11000, duration: 45, prerequisites: ['jet_siluman'], icon: Crosshair, description: 'Rudal penetrator canggih.', effects: [{ stat: 'serangan', value: 30, label: '+30% Serangan Hipersonik' }] },
  { id: 'program_nuklir', name: 'Reaktor Pengayaan Nuklir', category: 'militer', tier: 4, cost: 12000, duration: 50, prerequisites: ['satelit_mata_mata'], icon: Atom, description: 'Materi fissile nuklir.', effects: [{ stat: 'nuklir', value: 50, label: 'Bahan Senjata Nuklir' }] },
  { id: 'kapal_induk', name: 'Kapal Induk Bertenaga Nuklir', category: 'militer', tier: 4, cost: 13000, duration: 55, prerequisites: ['rudal_jelajah'], icon: Shield, description: 'Proyeksi kekuatan laut global.', effects: [{ stat: 'proyeksi', value: 35, label: '+35% Proyeksi Global' }] },
  { id: 'laser_defensif', name: 'Senjata Laser Anti-Drone', category: 'militer', tier: 4, cost: 10500, duration: 44, prerequisites: ['sistem_sam'], icon: Zap, description: 'Intersepsi laser energi tinggi.', effects: [{ stat: 'laser', value: 25, label: '+25% Tangkisan Laser' }] },
  { id: 'baju_baja_eksoskeleton', name: 'Eksoskeleton Pasukan', category: 'militer', tier: 4, cost: 10000, duration: 42, prerequisites: ['pasukan_khusus'], icon: Cpu, description: 'Armor mekanis infanteri.', effects: [{ stat: 'baja', value: 28, label: '+28% Ketahanan Pasukan' }] },

  // TIER 5
  { id: 'pertahanan_nuklir', name: 'Kubah Pertahanan Anti-Rudal', category: 'militer', tier: 5, cost: 20000, duration: 75, prerequisites: ['rudal_hipersonik'], icon: Shield, description: 'Perisai pertahanan ICBM.', effects: [{ stat: 'kubah', value: 40, label: '+40% Pertahanan Nuklir' }] },
  { id: 'icbm', name: 'ICBM Balistik Antar Benua', category: 'militer', tier: 5, cost: 25000, duration: 90, prerequisites: ['program_nuklir'], icon: Rocket, description: 'Rudal balistik nuklir jangkauan global.', effects: [{ stat: 'icbm', value: 100, label: 'Serangan Nuklir Global' }] },
  { id: 'senjata_orbit', name: 'Platform Senjata Orbit Kinetik', category: 'militer', tier: 5, cost: 22000, duration: 80, prerequisites: ['kapal_induk'], icon: Rocket, description: 'Pemboman kinetik dari luar angkasa.', effects: [{ stat: 'orbit', value: 45, label: '+45% Pemboman Orbit' }] },
  { id: 'komando_otonom_ai', name: 'Komando Tempur Utama AI', category: 'militer', tier: 5, cost: 21000, duration: 78, prerequisites: ['laser_defensif'], icon: Cpu, description: 'Strategi perang otonom berbasis AI.', effects: [{ stat: 'ai_war', value: 35, label: '+35% Efisiensi Komando' }] },
  { id: 'pasukan_kloning', name: 'Infanteri Bio-Genetik Elit', category: 'militer', tier: 5, cost: 19000, duration: 72, prerequisites: ['baju_baja_eksoskeleton'], icon: HeartPulse, description: 'Pasukan pemulihan fisik super cepat.', effects: [{ stat: 'bio_inf', value: 35, label: '+35% Kekuatan Pasukan' }] },

  // ================= SOSIAL & KESEJAHTERAAN (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'obat_generik', name: 'Obat Generik Nasional', category: 'sosial', tier: 1, cost: 1500, duration: 12, prerequisites: [], icon: HeartPulse, description: 'Produksi obat murah dalam negeri.', effects: [{ stat: 'subsidi', value: 15, label: '-15% Biaya Obat' }] },
  { id: 'pendidikan_digital', name: 'Pendidikan Digital Merata', category: 'sosial', tier: 1, cost: 1800, duration: 14, prerequisites: [], icon: BookOpen, description: 'E-learning nasional sekolah.', effects: [{ stat: 'sekolah', value: 15, label: '+15% Efektivitas Belajar' }] },
  { id: 'air_bersih', name: 'Sanitasi & Air Bersih Desa', category: 'sosial', tier: 1, cost: 1400, duration: 11, prerequisites: [], icon: Leaf, description: 'Pipatisasi air minum warga.', effects: [{ stat: 'sanitasi', value: 12, label: '+12% Kesehatan Warga' }] },
  { id: 'perumahan_rakyat', name: 'Program Perumahan Subsidi', category: 'sosial', tier: 1, cost: 1600, duration: 13, prerequisites: [], icon: Sparkles, description: 'Hunian murah layak huni.', effects: [{ stat: 'hunian', value: 10, label: '+10% Kualitas Hunian' }] },
  { id: 'posyandu_digital', name: 'Posyandu & Gizi Balita', category: 'sosial', tier: 1, cost: 1300, duration: 10, prerequisites: [], icon: HeartPulse, description: 'Pencegahan stunting nasional.', effects: [{ stat: 'gizi', value: 14, label: '-14% Angka Stunting' }] },

  // TIER 2
  { id: 'vaksin_universal', name: 'Vaksinasi Universal', category: 'sosial', tier: 2, cost: 2500, duration: 16, prerequisites: ['obat_generik'], icon: HeartPulse, description: 'Pencegahan wabah nasional.', effects: [{ stat: 'wabah', value: 20, label: '-20% Risiko Wabah' }] },
  { id: 'beasiswa_nasional', name: 'Beasiswa Sarjana Daerah', category: 'sosial', tier: 2, cost: 2200, duration: 15, prerequisites: ['pendidikan_digital'], icon: BookOpen, description: 'Kuliah gratis untuk putra daerah.', effects: [{ stat: 'sarjana', value: 12, label: '+12% Pemuda Terdidik' }] },
  { id: 'puskesmas_keliling', name: 'Puskesmas Mobil Terpadu', category: 'sosial', tier: 2, cost: 2400, duration: 16, prerequisites: ['air_bersih'], icon: HeartPulse, description: 'Layanan medis terpencil.', effects: [{ stat: 'akses', value: 15, label: '+15% Akses Medis' }] },
  { id: 'subsidi_energi', name: 'Subsidi Tepat Sasaran', category: 'sosial', tier: 2, cost: 2300, duration: 15, prerequisites: ['perumahan_rakyat'], icon: Banknote, description: 'Bantuan langsung tunai.', effects: [{ stat: 'kemiskinan', value: 10, label: '-10% Kemiskinan Ekstrem' }] },
  { id: 'pelatihan_kerja', name: 'Balai Latihan Kerja AI', category: 'sosial', tier: 2, cost: 2100, duration: 14, prerequisites: ['posyandu_digital'], icon: Cpu, description: 'Sertifikasi keahlian pemuda.', effects: [{ stat: 'kerja', value: 15, label: '-15% Pengangguran' }] },

  // TIER 3
  { id: 'kesehatan_mental', name: 'Layanan Kesehatan Mental', category: 'sosial', tier: 3, cost: 4000, duration: 25, prerequisites: ['vaksin_universal'], icon: HeartPulse, description: 'Konseling psikologis publik.', effects: [{ stat: 'bahagia', value: 12, label: '+12% Kepuasan Hidup' }] },
  { id: 'smart_city', name: 'Kota Pintar & Terintegrasi', category: 'sosial', tier: 3, cost: 4500, duration: 28, prerequisites: ['beasiswa_nasional'], icon: Cpu, description: 'Layanan publik serba otomatis.', effects: [{ stat: 'layanan', value: 18, label: '+18% Efisiensi Kota' }] },
  { id: 'rumah_sakit_rujukan', name: 'RS Rujukan Antar Provinsi', category: 'sosial', tier: 3, cost: 4200, duration: 26, prerequisites: ['puskesmas_keliling'], icon: HeartPulse, description: 'Spesialis bedah & jantung.', effects: [{ stat: 'harapan', value: 10, label: '+10% Harapan Hidup' }] },
  { id: 'asuransi_tenaga_kerja', name: 'Jaminan Sosial Buruh', category: 'sosial', tier: 3, cost: 4300, duration: 27, prerequisites: ['subsidi_energi'], icon: Shield, description: 'Perlindungan pekerja industri.', effects: [{ stat: 'buruh', value: 15, label: '+15% Keamanan Buruh' }] },
  { id: 'taman_kota_hijau', name: 'Taman Rekreasi & Olahraga', category: 'sosial', tier: 3, cost: 3800, duration: 23, prerequisites: ['pelatihan_kerja'], icon: Leaf, description: 'Ruang terbuka hijau warga.', effects: [{ stat: 'stres', value: 10, label: '-10% Stres Perkotaan' }] },

  // TIER 4
  { id: 'rumah_pintar', name: 'Rumah Pintar Terjangkau', category: 'sosial', tier: 4, cost: 7000, duration: 38, prerequisites: ['kesehatan_mental'], icon: Sparkles, description: 'IoT hunian hemat energi.', effects: [{ stat: 'hunian_pintar', value: 15, label: '+15% Kenyamanan Kota' }] },
  { id: 'transportasi_otonom', name: 'Transportasi Massal Listrik', category: 'sosial', tier: 4, cost: 7500, duration: 40, prerequisites: ['smart_city'], icon: Rocket, description: 'Bus & MRT tanpa pengemudi.', effects: [{ stat: 'macet', value: 20, label: '-20% Kemacetan Kota' }] },
  { id: 'telemedis_nasional', name: 'Platform Operasi Telemedis', category: 'sosial', tier: 4, cost: 7200, duration: 39, prerequisites: ['rumah_sakit_rujukan'], icon: Wifi, description: 'Bedah robotik jarak jauh.', effects: [{ stat: 'bedah', value: 22, label: '+22% Keberhasilan Medis' }] },
  { id: 'dana_pensiun_universal', name: 'Dana Pensiun Terjamin', category: 'sosial', tier: 4, cost: 7800, duration: 42, prerequisites: ['asuransi_tenaga_kerja'], icon: Banknote, description: 'Jaminan hari tua lansia.', effects: [{ stat: 'pensiun', value: 18, label: '+18% Kesejahteraan Lansia' }] },
  { id: 'kesetaraan_gender', name: 'Program Pemberdayaan Ekonomi', category: 'sosial', tier: 4, cost: 6800, duration: 36, prerequisites: ['taman_kota_hijau'], icon: BookOpen, description: 'Kemandirian ekonomi keluarga.', effects: [{ stat: 'keluarga', value: 15, label: '+15% Ekonomi Keluarga' }] },

  // TIER 5
  { id: 'jaminan_universal', name: 'Jaminan Sosial Seumur Hidup', category: 'sosial', tier: 5, cost: 15000, duration: 60, prerequisites: ['rumah_pintar'], icon: HeartPulse, description: 'Layanan sosial gratis seumur hidup.', effects: [{ stat: 'bahagia_max', value: 30, label: '+30% Kepuasan Rakyat' }] },
  { id: 'kota_utopia', name: 'Kota Bebas Emisi & Kejahatan', category: 'sosial', tier: 5, cost: 17000, duration: 68, prerequisites: ['transportasi_otonom'], icon: Cpu, description: 'Hunian ideal bebas kriminal.', effects: [{ stat: 'kriminal', value: 40, label: '-40% Kriminalitas' }] },
  { id: 'regenerasi_sel', name: 'Terapi Panjang Umur Nasional', category: 'sosial', tier: 5, cost: 16000, duration: 65, prerequisites: ['telemedis_nasional'], icon: HeartPulse, description: 'Penghambat penuaan dini.', effects: [{ stat: 'umur_max', value: 25, label: '+25% Angka Harapan Hidup' }] },
  { id: 'pendidikan_gratis', name: 'Pendidikan Tinggi Gratis', category: 'sosial', tier: 5, cost: 14000, duration: 58, prerequisites: ['dana_pensiun_universal'], icon: BookOpen, description: 'Bebas biaya universitas 100%.', effects: [{ stat: 'iq', value: 25, label: '+25% Kapasitas SDM' }] },
  { id: 'kesetaraan_total', name: 'Indeks Kesejahteraan Maksimum', category: 'sosial', tier: 5, cost: 18000, duration: 70, prerequisites: ['kesetaraan_gender'], icon: Sparkles, description: 'Penghapusan kesenjangan sosial.', effects: [{ stat: 'harmoni', value: 35, label: '+35% Stabilitas Sosial' }] },

  // ================= LINGKUNGAN & ENERGI (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'surya_efisien', name: 'Panel Surya Efisiensi Tinggi', category: 'lingkungan', tier: 1, cost: 2000, duration: 15, prerequisites: [], icon: Zap, description: 'Panel surya generasi terbaru.', effects: [{ stat: 'plts', value: 20, label: '+20% Output PLTS' }] },
  { id: 'daur_ulang_lanjut', name: 'Daur Ulang Sampah Organik', category: 'lingkungan', tier: 1, cost: 2200, duration: 16, prerequisites: [], icon: Leaf, description: 'Pupuk kompos & biogas desa.', effects: [{ stat: 'biogas', value: 15, label: '+15% Energi Biogas' }] },
  { id: 'penanaman_hutan', name: 'Reboisasi Hutan Industri', category: 'lingkungan', tier: 1, cost: 1800, duration: 14, prerequisites: [], icon: Leaf, description: 'Penanaman kembali lahan kritis.', effects: [{ stat: 'hutan', value: 10, label: '+10% Luas Hutan' }] },
  { id: 'mikrohidro', name: 'Pembangkit Mikrohidro Desa', category: 'lingkungan', tier: 1, cost: 2100, duration: 15, prerequisites: [], icon: Zap, description: 'Listrik turbin sungai lokal.', effects: [{ stat: 'mikro', value: 12, label: '+12% Listrik Desa' }] },
  { id: 'pengolahan_air', name: 'Pengolahan Limbah Cair', category: 'lingkungan', tier: 1, cost: 1900, duration: 13, prerequisites: [], icon: Leaf, description: 'Penyaringan limbah pabrik.', effects: [{ stat: 'sungai', value: 14, label: '+14% Kebersihan Sungai' }] },

  // TIER 2
  { id: 'turbin_lepas_pantai', name: 'Turbin Angin Lepas Pantai', category: 'lingkungan', tier: 2, cost: 4000, duration: 25, prerequisites: ['surya_efisien'], icon: Zap, description: 'Kincir angin laut dalam.', effects: [{ stat: 'pltb', value: 20, label: '+20% Output PLTB' }] },
  { id: 'pertanian_berkelanjutan', name: 'Pertanian Ramah Lingkungan', category: 'lingkungan', tier: 2, cost: 3800, duration: 24, prerequisites: ['daur_ulang_lanjut'], icon: Wheat, description: 'Bebas pestisida kimia.', effects: [{ stat: 'organik', value: 15, label: '+15% Hasil Organik' }] },
  { id: 'konservasi_gambut', name: 'Restorasi Lahan Gambut', category: 'lingkungan', tier: 2, cost: 3600, duration: 23, prerequisites: ['penanaman_hutan'], icon: Leaf, description: 'Pencegahan kebakaran hutan.', effects: [{ stat: 'kebakaran', value: 25, label: '-25% Risiko Karhutla' }] },
  { id: 'geotermal_lanjut', name: 'Pembangkit Panas Bumi', category: 'lingkungan', tier: 2, cost: 4200, duration: 26, prerequisites: ['mikrohidro'], icon: Zap, description: 'Uap geothermal gunung api.', effects: [{ stat: 'pltp', value: 18, label: '+18% Listrik Panas Bumi' }] },
  { id: 'insinerator_ramah', name: 'Pembangkit Listrik Sampah', category: 'lingkungan', tier: 2, cost: 3900, duration: 24, prerequisites: ['pengolahan_air'], icon: Zap, description: 'Pembakaran sampah plasma.', effects: [{ stat: 'pltsa', value: 16, label: '+16% Listrik Sampah' }] },

  // TIER 3
  { id: 'baterai_solid', name: 'Baterai Solid-State Canggih', category: 'lingkungan', tier: 3, cost: 6500, duration: 35, prerequisites: ['turbin_lepas_pantai'], icon: Zap, description: 'Penyimpanan energi kerapatan tinggi.', effects: [{ stat: 'baterai', value: 20, label: '+20% Efisiensi Baterai' }] },
  { id: 'ccs', name: 'Penangkapan Karbon Industri', category: 'lingkungan', tier: 3, cost: 6800, duration: 36, prerequisites: ['pertanian_berkelanjutan'], icon: Leaf, description: 'Injeksi gas CO2 ke bumi.', effects: [{ stat: 'emisi_ccs', value: 25, label: '-25% Emisi Industri' }] },
  { id: 'desalinasi_surya', name: 'Desalinasi Air Laut Surya', category: 'lingkungan', tier: 3, cost: 6200, duration: 32, prerequisites: ['konservasi_gambut'], icon: Zap, description: 'Air tawar dari air laut.', effects: [{ stat: 'air_tawar', value: 20, label: '+20% Pasokan Air' }] },
  { id: 'biofuel_alga', name: 'Biofuel Generasi Ke-3 (Alga)', category: 'lingkungan', tier: 3, cost: 6400, duration: 34, prerequisites: ['geotermal_lanjut'], icon: Leaf, description: 'Bahan bakar nabati alga.', effects: [{ stat: 'biofuel', value: 18, label: '+18% Bahan Bakar Bersih' }] },
  { id: 'bioplastik_ramah', name: 'Bioplastik Terurai Alam', category: 'lingkungan', tier: 3, cost: 6100, duration: 31, prerequisites: ['insinerator_ramah'], icon: Leaf, description: 'Plastik pati singkong.', effects: [{ stat: 'plastik', value: 30, label: '-30% Sampah Plastik' }] },

  // TIER 4
  { id: 'energi_terbarukan', name: 'Smart Grid Energi Hijau', category: 'lingkungan', tier: 4, cost: 10000, duration: 48, prerequisites: ['baterai_solid'], icon: Zap, description: 'Jaringan listrik terpadu.', effects: [{ stat: 'grid', value: 25, label: '+25% Output Grid Hijau' }] },
  { id: 'kota_rendah_emisi', name: 'Kota Bebas Emisi Karbon', category: 'lingkungan', tier: 4, cost: 10500, duration: 50, prerequisites: ['ccs'], icon: Leaf, description: 'Kawasan industri net-zero.', effects: [{ stat: 'polusi_kota', value: 30, label: '-30% Polusi Udara' }] },
  { id: 'pemulihan_terumbu', name: 'Restorasi Terumbu Karang', category: 'lingkungan', tier: 4, cost: 9800, duration: 46, prerequisites: ['desalinasi_surya'], icon: Sparkles, description: 'Transplantasi karang maritim.', effects: [{ stat: 'karang', value: 22, label: '+22% Ekosistem Laut' }] },
  { id: 'torium_nuklir', name: 'Reaktor Nuklir Torium Bersih', category: 'lingkungan', tier: 4, cost: 11000, duration: 52, prerequisites: ['biofuel_alga'], icon: Atom, description: 'Nuklir aman bebas limbah bahaya.', effects: [{ stat: 'torium', value: 30, label: '+30% Listrik Torium' }] },
  { id: 'rekayasa_iklim', name: 'Stasiun Pengendali Cuaca', category: 'lingkungan', tier: 4, cost: 10800, duration: 51, prerequisites: ['bioplastik_ramah'], icon: Rocket, description: 'Hujan buatan & penangkal badai.', effects: [{ stat: 'bencana', value: 20, label: '-20% Risiko Bencana' }] },

  // TIER 5
  { id: 'hidrogen_hijau', name: 'Ekosistem Hidrogen Murni', category: 'lingkungan', tier: 5, cost: 18000, duration: 75, prerequisites: ['energi_terbarukan'], icon: Atom, description: 'Energi hidrogen cair universal.', effects: [{ stat: 'hidrogen', value: 50, label: '+50% Energi Bebas Karbon' }] },
  { id: 'geoengineering_atmosfer', name: 'Penyerap Karbon Atmosferik', category: 'lingkungan', tier: 5, cost: 20000, duration: 80, prerequisites: ['kota_rendah_emisi'], icon: Leaf, description: 'Pembersih efek rumah kaca global.', effects: [{ stat: 'suhu', value: 35, label: '-35% Emisi Nasional' }] },
  { id: 'pemulihan_biodiversitas', name: 'Suaka Ekosistem Abadi', category: 'lingkungan', tier: 5, cost: 17000, duration: 72, prerequisites: ['pemulihan_terumbu'], icon: Leaf, description: 'Konservasi flora fauna lengkap.', effects: [{ stat: 'bio', value: 30, label: '+30% Keanekaragaman Hayati' }] },
  { id: 'energi_gelombang', name: 'Pembangkit Arus Laut Dalam', category: 'lingkungan', tier: 5, cost: 19000, duration: 78, prerequisites: ['torium_nuklir'], icon: Zap, description: 'Energi pasang surut samudera.', effects: [{ stat: 'samudera', value: 35, label: '+35% Output Listrik Laut' }] },
  { id: 'terraforming_lokal', name: 'Katalis Iklim Makro', category: 'lingkungan', tier: 5, cost: 22000, duration: 85, prerequisites: ['rekayasa_iklim'], icon: Sparkles, description: 'Pengubah iklim gurun jadi subur.', effects: [{ stat: 'lahan', value: 40, label: '+40% Lahan Subur Baru' }] },

  // ================= DIPLOMASI & INTELIJEN (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'diplomasi_digital', name: 'Diplomasi Digital Global', category: 'diplomasi', tier: 1, cost: 1800, duration: 12, prerequisites: [], icon: Globe2, description: 'Kanal diplomasi daring resmi.', effects: [{ stat: 'pbb', value: 10, label: '+10% Resolusi PBB' }] },
  { id: 'soft_power_cultural', name: 'Diplomasi Budaya & Seni', category: 'diplomasi', tier: 1, cost: 2000, duration: 14, prerequisites: [], icon: Palette, description: 'Promosi karya seni di luar negeri.', effects: [{ stat: 'unesco', value: 10, label: '+10% Pengaruh UNESCO' }] },
  { id: 'kedutaan_besar', name: 'Modernisasi Kedutaan Besar', category: 'diplomasi', tier: 1, cost: 1900, duration: 13, prerequisites: [], icon: Globe2, description: 'Atase pertahanan & dagang.', effects: [{ stat: 'atase', value: 12, label: '+12% Pengaruh Kedutaan' }] },
  { id: 'intelijen_taktis', name: 'Badan Intelijen Daerah', category: 'diplomasi', tier: 1, cost: 1700, duration: 11, prerequisites: [], icon: Shield, description: 'Pengumpulan informasi batas.', effects: [{ stat: 'intel_dasar', value: 10, label: '+10% Info Teritorial' }] },
  { id: 'perjanjian_dagang', name: 'Pakta Perdagangan Bipartit', category: 'diplomasi', tier: 1, cost: 1600, duration: 10, prerequisites: [], icon: Banknote, description: 'Penurunan tarif bea masuk.', effects: [{ stat: 'tarif', value: 15, label: '-15% Tarif Impor' }] },

  // TIER 2
  { id: 'diplomasi_multilateral', name: 'Blok Diplomasi Regional', category: 'diplomasi', tier: 2, cost: 3500, duration: 22, prerequisites: ['diplomasi_digital'], icon: Globe2, description: 'Aliansi politik kawasan.', effects: [{ stat: 'aliansi', value: 15, label: '+15% Suara Regional' }] },
  { id: 'kriptografi', name: 'Enkripsi Data Kriptografi', category: 'diplomasi', tier: 2, cost: 3800, duration: 24, prerequisites: ['soft_power_cultural'], icon: Lock, description: 'Pengamanan data diplomatik.', effects: [{ stat: 'enkripsi', value: 20, label: '-20% Risiko Bocor' }] },
  { id: 'bantuan_kemanusiaan', name: 'Misi Perdamaian Dunia', category: 'diplomasi', tier: 2, cost: 3600, duration: 23, prerequisites: ['kedutaan_besar'], icon: HeartPulse, description: 'Pengiriman pasukan perdamaian.', effects: [{ stat: 'reputasi', value: 18, label: '+18% Reputasi Dunia' }] },
  { id: 'kontra_spionase', name: 'Penangkal Agensi Asing', category: 'diplomasi', tier: 2, cost: 3700, duration: 23, prerequisites: ['intelijen_taktis'], icon: Shield, description: 'Penangkapan agen rahasia.', effects: [{ stat: 'kontra', value: 20, label: '-20% Spionase Asing' }] },
  { id: 'bebas_visa', name: 'Kesepakatan Bebas Visa', category: 'diplomasi', tier: 2, cost: 3400, duration: 20, prerequisites: ['perjanjian_dagang'], icon: Globe2, description: 'Kemudahan perjalanan paspor.', effects: [{ stat: 'paspor', value: 15, label: '+15% Kekuatan Paspor' }] },

  // TIER 3
  { id: 'jaringan_intelijen', name: 'Jaringan Agen Global', category: 'diplomasi', tier: 3, cost: 6500, duration: 35, prerequisites: ['diplomasi_multilateral'], icon: Shield, description: 'Operasi rahasia luar negeri.', effects: [{ stat: 'agen', value: 20, label: '+20% Akurasi Spionase' }] },
  { id: 'kontra_intelijen', name: 'Sistem Kripto Militer', category: 'diplomasi', tier: 3, cost: 6800, duration: 36, prerequisites: ['kriptografi'], icon: Lock, description: 'Enkripsi saluran militer.', effects: [{ stat: 'kripto_militer', value: 25, label: '-25% Sabotase Data' }] },
  { id: 'lobi_geopolitik', name: 'Konsultan Lobi Geopolitik', category: 'diplomasi', tier: 3, cost: 6200, duration: 33, prerequisites: ['bantuan_kemanusiaan'], icon: Globe2, description: 'Pengaruh keputusan Dewan PBB.', effects: [{ stat: 'lobi', value: 20, label: '+20% Veto Resolusi' }] },
  { id: 'analitik_data_diplomatik', name: 'AI Analisis Geopolitik', category: 'diplomasi', tier: 3, cost: 6400, duration: 34, prerequisites: ['kontra_spionase'], icon: Cpu, description: 'Prediksi konflik antar negara.', effects: [{ stat: 'prediksi_konflik', value: 18, label: '+18% Akurasi Konflik' }] },
  { id: 'ekstradisi_internasional', name: 'Perjanjian Ekstradisi Lawan', category: 'diplomasi', tier: 3, cost: 6000, duration: 32, prerequisites: ['bebas_visa'], icon: Shield, description: 'Penangkapan buron negara.', effects: [{ stat: 'hukum', value: 15, label: '+15% Penegakan Hukum' }] },

  // TIER 4
  { id: 'analitik_geopolitik', name: 'Pusat Analisis Konflik Dunia', category: 'diplomasi', tier: 4, cost: 11000, duration: 48, prerequisites: ['jaringan_intelijen'], icon: Globe2, description: 'Prediksi krisis internasional.', effects: [{ stat: 'krisis', value: 25, label: '+25% Kesiapan Krisis' }] },
  { id: 'cyber_defense', name: 'Pertahanan Siber Pertahanan', category: 'diplomasi', tier: 4, cost: 11500, duration: 50, prerequisites: ['kontra_intelijen'], icon: Cpu, description: 'Benteng siber nasional.', effects: [{ stat: 'cyber_defense', value: 30, label: '+30% Pertahanan Siber' }] },
  { id: 'aliansi_militer_global', name: 'Pakta Pertahanan Bersama', category: 'diplomasi', tier: 4, cost: 12000, duration: 52, prerequisites: ['lobi_geopolitik'], icon: Shield, description: 'Jaminan bantuan militer.', effects: [{ stat: 'pakta', value: 30, label: '+30% Bantuan Perang' }] },
  { id: 'sanksi_ekonomi', name: 'Perangkat Sanksi Ekonomi', category: 'diplomasi', tier: 4, cost: 10800, duration: 47, prerequisites: ['analitik_data_diplomatik'], icon: Banknote, description: 'Pembekuan aset musuh.', effects: [{ stat: 'sanksi', value: 25, label: '+25% Efek Sanksi Musuh' }] },
  { id: 'suara_dewan_keamanan', name: 'Kursi Anggota Dewan PBB', category: 'diplomasi', tier: 4, cost: 12500, duration: 54, prerequisites: ['ekstradisi_internasional'], icon: Globe2, description: 'Hak suara penentu PBB.', effects: [{ stat: 'veto', value: 35, label: '+35% Pengaruh PBB' }] },

  // TIER 5
  { id: 'hegemoni_diplomasi', name: 'Hegemoni Diplomasi Dunia', category: 'diplomasi', tier: 5, cost: 20000, duration: 80, prerequisites: ['analitik_geopolitik'], icon: Globe2, description: 'Pemimpin blok koalisi dunia.', effects: [{ stat: 'hegemoni', value: 50, label: '+50% Kepemimpinan Dunia' }] },
  { id: 'kriptografi_kuantum', name: 'Kriptografi Kuantum Mutlak', category: 'diplomasi', tier: 5, cost: 22000, duration: 85, prerequisites: ['cyber_defense'], icon: Lock, description: 'Enkripsi tak terretas selamanya.', effects: [{ stat: 'enkripsi_max', value: 100, label: '100% Bebas Peretasan' }] },
  { id: 'intelijen_satelit_quantum', name: 'Pengawasan Masa Nyata Global', category: 'diplomasi', tier: 5, cost: 21000, duration: 82, prerequisites: ['aliansi_militer_global'], icon: Wifi, description: 'Monitor posisi seluruh armada.', effects: [{ stat: 'vision', value: 40, label: '+40% Penglihatan Peta' }] },
  { id: 'isolasi_total_musuh', name: 'Embargo Ekonomi Global', category: 'diplomasi', tier: 5, cost: 19000, duration: 76, prerequisites: ['sanksi_ekonomi'], icon: Banknote, description: 'Isolasi perdagangan lawan.', effects: [{ stat: 'embargo', value: 45, label: '+45% Kelumpuhan Musuh' }] },
  { id: 'tatanan_dunia_baru', name: 'Tatanan Dunia Baru (Pax)', category: 'diplomasi', tier: 5, cost: 25000, duration: 90, prerequisites: ['suara_dewan_keamanan'], icon: Sparkles, description: 'Perjanjian perdamaian abadi.', effects: [{ stat: 'pax', value: 50, label: '+50% Stabilitas Dunia' }] },

  // ================= BUDAYA & IDENTITAS (25 CARDS: 5x5) =================
  // TIER 1
  { id: 'digitalisasi_warisan', name: 'Digitalisasi Warisan Sejarah', category: 'budaya', tier: 1, cost: 1500, duration: 12, prerequisites: [], icon: Palette, description: 'Arsip & museum virtual kebudayaan.', effects: [{ stat: 'unesco', value: 15, label: '+15% Peluang UNESCO' }] },
  { id: 'bahasa_global', name: 'Promosi Bahasa Nasional', category: 'budaya', tier: 1, cost: 1600, duration: 13, prerequisites: [], icon: Globe2, description: 'Pusat pengajaran bahasa di luar negeri.', effects: [{ stat: 'bahasa', value: 10, label: '+10% Pengaruh Bahasa' }] },
  { id: 'kuliner_nusantara', name: 'Festival Kuliner Tradisional', category: 'budaya', tier: 1, cost: 1400, duration: 11, prerequisites: [], icon: Palette, description: 'Diplomasi kuliner rempah & sajian khas.', effects: [{ stat: 'kuliner', value: 12, label: '+12% Popularitas Kuliner' }] },
  { id: 'musik_tradisional', name: 'Konser Etnik Nasional', category: 'budaya', tier: 1, cost: 1300, duration: 10, prerequisites: [], icon: Sparkles, description: 'Pertunjukan instrumen musik tradisional.', effects: [{ stat: 'musik', value: 10, label: '+10% Kebanggaan Seni' }] },
  { id: 'kain_wasutra', name: 'Galeri Wastra & Tekstil', category: 'budaya', tier: 1, cost: 1550, duration: 12, prerequisites: [], icon: Palette, description: 'Promosi tenun & tekstil tradisional.', effects: [{ stat: 'tenun', value: 11, label: '+11% Nilai Ekspor Wastra' }] },

  // TIER 2
  { id: 'industri_kreatif', name: 'Studio Animasi & Game', category: 'budaya', tier: 2, cost: 2800, duration: 18, prerequisites: ['digitalisasi_warisan'], icon: Palette, description: 'Game & animasi komersial.', effects: [{ stat: 'game', value: 15, label: '+15% PDB Ekonomi Kreatif' }] },
  { id: 'festival_internasional', name: 'Festival Film & Musik Dunia', category: 'budaya', tier: 2, cost: 2600, duration: 17, prerequisites: ['bahasa_global'], icon: Palette, description: 'Pentas seni internasional.', effects: [{ stat: 'pariwisata', value: 14, label: '+14% Turis Asing' }] },
  { id: 'restorasi_cagar', name: 'Restorasi Situs Sejarah', category: 'budaya', tier: 2, cost: 2700, duration: 17, prerequisites: ['kuliner_nusantara'], icon: Sparkles, description: 'Pemugaran cagar budaya.', effects: [{ stat: 'cagar', value: 16, label: '+16% Daya Tarik Wisata' }] },
  { id: 'sanggar_seni_daerah', name: 'Sanggar Seni Pemuda', category: 'budaya', tier: 2, cost: 2400, duration: 15, prerequisites: ['musik_tradisional'], icon: BookOpen, description: 'Pendidikan tari & seni rakyat.', effects: [{ stat: 'sanggar', value: 12, label: '+12% Pemuda Berbudaya' }] },
  { id: 'literasi_sejarah', name: 'Penerbitan Buku Sejarah', category: 'budaya', tier: 2, cost: 2500, duration: 16, prerequisites: ['kain_wasutra'], icon: BookOpen, description: 'Arsip literatur kebudayaan bangsa.', effects: [{ stat: 'buku', value: 13, label: '+13% Literasi Bangsa' }] },

  // TIER 3
  { id: 'pariwisata_virtual', name: 'Pariwisata VR & AR', category: 'budaya', tier: 3, cost: 5000, duration: 28, prerequisites: ['industri_kreatif'], icon: Globe2, description: 'Tur situs sejarah berbasis Metaverse.', effects: [{ stat: 'devisa_vr', value: 18, label: '+18% Devisa Pariwisata' }] },
  { id: 'sinema_nasional', name: 'Bioskop & Film Layar Lebar', category: 'budaya', tier: 3, cost: 5200, duration: 30, prerequisites: ['festival_internasional'], icon: Palette, description: 'Film nasional pemenang penghargaan.', effects: [{ stat: 'soft_power_film', value: 20, label: '+20% Soft Power Film' }] },
  { id: 'taman_budaya_nasional', name: 'Kompleks Taman Budaya', category: 'budaya', tier: 3, cost: 4800, duration: 27, prerequisites: ['restorasi_cagar'], icon: Sparkles, description: 'Pusat teater & pameran nasional.', effects: [{ stat: 'teater', value: 15, label: '+15% Kunjungan Budaya' }] },
  { id: 'arsip_digital_nasional', name: 'Arsip Manuskrip Kuno', category: 'budaya', tier: 3, cost: 4900, duration: 28, prerequisites: ['sanggar_seni_daerah'], icon: BookOpen, description: 'Digitalisasi naskah sejarah kuno.', effects: [{ stat: 'naskah', value: 17, label: '+17% Pengetahuan Kuno' }] },
  { id: 'desain_arsitektur', name: 'Arsitektur Khas Modern', category: 'budaya', tier: 3, cost: 5100, duration: 29, prerequisites: ['literasi_sejarah'], icon: Sparkles, description: 'Gedung bernuansa estetika etnik.', effects: [{ stat: 'ikon', value: 16, label: '+16% Estetika Kota' }] },

  // TIER 4
  { id: 'diplomasi_budaya', name: 'Pusat Kebudayaan Dunia', category: 'budaya', tier: 4, cost: 9000, duration: 42, prerequisites: ['pariwisata_virtual'], icon: Globe2, description: 'Gedung kebudayaan di 50 negara.', effects: [{ stat: 'global_culture', value: 25, label: '+25% Pengaruh Budaya' }] },
  { id: 'ekspor_konten_kreatif', name: 'Lisensi Hak Cipta Ekspor', category: 'budaya', tier: 4, cost: 9500, duration: 44, prerequisites: ['sinema_nasional'], icon: Banknote, description: 'Ekspor komik, game, & musik.', effects: [{ stat: 'royalti', value: 22, label: '+22% Royalti Konten' }] },
  { id: 'destinasi_super_prioritas', name: 'Kawasan Wisata Bahari', category: 'budaya', tier: 4, cost: 9200, duration: 43, prerequisites: ['taman_budaya_nasional'], icon: Globe2, description: 'Resort eco-tourism maritim.', effects: [{ stat: 'turis_max', value: 25, label: '+25% Devisa Wisatawan' }] },
  { id: 'olahraga_tradisional', name: 'Kompetisi Bela Diri Dunia', category: 'budaya', tier: 4, cost: 8800, duration: 40, prerequisites: ['arsip_digital_nasional'], icon: Shield, description: 'Kejuaraan olahraga bela diri.', effects: [{ stat: 'silat', value: 20, label: '+20% Prestasi Olahraga' }] },
  { id: 'pusat_fashion_etnik', name: 'Pekan Mode Etnik Dunia', category: 'budaya', tier: 4, cost: 9100, duration: 42, prerequisites: ['desain_arsitektur'], icon: Palette, description: 'Fashion show etnik internasional.', effects: [{ stat: 'fashion', value: 24, label: '+24% Pasar Mode Etnik' }] },

  // TIER 5
  { id: 'hegemoni_kultural', name: 'Gelombang Budaya Global', category: 'budaya', tier: 5, cost: 16000, duration: 70, prerequisites: ['diplomasi_budaya'], icon: Sparkles, description: 'Tren gaya hidup & lagu dunia.', effects: [{ stat: 'wave', value: 40, label: '+40% Trendsetter Dunia' }] },
  { id: 'metaverse_nusantara', name: 'Metaverse Kebudayaan Global', category: 'budaya', tier: 5, cost: 18000, duration: 75, prerequisites: ['ekspor_konten_kreatif'], icon: Cpu, description: 'Dunia virtual kebudayaan penuh.', effects: [{ stat: 'metaverse', value: 35, label: '+35% Pendapatan Virtual' }] },
  { id: 'keajaiban_dunia_baru', name: 'Monumen Kebudayaan Megalitikum', category: 'budaya', tier: 5, cost: 20000, duration: 85, prerequisites: ['destinasi_super_prioritas'], icon: Sparkles, description: 'Monumen keajaiban dunia baru.', effects: [{ stat: 'wonder', value: 50, label: '+50% Kehormatan Bangsa' }] },
  { id: 'filsafat_kebijaksanaan', name: 'Akademi Filsafat & Kebijaksanaan', category: 'budaya', tier: 5, cost: 15000, duration: 65, prerequisites: ['olahraga_tradisional'], icon: BookOpen, description: 'Filsafat kedamaian bagi dunia.', effects: [{ stat: 'filsafat', value: 30, label: '+30% Etika & Karakter' }] },
  { id: 'identitas_abadi', name: 'Warisan Kebudayaan Abadi', category: 'budaya', tier: 5, cost: 22000, duration: 90, prerequisites: ['pusat_fashion_etnik'], icon: Palette, description: 'Pengakuan mutlak sejarah peradaban.', effects: [{ stat: 'peradaban', value: 50, label: '+50% Legasi Peradaban' }] },
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

export type SelectionCategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

const FOCUS_CATEGORIES_MAP: Record<SelectionCategoryKey, CategoryKey[]> = {
  ekonomi: ['ekonomi', 'sains', 'lingkungan'],
  militer: ['militer'],
  diplomasi: ['diplomasi', 'sosial', 'budaya'],
};

interface PenelitianPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory: SelectionCategoryKey;
  onBackToSelection?: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
}

export default function PenelitianPageModal({
  isOpen,
  onClose,
  initialCategory,
  onBackToSelection,
  countryDetail,
  setCountryDetail,
}: PenelitianPageModalProps) {
  const allowedCategories = FOCUS_CATEGORIES_MAP[initialCategory] || ['ekonomi'];
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(allowedCategories[0]);
  const [confirmTarget, setConfirmTarget] = useState<Research | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<{ research: Research; targetLevel: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const categories = FOCUS_CATEGORIES_MAP[initialCategory] || ['ekonomi'];
    setActiveCategory(categories[0]);
  }, [initialCategory]);

  if (!isOpen || !mounted) return null;

  const completedResearch: string[] = countryDetail?.completed_research || [];
  const researchLevels: Record<string, number> = countryDetail?.research_levels || {};
  const activeResearchId: string | null = countryDetail?.active_research || null;
  const activeResearchProgress: number = countryDetail?.active_research_progress || 0;
  const money = Number(countryDetail?.anggaran || 0);
  const religion = countryDetail?.religion ?? countryDetail?.agama_utama ?? countryDetail?.agama;
  const hasAtheismResearchBonus = String(religion || '').trim().toLowerCase() === 'ateisme';
  const researchContracts = Array.isArray(countryDetail?.researchContracts) ? countryDetail.researchContracts : [];
  
  const educationPoints = calculateEducationPoints(countryDetail);
  const educationModifier = getEducationResearchModifier(educationPoints);
  const combinedModifier = calculateCombinedResearchDurationModifier(educationPoints, religion, researchContracts);

  const getEffectiveResearchDuration = (durationDays: number) => {
    return applyCombinedResearchDuration(durationDays, educationPoints, religion, researchContracts);
  };

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

  const handleStartResearch = (research: Research) => {
    if (!setCountryDetail || !countryDetail) return;
    if (isUnlocked(research.id) || isActive(research.id)) return;
    if (isLocked(research) || !canAfford(research.cost)) return;
    if (activeResearchId) return;

    const safeDate = getSafeDateString();
    const endDateStr = addDays(safeDate, getEffectiveResearchDuration(research.duration));

    setCountryDetail({
      ...countryDetail,
      anggaran: money - research.cost,
      active_research: research.id,
      active_research_progress: 0,
      active_research_end_date: endDateStr,
    });
    setConfirmTarget(null);
  };

  const handleUpgradeResearch = () => {
    if (!confirmUpgrade || !setCountryDetail || !countryDetail) return;
    const { research, targetLevel } = confirmUpgrade;
    const cost = getCardUpgradeCost(research, targetLevel);
    if (money < cost) return;
    if (activeResearchId) return;

    const safeDate = getSafeDateString();
    const duration = getEffectiveResearchDuration(getCardUpgradeDuration(research, targetLevel));
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

  const applyLevelBonus = (effect: ResearchEffect, level: number): string => {
    if (level <= 0) return effect.label;
    const bonus = getCardBonus(level);
    const amplified = effect.value * (1 + bonus / 100);
    const isReduction = effect.label.trim().startsWith('-') ||
      ['emisi', 'polusi', 'kriminalitas', 'pengangguran', 'penyakit', 'kebocoran', 'sabotase', 'inflasi', 'subsidi'].some((s) => effect.stat.includes(s));

    if (isReduction) {
      return `-${Math.abs(amplified).toFixed(1)}% ${effect.label.replace(/^[+-]?\d+(\.\d+)?%\s*/, '')}`;
    }
    return `+${amplified.toFixed(1)}% ${effect.label.replace(/^[+-]?\d+(\.\d+)?%\s*/, '')}`;
  };

  return createPortal(
    <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-[200] bg-[#0A1A1A] flex flex-col font-sans animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="px-4 sm:px-8 py-3 bg-[#0F2424] border-b border-[#00FFAA]/30 flex flex-col xl:flex-row xl:items-center justify-between shadow-lg relative z-20 shrink-0 gap-3">
        {/* BARIS UTAMA: ICON, TITLE, SUBTITLE & BUTTON TUTUP */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/40 text-[#00FFAA] shrink-0">
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

          <button onClick={onClose} className="xl:hidden p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* KONTROL & STATISTIK */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
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
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-xs font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-36 sm:w-48 xl:w-56 transition-all placeholder:text-[#6B8A8A]"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
          </div>

          {onBackToSelection && (
            <button
              onClick={onBackToSelection}
              title="Ganti Sektor Utama"
              className="px-3 py-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA]/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Ganti Sektor</span>
            </button>
          )}

          <button onClick={onClose} className="hidden xl:flex p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase items-center gap-1 shadow-sm shrink-0 ml-auto">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
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
          {CATEGORIES.filter((cat) => allowedCategories.includes(cat.key)).map((cat) => {
            const isActiveTab = activeCategory === cat.key;
            const stats = categoryStats(cat.key);
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${isActiveTab
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
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-1 shrink-0 ${isActiveTab ? 'bg-[#0A1A1A]/20 text-[#0A1A1A]' : 'bg-[#0A1A1A] text-[#00FFAA]'
                    }`}
                >
                  {stats.done}/{stats.total}
                </span>
              </button>
            );
          })}

          {/* PANEL RISET AKTIF */}
          {(activeResearch || activeUpgradeData) && (
            <div className="mt-[#00FFAA]/10 p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 mt-4">
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

          {/* STATUS PENDIDIKAN & PENELITIAN */}
          <div className="mt-2 p-3 rounded-2xl bg-[#0F2424] border border-[#00FFAA]/30 space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00FFAA]" />
                <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
                  POIN PENDIDIKAN
                </span>
              </div>
              <span className="text-base sm:text-lg font-black text-amber-400">
                {educationPoints} / 100
              </span>
            </div>

            {/* Box 1: Pengaruh Poin Pendidikan */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${
              educationModifier.isPenalty
                ? 'bg-[#2A141A] border-rose-500/50 text-rose-300'
                : 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
            }`}>
              <span className="font-bold">Pengaruh Waktu Riset:</span>
              <span className="font-black">{educationModifier.label}</span>
            </div>

            {/* Box 2: Bonus Ateisme (jika aktif) */}
            {combinedModifier.hasAtheismBonus && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Bonus Ateisme:</span>
                <span className="font-black">-15% Waktu Penelitian</span>
              </div>
            )}

            {/* Box 3: UNESCO Bonus (jika anggota) */}
            {isMemberOfUNESCO(countryDetail?.country || '') && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Keanggotaan UNESCO:</span>
                <span className="font-black">+5% Kecepatan Riset Sains</span>
              </div>
            )}

            {/* Box 4: ITU Bonus (jika anggota) */}
            {isMemberOfITU(countryDetail?.country || '') && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0E2A20] border border-emerald-500/50 text-emerald-300 text-xs font-bold">
                <span className="font-bold">Keanggotaan ITU:</span>
                <span className="font-black">+5% Kecepatan Riset</span>
              </div>
            )}
          </div>

          {/* INFO SISTEM */}
          <div className="mt-2 p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3 text-[#00FFAA]" />
              <span className="text-[9px] font-black text-[#00FFAA] uppercase tracking-widest">
                Bonus Level Card
              </span>
            </div>
            <div className="space-y-1 pr-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((lvl) => (
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

          {/* Layout 5 Kolom Horisontal (Tier I s/d Tier V) dengan Garis Konektor Dashed */}
          <div className="overflow-x-auto custom-scrollbar pb-6 pt-2">
            <div className="min-w-[1250px] grid grid-cols-5 gap-6 relative">
              {[1, 2, 3, 4, 5].map((tierNum) => {
                const tierItems = filteredData.filter((r) => getResearchTier(r, RESEARCH_DATA) === tierNum);

                return (
                  <div key={tierNum} className="flex flex-col gap-4 relative z-10">
                    {/* Header Tier Badge */}
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30">
                      <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
                        TIER {ROMAN_NUMERALS[tierNum - 1]}
                      </span>
                      <span className="text-[10px] font-bold text-[#6B8A8A]">
                        {tierItems.filter((r) => isUnlocked(r.id)).length}/{tierItems.length}
                      </span>
                    </div>

                    {/* Node Cards in this Tier Column */}
                    {tierItems.map((research) => {
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
                      const isResearching = active || (activeUpgradeData !== null && activeUpgradeData.research.id === research.id);

                      return (
                        <div key={research.id} className="relative group">
                          {/* Garis Konektor Horisontal ke Tier Selanjutnya */}
                          {tierNum < 5 && (
                            <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 border-t-2 border-dashed border-[#00FFAA]/30 z-0 pointer-events-none" />
                          )}

                          <div
                            className={`relative rounded-xl overflow-visible border transition-all z-10 ${isResearching ? 'mt-6' : ''
                              } ${isMaxed
                                ? 'bg-gradient-to-r from-[#0F2424] via-[#0A1A1A] to-[#122E2E] border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : unlocked
                                  ? 'bg-[#0F2424] border-[#00FFAA]/50 shadow-[0_2px_10px_rgba(0,255,170,0.1)]'
                                  : active
                                    ? 'bg-[#0F2424] border-[#00FFAA] shadow-[0_0_20px_rgba(0,255,170,0.2)]'
                                    : locked
                                      ? 'bg-[#0A1A1A]/80 border-gray-800 opacity-60'
                                      : 'bg-[#0A1A1A] border-[#00FFAA]/25 hover:border-[#00FFAA]/60'
                              }`}
                          >
                            {/* TANGGAL SELESAI RISET/PEMBANGUNAN */}
                            {isResearching && (() => {
                              const durationDays = getEffectiveResearchDuration(
                                activeUpgradeData ? getCardUpgradeDuration(research, activeUpgradeData.targetLevel) : research.duration
                              );
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

                            {/* Node Card Header (Icon, Title, Roman Numeral Badge) */}
                            <div className="p-3 pb-2 flex items-center justify-between gap-2 border-b border-[#00FFAA]/10 bg-[#0F2424] rounded-t-xl">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`p-1.5 rounded-lg border shrink-0 ${isMaxed
                                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                      : unlocked
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                        : 'bg-[#00FFAA]/10 border-[#00FFAA]/30 text-[#00FFAA]'
                                    }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-[11px] font-bold text-[#E0E0E0] truncate leading-tight">
                                    {research.name}
                                  </h3>
                                </div>
                              </div>

                              {/* Badge Romawi (I, II, III, IV, V) */}
                              <div className="px-1.5 py-0.5 rounded border border-[#00FFAA]/30 bg-[#0A1A1A] text-[9px] font-black text-[#00FFAA] shrink-0 uppercase tracking-widest">
                                {ROMAN_NUMERALS[tierNum - 1]}
                              </div>
                            </div>

                            {/* Body Card */}
                            <div className="p-2.5">
                              {/* Efek Riset */}
                              <div className="space-y-1 mb-2">
                                {research.effects.map((eff, i) => {
                                  const amplifiedLabel = applyLevelBonus(eff, level);
                                  return (
                                    <div key={i} className="flex items-center gap-1 text-[9px] font-bold">
                                      <Sparkles className="w-2.5 h-2.5 text-[#00FFAA] shrink-0" />
                                      <span className="text-[#E0E0E0] truncate">{amplifiedLabel}</span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Footer Row (Durasi ⏱️, Progress Bar, Level 0/5) */}
                              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#00FFAA]/10">
                                {/* Left: Duration */}
                                <div className="flex items-center gap-0.5 text-[9px] font-bold text-[#6B8A8A] shrink-0">
                                  <Clock className="w-2.5 h-2.5 text-sky-400" />
                                  <span className="flex items-center gap-1">
                                    {hasAtheismResearchBonus && (
                                      <span className="text-rose-400 line-through">
                                        {unlocked && !isMaxed ? getCardUpgradeDuration(research, nextLevel) : research.duration}
                                      </span>
                                    )}
                                    <span className={hasAtheismResearchBonus ? 'text-emerald-400' : ''}>
                                      {getEffectiveResearchDuration(
                                        unlocked && !isMaxed ? getCardUpgradeDuration(research, nextLevel) : research.duration
                                      )}h
                                    </span>
                                  </span>
                                </div>

                                {/* Center: Progress Bar */}
                                <div className="flex-1 h-1.5 bg-[#0A1A1A] rounded-full overflow-hidden border border-[#00FFAA]/20">
                                  <div
                                    className={`h-full transition-all duration-300 ${isMaxed
                                        ? 'bg-amber-400'
                                        : active
                                          ? 'bg-[#00FFAA] animate-pulse'
                                          : unlocked
                                            ? 'bg-emerald-400'
                                            : 'bg-gray-700'
                                      }`}
                                    style={{
                                      width: `${isMaxed
                                          ? 100
                                          : active
                                            ? activeResearchProgress
                                            : (level / MAX_CARD_LEVEL) * 100
                                        }%`,
                                    }}
                                  />
                                </div>

                                {/* Right: Level Counter 0/5 */}
                                <div className="text-[9px] font-black text-[#00FFAA] shrink-0 tracking-wider">
                                  {level}/{MAX_CARD_LEVEL}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-2">
                                {!unlocked && !active && (
                                  locked ? (
                                    <div className="w-full py-1 rounded bg-gray-800/40 border border-gray-700/50 flex items-center justify-center gap-1 text-gray-500 text-[9px] font-black uppercase">
                                      <Lock className="w-2.5 h-2.5" />
                                      Terkunci
                                    </div>
                                  ) : activeResearchId ? (
                                    <div className="w-full py-1 rounded bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-1 text-[#6B8A8A] text-[9px] font-black uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Antrian Penuh
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => canUnlock && setConfirmTarget(research)}
                                      disabled={!canUnlock}
                                      className={`w-full py-1 rounded border flex items-center justify-center gap-1 text-[9px] font-black uppercase transition-all cursor-pointer ${canUnlock
                                          ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] hover:bg-[#00FFAA]/80 active:scale-95 shadow-md'
                                          : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                      <Rocket className="w-2.5 h-2.5" />
                                      {canUnlock ? `Riset (${research.cost.toLocaleString('id-ID')})` : 'Kas Tidak Cukup'}
                                    </button>
                                  )
                                )}

                                {active && (
                                  <div className="w-full py-1 rounded bg-[#00FFAA]/20 border border-[#00FFAA]/50 flex items-center justify-center gap-1 text-[#00FFAA] text-[9px] font-black uppercase">
                                    <Clock className="w-2.5 h-2.5 animate-pulse" />
                                    Diteliti ({activeResearchProgress}%)
                                  </div>
                                )}

                                {unlocked && (
                                  isMaxed ? (
                                    <div className="w-full py-1 rounded bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 flex items-center justify-center gap-1 text-amber-300 text-[9px] font-black uppercase">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      MAX (5/5)
                                    </div>
                                  ) : activeResearchId ? (
                                    <div className="w-full py-1 rounded bg-[#0A1A1A] border border-[#6B8A8A]/30 flex items-center justify-center gap-1 text-[#6B8A8A] text-[9px] font-black uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Antrian Penuh
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => canUpgrade && setConfirmUpgrade({ research, targetLevel: nextLevel })}
                                      disabled={!canUpgrade}
                                      className={`w-full py-1 rounded border flex items-center justify-center gap-1 text-[9px] font-black uppercase transition-all cursor-pointer ${canUpgrade
                                          ? 'bg-gradient-to-r from-[#00FFAA] to-emerald-400 text-[#0A1A1A] border-[#00FFAA] hover:opacity-90 active:scale-95 shadow-md'
                                          : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                      <ChevronUp className="w-2.5 h-2.5" />
                                      {canUpgrade ? `Upgrade Lv.${nextLevel}` : 'Kas Tidak Cukup'}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-[#6B8A8A] text-sm font-bold">
              Tidak ada riset yang cocok dengan "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI MULAI RISET */}
      {confirmTarget && (
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
                <span className="text-sm font-black text-sky-300 flex items-center gap-2">
                  {hasAtheismResearchBonus && (
                    <span className="text-rose-400 line-through">{confirmTarget.duration} hari</span>
                  )}
                  <span className={hasAtheismResearchBonus ? 'text-emerald-400' : ''}>
                    {getEffectiveResearchDuration(confirmTarget.duration)} hari
                  </span>
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
        </div>
      )}

      {/* MODAL KONFIRMASI UPGRADE */}
      {confirmUpgrade && (
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
                <span className="text-sm font-black text-sky-300 flex items-center gap-2">
                  {hasAtheismResearchBonus && (
                    <span className="text-rose-400 line-through">
                      {getCardUpgradeDuration(confirmUpgrade.research, confirmUpgrade.targetLevel)} hari
                    </span>
                  )}
                  <span className={hasAtheismResearchBonus ? 'text-emerald-400' : ''}>
                    {getEffectiveResearchDuration(
                      getCardUpgradeDuration(confirmUpgrade.research, confirmUpgrade.targetLevel)
                    )} hari
                  </span>
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
        </div>
      )}
    </div>,
    document.body
  );
}
