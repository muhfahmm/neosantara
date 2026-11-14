"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

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
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[250]">
      <div className="root-modal-util-b74379da23">
        <RootInfoModalHeader
          title={
            <>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-root-accent">
                <Info aria-hidden="true" className="h-3 w-3" />
                Informasi Ideologi
              </span>
              <span className="block truncate">{title}</span>
            </>
          }
          onClose={onClose}
          icon={icon || <Info aria-hidden="true" />}
          size="standard"
        />

        <div className="root-info-modal-content relative z-10 flex min-h-0 flex-1 flex-col justify-center gap-4 overflow-y-auto bg-root-surface p-4 custom-scrollbar sm:p-6">
          <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-4 sm:p-5">
            <p className="mb-2 text-sm font-bold text-root-text">{detail.desc}</p>
            <ul className="space-y-1.5 text-xs text-root-subtle">
              {detail.characteristics.map((characteristic) => (
                <li key={characteristic} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-root-accent" />
                  <span>{characteristic}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-root-accent/30 bg-root-accent/10 p-4 text-center sm:p-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-root-accent">
              Bonus & Efek Utama Negara
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-root-text">
              {bonusText || 'Tidak ada bonus spesifik'}
            </p>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}