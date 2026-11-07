"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Info, Shield, CheckCircle2 } from "lucide-react";

interface IdeologiInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  bonusText?: string;
  description?: string;
}

const IDEOLOGY_DESCRIPTIONS: Record<string, { desc: string; characteristics: string[]; pros: string; cons: string }> = {
  'Demokrasi': {
    desc: 'Sistem pemerintahan di mana kekuasaan tertinggi berada di tangan rakyat dan dijalankan melalui pemilu berkala.',
    characteristics: ['Sistem multi-partai dan kebebasan sipil', 'Akuntabilitas publik tinggi', 'Perlindungan hak asasi manusia'],
    pros: 'Meningkatkan stabilitas sosial, transparansi publik, dan partisipasi warga.',
    cons: 'Pengambilan keputusan memerlukan waktu lebih lama karena proses kompromi.'
  },
  'Monarki': {
    desc: 'Sistem pemerintahan tradisional yang dipimpin oleh seorang raja/ratu atau kepala negara berketurunan.',
    characteristics: ['Kepemimpinan turun-temurun', 'Stabilitas kepemimpinan jangka panjang', 'Tradisi budaya yang kuat'],
    pros: 'Memperkuat persatuan nasional dan kesinambungan kebijakan militer.',
    cons: 'Fleksibilitas kepemimpinan dan suksesi bergantung pada garis keturunan.'
  },
  'Kapitalisme': {
    desc: 'Sistem ekonomi dan politik di mana perdagangan dan industri dikendalikan oleh pemilik swasta demi keuntungan.',
    characteristics: ['Pasar bebas & kompetisi tinggi', 'Kepemilikan aset swasta', 'Inovasi berbasis insentif finansial'],
    pros: '+50% Penerimaan Pajak, pertumbuhan ekonomi pesat dan inovasi pasar.',
    cons: 'Dapat meningkatkan kesenjangan sosial jika tidak diatur dengan baik.'
  },
  'Sosialisme': {
    desc: 'Sistem sosial dan ekonomi di mana alat produksi dan distribusi dikelola secara bersama untuk kesejahteraan publik.',
    characteristics: ['Jaminan sosial luas', 'Pemerataan ekonomi', 'Layanan publik murah/gratis'],
    pros: '+10% Bonus tingkat kelahiran & peningkatan kepuasan serta jaminan masyarakat.',
    cons: 'Beban anggaran negara untuk subsidi dan program sosial lebih tinggi.'
  },
  'Komunisme': {
    desc: 'Ideologi dengan tujuan pembentukan masyarakat tanpa kelas berdasarkan kepemilikan bersama atas alat produksi.',
    characteristics: ['Ekonomi terencana penuh oleh negara', 'Pemerintahan partai tunggal', 'Distribusi barang komunal'],
    pros: 'Produksi Semua Lini: +10%.',
    cons: 'Menurunkan fleksibilitas pasar swasta dan inovasi independen.'
  },
  'Nasionalisme': {
    desc: 'Ideologi yang menekankan kedaulatan, persatuan, kebudayaan, dan kepentingan nasional di atas segalanya.',
    characteristics: ['Kemandirian ekonomi & pangan', 'Kebanggaan identitas nasional', 'Proteksi terhadap pengaruh luar'],
    pros: '+10% Kecepatan produksi pangan dan solidaritas nasional yang sangat tinggi.',
    cons: 'Dapat menimbulkan ketegangan diplomasi internasional jika terlalu agresif.'
  },
  'Konservatisme': {
    desc: 'Paham yang mengutamakan pemeliharaan nilai-nilai tradisional, hukum, ketertiban, serta institusi mapan.',
    characteristics: ['Stabilitas nilai budaya & agama', 'Ketertiban sosial tinggi', 'Perubahan terjadi secara gradual'],
    pros: '+5% Penerimaan Pajak dan stabilitas hukum yang konsisten.',
    cons: 'Kurang responsif terhadap perubahan sosial modern yang cepat.'
  },
  'Liberalisme': {
    desc: 'Ideologi yang berfokus pada kebebasan individu, hak sipil, persahabatan internasional, dan pasar bebas.',
    characteristics: ['Kebebasan individu & pasar', 'Dukungan globalisasi', 'Regulasi ekonomi minim'],
    pros: '+25% penerimaan pajak nasional.',
    cons: 'Sensitif terhadap gejolak ekonomi dan krisis finansial global.'
  },
  'Otoritarianisme': {
    desc: 'Sistem politik yang ditandai oleh pemusatan kekuasaan pada penguasa tanpa kontrol oposisi yang efektif.',
    characteristics: ['Kepemimpinan terpusat & tegas', 'Mobilisasi sumber daya cepat', 'Disiplin nasional ketat'],
    pros: '+20% Produksi Sumber Daya nasional dan kecepatan eksekusi proyek vital.',
    cons: 'Menekan kebebasan berpendapat dan hak demonstrasi warga.'
  },
};

export default function IdeologiInfoModal({
  isOpen,
  onClose,
  title,
  icon,
  bonusText,
}: IdeologiInfoModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const detail = IDEOLOGY_DESCRIPTIONS[title] || {
    desc: 'Ideologi kedaulatan yang mengatur arah kebijakan politik, ekonomi, dan kemasyarakatan negara.',
    characteristics: ['Prinsip kedaulatan nasional', 'Orientasi kebijakan publik'],
    pros: bonusText || 'Memberikan efek khusus bagi pembangunan negara.',
    cons: 'Memerlukan adaptasi anggaran dan kebijakan sosial.'
  };

  return createPortal(
    <div className="notebook-modal-frame fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-root-accent/10 rounded-lg border border-root-accent/30 text-root-accent">
              {icon || <Info className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Info className="w-3 h-3 text-root-accent" />
                <span className="text-[10px] font-bold text-root-accent uppercase tracking-wider">Informasi Ideologi</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-root-text tracking-wide uppercase">{title}</h3>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1"
           appearance="custom">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-root-surface relative z-10 custom-scrollbar flex flex-col justify-center">
          {/* Bonus / Efek Utama */}
          <div className="bg-root-accent/10 border border-root-accent/30 p-6 rounded-2xl text-center">
            <span className="text-xs font-bold text-root-accent uppercase tracking-widest block mb-2">
              Bonus & Efek Utama Negara
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-root-text">
              {bonusText || 'Tidak ada bonus spesifik'}
            </p>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="px-6 py-3 border-t border-root-accent/20 bg-root-canvas flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-root-accent hover:bg-[#00C282] text-root-canvas font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}