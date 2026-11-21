import { Smile, Users2, Activity, Wallet, Wrench, Shield, ShieldAlert, Globe, Star, Landmark, ArrowRightLeft, FileText, CreditCard, BarChart3, TrendingUp, Hammer, Swords as MilitaryIcon, Bolt, HeartHandshake, Tag, Eye, Home, Utensils, Atom, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const menuItems = [
  { id: "Kepuasan", icon: Smile, image: "/images/game/interface/tab-menu/kepuasan.svg", label: "Kepuasan", translationKey: "navbar.navigation.main.kepuasan" },
  { id: "Populasi", icon: Users2, image: "/images/game/interface/tab-menu/populasi.svg", label: "Populasi", translationKey: "navbar.navigation.main.populasi" },
  { id: "ProduksiKonsumsi", label: "Produksi & Konsumsi", icon: Activity, image: "/images/game/interface/tab-menu/produksi-konsumsi.svg", translationKey: "navbar.navigation.main.produksiKonsumsi" },
  { id: "Ekonomi", icon: Wallet, image: "/images/game/interface/tab-menu/ekonomi.svg", label: "Ekonomi", translationKey: "navbar.navigation.main.ekonomi" },
  { id: "Pembangunan", icon: Wrench, image: "/images/game/interface/tab-menu/pembangunan.svg", label: "Pembangunan", translationKey: "navbar.navigation.main.pembangunan" },
  { id: "Pertahanan", icon: Shield, image: "/images/game/interface/tab-menu/pertahanan.svg", label: "Pertahanan", translationKey: "navbar.navigation.main.pertahanan" },
  { id: "Geopolitik", icon: Globe, image: "/images/game/interface/tab-menu/geopolitik.svg", label: "Geopolitik", translationKey: "navbar.navigation.main.geopolitik" },
  { id: "Sosial & Budaya", icon: Star, image: "/images/game/interface/tab-menu/sosial-budaya.svg", label: "Sosial & Budaya", translationKey: "navbar.navigation.main.sosialBudaya" },
  { id: "Kementerian", icon: Landmark, image: "/images/game/interface/tab-menu/kementerian.svg", label: "Kementerian", translationKey: "navbar.navigation.main.kementerian" },
];

interface SubMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  image: string;
  translationKey: string;
}

export const subMenuItems: Record<string, SubMenuItem[]> = {
  "Kepuasan": [
    { id: "Dashboard:Kepuasan", label: "Statistik Kepuasan", icon: BarChart3, image: "/images/game/interface/sub-tabs/kepuasan/statistik-kepuasan.svg", translationKey: "navbar.navigation.sub.kepuasanStatistics" },
    { id: "Action:NaikkanKepuasan", label: "Naikkan Kepuasan", icon: TrendingUp, image: "/images/game/interface/sub-tabs/kepuasan/naikkan-kepuasan.svg", translationKey: "navbar.navigation.sub.increaseSatisfaction" },
  ],
  "Populasi": [
    { id: "Dashboard:Populasi:Overview", label: "Ringkasan Populasi", icon: Users2, image: "/images/game/interface/sub-tabs/populasi/ringkasan-populasi.svg", translationKey: "navbar.navigation.sub.populationSummary" },
  ],
"Ekonomi": [
  { id: "Menu:Perdagangan", label: "Perdagangan", icon: ArrowRightLeft, image: "/images/game/interface/sub-tabs/ekonomi/perdagangan.svg", translationKey: "navigation_economy_trade.title" },
  { id: "Menu:Pajak", label: "Pajak", icon: FileText, image: "/images/game/interface/sub-tabs/ekonomi/pajak.svg", translationKey: "navigation_economy_tax.title" },
  { id: "Menu:Hutang", label: "Pinjaman", icon: CreditCard, image: "/images/game/interface/sub-tabs/ekonomi/hutang.svg", translationKey: "navigation_economy_loans.title" },
  { id: "Menu:Pendapatan", label: "Pendapatan", icon: BarChart3, image: "/images/game/interface/sub-tabs/ekonomi/anggaran.svg", translationKey: "navigation_economy_income.title" },
  { id: "Menu:DayaBeli", label: "Daya Beli", icon: Tag, image: "/images/game/interface/sub-tabs/ekonomi/harga-barang.svg", translationKey: "navigation_economy_purchasing_power.title" },
  { id: "Menu:SistemEkonomi", label: "Sistem Ekonomi", icon: Scale, image: "/images/game/interface/sub-tabs/ekonomi/sistem-ekonomi.svg", translationKey: "navigation_economy_system.title" },
],
  "Pembangunan": [
    { id: "Menu:Produksi", label: "Produksi", icon: Hammer, image: "/images/game/interface/sub-tabs/pembangunan/produksi.svg", translationKey: "navbar.navigation.sub.production" },
    { id: "Menu:TempatUmum", label: "Tempat Umum", icon: Users2, image: "/images/game/interface/sub-tabs/pembangunan/tempat-umum.svg", translationKey: "navbar.navigation.sub.publicFacilities" },
    { id: "Menu:HunianPermukiman", label: "Hunian Permukiman", icon: Home, image: "/images/game/interface/sub-tabs/pembangunan/hunian-permukiman.svg", translationKey: "navbar.navigation.sub.housing" },
  ],
  "ProduksiKonsumsi": [
    { id: "Menu:Kelistrikan", label: "Grid Nasional", icon: Bolt, image: "/images/game/interface/sub-tabs/produksi-konsumsi/grid-nasional.svg", translationKey: "navbar.navigation.sub.nationalGrid" },
    { id: "Menu:IndustriPangan", label: "Industri Pangan", icon: Utensils, image: "/images/game/interface/sub-tabs/produksi-konsumsi/industri-pangan.svg", translationKey: "navbar.navigation.sub.foodIndustry" },
  ],
  "Pertahanan": [
    { id: "Menu:SerangNegara", label: "Serang Negara", icon: MilitaryIcon, image: "/images/game/interface/sub-tabs/pertahanan/serang-negara.svg", translationKey: "navbar.navigation.sub.attackCountry" },
    { id: "Menu:Intelijen", label: "Intelijen", icon: Eye, image: "/images/game/interface/sub-tabs/pertahanan/intelijen.svg", translationKey: "navbar.navigation.sub.intelligence" },
    { id: "Menu:WilayahDirebut", label: "Wilayah yang Direbut", icon: Globe, image: "/images/game/interface/sub-tabs/pertahanan/wilayah-direbut.svg", translationKey: "navbar.navigation.sub.capturedTerritory" },
    { id: "Menu:Armada", label: "Armada", icon: ShieldAlert, image: "/images/game/interface/sub-tabs/pertahanan/armada.svg", translationKey: "navbar.navigation.sub.fleet" },
    { id: "Menu:ICBM", label: "ICBM", icon: Atom, image: "/images/game/interface/sub-tabs/pertahanan/icbm.svg", translationKey: "navbar.navigation.sub.icbm" },
  ],
  "Geopolitik": [
    { id: "Menu:PBB", label: "PBB", icon: Globe, image: "/images/game/interface/sub-tabs/geopolitik/pbb.svg", translationKey: "navbar.navigation.sub.un" },
    { id: "Menu:KedutaanBesar", label: "Kedutaan Besar", icon: Landmark, image: "/images/game/interface/sub-tabs/geopolitik/kedutaan-besar.svg", translationKey: "navbar.navigation.sub.embassy" },
    { id: "Menu:OrganisasiInternasional:organisasi_pbb", label: "Organisasi Internasional", icon: Landmark, image: "/images/game/interface/sub-tabs/geopolitik/organisasi-internasional.svg", translationKey: "navbar.navigation.sub.internationalOrganizations" },
    { id: "Menu:TingkatHubungan", label: "Tingkat Hubungan", icon: HeartHandshake, image: "/images/game/interface/sub-tabs/geopolitik/tingkat-hubungan.svg", translationKey: "navbar.navigation.sub.relationLevel" },
  ],
  "Sosial & Budaya": [
    { id: "Menu:Agama", label: "Agama & Kepercayaan", icon: Star, image: "/images/game/interface/sub-tabs/sosial-budaya/agama-kepercayaan.svg", translationKey: "navbar.navigation.sub.religion" },
    { id: "Menu:Ideologi", label: "Ideologi Negara", icon: Shield, image: "/images/game/interface/sub-tabs/sosial-budaya/ideologi.svg", translationKey: "navbar.navigation.sub.nationalIdeology" },
    { id: "Menu:DoktrinKeterbukaan", label: "Doktrin & Keterbukaan", icon: Globe, image: "/images/game/interface/sub-tabs/sosial-budaya/doktrin-keterbukaan.svg", translationKey: "navbar.navigation.sub.opennessDoctrine" },
  ],
  "Kementerian": [
    { id: "Dashboard:Kementerian", label: "Kementerian", icon: Landmark, image: "/images/game/interface/sub-tabs/kementerian/dashboard-kementerian.svg", translationKey: "navbar.navigation.sub.ministry" },
  ],
};