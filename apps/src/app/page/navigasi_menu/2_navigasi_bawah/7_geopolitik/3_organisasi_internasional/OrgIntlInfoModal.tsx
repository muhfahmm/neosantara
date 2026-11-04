"use client";

import React, { useEffect } from "react";
import { Info } from "lucide-react";
import { getKerjaSamaOrganisasiRegionalBonusPercent } from "@/app/page/bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/4_Kerja Sama Organisasi Regional";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface OrgIntlInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  orgIcon: React.ElementType;
  isMember: boolean;
  countryDetail?: Record<string, unknown> | null;
}

const ORGANIZATION_INFO: Record<string, { description: string; focus: string; benefit?: string }> = {
  "Interpol": {
    description: "Organisasi yang membantu kepolisian negara anggota bekerja sama dalam menangani kejahatan lintas negara.",
    focus: "Pertukaran informasi kepolisian, koordinasi bantuan internasional, serta penindakan kejahatan lintas batas.",
    benefit: "Tingkat kejahatan turun -5%",
  },
  "Organisasi Kesehatan Dunia (WHO)": {
    description: "Badan PBB yang mengarahkan dan mengoordinasikan kerja sama internasional di bidang kesehatan.",
    focus: "Kesehatan masyarakat, penanganan wabah, serta penyusunan pedoman kesehatan global.",
    benefit: "Risiko epidemi & pandemi turun -5%",
  },
  "UNESCO": {
    description: "Badan PBB yang mendorong kerja sama antarnegara di bidang pendidikan, ilmu pengetahuan, dan kebudayaan.",
    focus: "Pendidikan, pelestarian warisan, ilmu pengetahuan, dan kebebasan berekspresi.",
    benefit: "Kecepatan Riset Sains +5%",
  },
  "Organisasi Perdagangan Dunia (WTO)": {
    description: "Organisasi yang menyediakan kerangka aturan perdagangan internasional dan forum penyelesaian sengketa dagang.",
    focus: "Aturan perdagangan, negosiasi, dan penyelesaian sengketa antaranggota.",
    benefit: "Harga Jual +15%, Harga Beli -10%",
  },
  "Organisasi Buruh Internasional (ILO)": {
    description: "Badan PBB yang memajukan hak-hak pekerja dan standar ketenagakerjaan yang layak.",
    focus: "Standar kerja, perlindungan pekerja, dan dialog antara pemerintah, pengusaha, serta pekerja.",
    benefit: "Produksi Manufaktur +10%",
  },
  "Organisasi Pangan dan Pertanian (FAO)": {
    description: "Badan PBB yang memimpin upaya internasional untuk mengatasi kelaparan dan meningkatkan ketahanan pangan.",
    focus: "Pertanian, pangan, gizi, dan pengelolaan sumber daya alam berkelanjutan.",
    benefit: "Produksi Pangan +10%",
  },
  "Organisasi Maritim Internasional (IMO)": {
    description: "Badan PBB yang mengembangkan aturan keselamatan dan perlindungan lingkungan untuk pelayaran internasional.",
    focus: "Keselamatan kapal, keamanan maritim, dan pencegahan pencemaran laut.",
    benefit: "Hasil Perikanan +10%",
  },
  "Organisasi Telekomunikasi Internasional (ITU)": {
    description: "Badan PBB yang mengoordinasikan penggunaan spektrum radio, orbit satelit, dan standar telekomunikasi.",
    focus: "Konektivitas global dan pengembangan teknologi informasi dan komunikasi.",
    benefit: "Kecepatan Riset +5%",
  },
  "Organisasi Meteorologi Dunia (WMO)": {
    description: "Badan PBB yang memfasilitasi kerja sama global dalam pengamatan cuaca, iklim, dan air.",
    focus: "Data meteorologi, peringatan dini, iklim, dan hidrologi.",
    benefit: "Risiko Bencana Alam -5%",
  },
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": {
    description: "Organisasi regional untuk mendorong kerja sama dan integrasi di antara negara-negara Asia Tenggara.",
    focus: "Kerja sama politik-keamanan, ekonomi, dan sosial-budaya kawasan.",
    benefit: "Kecepatan Pembangunan +10%",
  },
  "Uni Eropa (EU)": {
    description: "Persatuan politik dan ekonomi negara-negara Eropa dengan lembaga dan kebijakan bersama di berbagai bidang.",
    focus: "Pasar bersama, kebijakan lintas negara, dan kerja sama regional.",
    benefit: "Penerimaan Pajak +10%",
  },
  "Liga Arab": {
    description: "Organisasi regional yang mendorong koordinasi dan hubungan antarnegara anggota Arab.",
    focus: "Konsultasi dan kerja sama politik, ekonomi, budaya, serta sosial.",
    benefit: "Pengaruh Diplomasi +5 Suara PBB",
  },
  "Uni Afrika (AU)": {
    description: "Organisasi kontinental yang mendorong persatuan, perdamaian, dan pembangunan di Afrika.",
    focus: "Integrasi Afrika, penyelesaian konflik, dan pembangunan berkelanjutan.",
    benefit: "Kecepatan Pembangunan +10%",
  },
  "Organisasi Kerja Sama Islam (OKI)": {
    description: "Organisasi antar-pemerintah yang memperkuat kerja sama dan solidaritas di antara negara-negara anggotanya.",
    focus: "Konsultasi politik, pembangunan, bantuan kemanusiaan, dan isu dunia Islam.",
    benefit: "Produksi Pangan +10%",
  },
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": {
    description: "Forum kerja sama negara-negara BRICS untuk memperkuat dialog dan koordinasi di berbagai isu global.",
    focus: "Kerja sama ekonomi, pembangunan, dan koordinasi dalam tata kelola global.",
    benefit: "Pendapatan Negara +10%",
  },
  "Pakta Pertahanan Atlantik Utara (NATO)": {
    description: "Aliansi pertahanan kolektif negara-negara anggota di kawasan Atlantik Utara dan Eropa.",
    focus: "Konsultasi keamanan dan pertahanan kolektif berdasarkan perjanjian aliansi.",
    benefit: "Kekuatan Militer +15%",
  },
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": {
    description: "Organisasi negara-negara pengekspor minyak yang mengoordinasikan kebijakan perminyakan para anggotanya.",
    focus: "Koordinasi kebijakan minyak dan stabilitas pasar energi.",
    benefit: "Harga Minyak +20%",
  },
  "Kelompok Duapuluh (G20)": {
    description: "Forum kerja sama ekonomi internasional bagi ekonomi besar dan Uni Eropa serta Uni Afrika.",
    focus: "Koordinasi ekonomi global, stabilitas keuangan, dan pembangunan.",
    benefit: "Pendapatan Negara +20%",
  },
};

export default function OrgIntlInfoModal({
  isOpen,
  onClose,
  orgName,
  orgIcon: OrgIcon,
  isMember,
  countryDetail,
}: OrgIntlInfoModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const info = ORGANIZATION_INFO[orgName] || {
    description: "Forum kerja sama internasional bagi negara-negara anggota.",
    focus: "Dialog dan koordinasi kebijakan antaranggota.",
  };
  const researchBonusPercent = isMember
    ? getKerjaSamaOrganisasiRegionalBonusPercent(countryDetail)
    : 0;
  const scaleBenefitValue = (value: string) => {
    const scaledValue = Number((Number(value) * (1 + researchBonusPercent / 100)).toFixed(2));
    const sign = value.startsWith("+") && scaledValue > 0 ? "+" : "";
    return `${sign}${scaledValue}`;
  };
  const adjustedBenefit = info.benefit?.replace(
    /([+-]?\d+(?:\.\d+)?)%/g,
    (_match, value: string) => `${scaleBenefitValue(value)}%`
  ).replace(
    /([+-]?\d+(?:\.\d+)?)(?= Suara PBB)/,
    (_match, value: string) => scaleBenefitValue(value)
  );

  return (
    <NotebookModalWrapper onClose={onClose} compact maxWidthClass="max-w-3xl" zIndexClass="z-[250]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="organization-info-title"
        className="flex max-h-[calc(100dvh-160px)] min-w-0 flex-col overflow-hidden font-sans"
      >
        <header className="flex items-center justify-between border-b border-root-accent/30 bg-root-canvas px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-root-accent/30 bg-root-accent/10 p-2 text-root-accent">
              <OrgIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-root-accent">
                <Info className="h-3 w-3" />
                Informasi Organisasi
              </div>
              <h2 id="organization-info-title" className="text-sm font-bold leading-tight text-root-text sm:text-base">{orgName}</h2>
            </div>
          </div>
          <div className="ml-3">
            <RootModalCloseButton onClick={onClose} />
          </div>
        </header>

        <div className="min-h-0 space-y-5 overflow-y-auto bg-root-surface p-5 sm:p-6">
          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-root-accent">Tentang organisasi</h3>
            <p className="text-sm leading-relaxed text-root-body">{info.description}</p>
          </section>
          <section className="rounded-xl border border-root-accent/20 bg-root-canvas p-4">
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-root-accent">Fokus kerja</h3>
            <p className="text-sm leading-relaxed text-root-body">{info.focus}</p>
          </section>
          {info.benefit && (
            <section className="flex items-center justify-between rounded-xl border border-root-modal-positive-border bg-root-modal-positive-bg p-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-root-modal-positive">Efek Keanggotaan / Bonus:</h3>
                {isMember && researchBonusPercent > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-root-body">
                    Riset Kerja Sama Organisasi Internasional: +{researchBonusPercent}% terhadap manfaat
                  </p>
                )}
                {!isMember && (
                  <p className="mt-1 text-[11px] font-semibold text-root-subtle">Manfaat aktif setelah negara menjadi anggota.</p>
                )}
              </div>
              <span className="text-right text-sm font-black text-root-modal-positive">{adjustedBenefit}</span>
            </section>
          )}
        </div>
      </section>
    </NotebookModalWrapper>
  );
}