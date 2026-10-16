import { Smile, Users2, Activity, Wallet, Wrench, Shield, ShieldAlert, Globe, Star, Landmark, ArrowRightLeft, FileText, CreditCard, BarChart3, TrendingUp, Hammer, Swords as MilitaryIcon, Bolt, Droplet, Radiation, Info, HandHelping, HeartHandshake, Tag, Eye, Home, Utensils, Atom, Scale, ScanSearch } from "lucide-react";

export const menuItems = [
  { id: "Kepuasan", icon: Smile, image: "/images/game/interface/tab-menu/kepuasan.svg", label: "Kepuasan" },
  { id: "Populasi", icon: Users2, image: "/images/game/interface/tab-menu/populasi.svg", label: "Populasi" },
  { id: "ProduksiKonsumsi", label: "Produksi & Konsumsi", icon: Activity, image: "/images/game/interface/tab-menu/produksi-konsumsi.svg" },
  { id: "Ekonomi", icon: Wallet, image: "/images/game/interface/tab-menu/ekonomi.svg", label: "Ekonomi" },
  { id: "Pembangunan", icon: Wrench, image: "/images/game/interface/tab-menu/pembangunan.svg", label: "Pembangunan" },
  { id: "Pertahanan", icon: Shield, image: "/images/game/interface/tab-menu/pertahanan.svg", label: "Pertahanan" },
  { id: "Geopolitik", icon: Globe, image: "/images/game/interface/tab-menu/geopolitik.svg", label: "Geopolitik" },
  { id: "Sosial & Budaya", icon: Star, image: "/images/game/interface/tab-menu/sosial-budaya.svg", label: "Sosial & Budaya" },
  { id: "Kementerian", icon: Landmark, image: "/images/game/interface/tab-menu/kementerian.svg", label: "Kementerian" },
];

export const subMenuItems: Record<string, any[]> = {
  "Kepuasan": [
    { id: "Dashboard:Kepuasan", label: "Statistik Kepuasan", icon: BarChart3, image: "/images/game/interface/sub-tabs/kepuasan/statistik-kepuasan.svg" },
    { id: "Action:NaikkanKepuasan", label: "Naikkan Kepuasan", icon: TrendingUp, image: "/images/game/interface/sub-tabs/kepuasan/naikkan-kepuasan.svg" },
  ],
  "Populasi": [
    { id: "Dashboard:Populasi:Overview", label: "Ringkasan Populasi", icon: Users2, image: "/images/game/interface/sub-tabs/populasi/ringkasan-populasi.svg" },
  ],
  "Ekonomi": [
    { id: "Menu:Perdagangan", label: "Perdagangan", icon: ArrowRightLeft, image: "/images/game/interface/sub-tabs/ekonomi/perdagangan.svg" },
    { id: "Menu:Pajak", label: "Manajemen Pajak", icon: FileText, image: "/images/game/interface/sub-tabs/ekonomi/pajak.svg" },
    { id: "Menu:Hutang", label: "Pinjaman & Hutang", icon: CreditCard, image: "/images/game/interface/sub-tabs/ekonomi/hutang.svg" },
    { id: "Menu:Budget", label: "Pemasukkan & Pengeluaran", icon: BarChart3, image: "/images/game/interface/sub-tabs/ekonomi/anggaran.svg" },
    { id: "Menu:PDB", label: "PDB Nasional & Dunia", icon: TrendingUp, image: "/images/game/interface/sub-tabs/ekonomi/pdb.svg" },
    { id: "Menu:Harga", label: "Harga Barang Pokok", icon: Tag, image: "/images/game/interface/sub-tabs/ekonomi/harga-barang.svg" },
    { id: "Menu:SistemEkonomi", label: "Kebijakan & Sistem Ekonomi", icon: Scale, image: "/images/game/interface/sub-tabs/ekonomi/sistem-ekonomi.svg" },
    { id: "Menu:KebijakanSubsidi", label: "Alokasi & Kebijakan Subsidi", icon: HandHelping, image: "/images/game/interface/sub-tabs/ekonomi/kebijakan-subsidi.svg" },
  ],
  "Pembangunan": [
    { id: "Menu:Produksi", label: "Produksi", icon: Hammer, image: "/images/game/interface/sub-tabs/pembangunan/produksi.svg" },
    { id: "Menu:TempatUmum", label: "Tempat Umum", icon: Users2, image: "/images/game/interface/sub-tabs/pembangunan/tempat-umum.svg" },
    { id: "Menu:HunianPermukiman", label: "Hunian Permukiman", icon: Home, image: "/images/game/interface/sub-tabs/pembangunan/hunian-permukiman.svg" },
  ],
  "ProduksiKonsumsi": [
    { id: "Menu:Kelistrikan", label: "Grid Nasional", icon: Bolt, image: "/images/game/interface/sub-tabs/produksi-konsumsi/grid-nasional.svg" },
    { id: "Menu:IndustriPangan", label: "Industri Pangan", icon: Utensils, image: "/images/game/interface/sub-tabs/produksi-konsumsi/industri-pangan.svg" },
  ],
  "Pertahanan": [
    { id: "Menu:SerangNegara", label: "Serang Negara", icon: MilitaryIcon, image: "/images/game/interface/sub-tabs/pertahanan/serang-negara.svg" },
    { id: "Menu:Intelijen", label: "Intelijen", icon: Eye, image: "/images/game/interface/sub-tabs/pertahanan/intelijen.svg" },
    { id: "Menu:WilayahDirebut", label: "Wilayah yang Direbut", icon: Globe, image: "/images/game/interface/sub-tabs/pertahanan/wilayah-direbut.svg" },
    { id: "Menu:Armada", label: "Armada", icon: ShieldAlert, image: "/images/game/interface/sub-tabs/pertahanan/armada.svg" },
    { id: "Menu:ICBM", label: "ICBM", icon: Atom, image: "/images/game/interface/sub-tabs/pertahanan/icbm.svg" },
  ],
  "Geopolitik": [
    { id: "Menu:PBB", label: "PBB", icon: Globe, image: "/images/game/interface/sub-tabs/geopolitik/pbb.svg" },
    { id: "Menu:KedutaanBesar", label: "Kedutaan Besar", icon: Landmark, image: "/images/game/interface/sub-tabs/geopolitik/kedutaan-besar.svg" },
    { id: "Menu:OrganisasiInternasional:organisasi_pbb", label: "Organisasi Internasional", icon: Landmark, image: "/images/game/interface/sub-tabs/geopolitik/organisasi-internasional.svg" },
    { id: "Menu:TingkatHubungan", label: "Tingkat Hubungan", icon: HeartHandshake, image: "/images/game/interface/sub-tabs/geopolitik/tingkat-hubungan.svg" },
  ],
  "Sosial & Budaya": [
    { id: "Menu:Agama", label: "Agama & Kepercayaan", icon: Star, image: "/images/game/interface/sub-tabs/sosial-budaya/agama-kepercayaan.svg" },
    { id: "Menu:Ideologi", label: "Ideologi Negara", icon: Shield, image: "/images/game/interface/sub-tabs/sosial-budaya/ideologi.svg" },
    { id: "Menu:DoktrinKeterbukaan", label: "Doktrin & Keterbukaan", icon: Globe, image: "/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan.svg" },
  ],
  "Kementerian": [
    { id: "Dashboard:Kementerian", label: "Kementerian", icon: Landmark, image: "/images/game/interface/sub-tabs/kementerian/dashboard-kementerian.svg" },
    { id: "Menu:AntiKorupsi", label: "Pemberantasan Korupsi", icon: ScanSearch, image: "/images/game/interface/sub-tabs/kementerian/anti-korupsi.svg" },
  ],
};
