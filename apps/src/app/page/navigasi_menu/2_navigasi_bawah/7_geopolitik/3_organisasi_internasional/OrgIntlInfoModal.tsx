"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";

interface OrgIntlInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  orgIcon: React.ElementType;
}

const ORGANIZATION_INFO: Record<string, { description: string; focus: string }> = {
  "Interpol": {
    description: "Organisasi yang membantu kepolisian negara anggota bekerja sama dalam menangani kejahatan lintas negara.",
    focus: "Pertukaran informasi kepolisian dan koordinasi bantuan internasional.",
  },
  "Organisasi Kesehatan Dunia (WHO)": {
    description: "Badan PBB yang mengarahkan dan mengoordinasikan kerja sama internasional di bidang kesehatan.",
    focus: "Kesehatan masyarakat, penanganan wabah, dan pedoman kesehatan global.",
  },
  "UNESCO": {
    description: "Badan PBB yang mendorong kerja sama antarnegara di bidang pendidikan, ilmu pengetahuan, dan kebudayaan.",
    focus: "Pendidikan, pelestarian warisan, ilmu pengetahuan, dan kebebasan berekspresi.",
  },
  "Organisasi Perdagangan Dunia (WTO)": {
    description: "Organisasi yang menyediakan kerangka aturan perdagangan internasional dan forum penyelesaian sengketa dagang.",
    focus: "Aturan perdagangan, negosiasi, dan penyelesaian sengketa antaranggota.",
  },
  "Organisasi Buruh Internasional (ILO)": {
    description: "Badan PBB yang memajukan hak-hak pekerja dan standar ketenagakerjaan yang layak.",
    focus: "Standar kerja, perlindungan pekerja, dan dialog antara pemerintah, pengusaha, serta pekerja.",
  },
  "Organisasi Pangan dan Pertanian (FAO)": {
    description: "Badan PBB yang memimpin upaya internasional untuk mengatasi kelaparan dan meningkatkan ketahanan pangan.",
    focus: "Pertanian, pangan, gizi, dan pengelolaan sumber daya alam berkelanjutan.",
  },
  "Organisasi Penerbangan Sipil Internasional (ICAO)": {
    description: "Badan PBB yang mengembangkan standar dan praktik untuk penerbangan sipil internasional.",
    focus: "Keselamatan, keamanan, navigasi, dan keteraturan penerbangan sipil.",
  },
  "Organisasi Maritim Internasional (IMO)": {
    description: "Badan PBB yang mengembangkan aturan keselamatan dan perlindungan lingkungan untuk pelayaran internasional.",
    focus: "Keselamatan kapal, keamanan maritim, dan pencegahan pencemaran laut.",
  },
  "Organisasi Telekomunikasi Internasional (ITU)": {
    description: "Badan PBB yang mengoordinasikan penggunaan spektrum radio, orbit satelit, dan standar telekomunikasi.",
    focus: "Konektivitas global dan pengembangan teknologi informasi dan komunikasi.",
  },
  "Organisasi Meteorologi Dunia (WMO)": {
    description: "Badan PBB yang memfasilitasi kerja sama global dalam pengamatan cuaca, iklim, dan air.",
    focus: "Data meteorologi, peringatan dini, iklim, dan hidrologi.",
  },
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": {
    description: "Organisasi regional untuk mendorong kerja sama dan integrasi di antara negara-negara Asia Tenggara.",
    focus: "Kerja sama politik-keamanan, ekonomi, dan sosial-budaya kawasan.",
  },
  "Uni Eropa (EU)": {
    description: "Persatuan politik dan ekonomi negara-negara Eropa dengan lembaga dan kebijakan bersama di berbagai bidang.",
    focus: "Pasar bersama, kebijakan lintas negara, dan kerja sama regional.",
  },
  "Liga Arab": {
    description: "Organisasi regional yang mendorong koordinasi dan hubungan antarnegara anggota Arab.",
    focus: "Konsultasi dan kerja sama politik, ekonomi, budaya, serta sosial.",
  },
  "Uni Afrika (AU)": {
    description: "Organisasi kontinental yang mendorong persatuan, perdamaian, dan pembangunan di Afrika.",
    focus: "Integrasi Afrika, penyelesaian konflik, dan pembangunan berkelanjutan.",
  },
  "Organisasi Kerja Sama Islam (OKI)": {
    description: "Organisasi antar-pemerintah yang memperkuat kerja sama dan solidaritas di antara negara-negara anggotanya.",
    focus: "Konsultasi politik, pembangunan, bantuan kemanusiaan, dan isu dunia Islam.",
  },
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": {
    description: "Forum kerja sama negara-negara BRICS untuk memperkuat dialog dan koordinasi di berbagai isu global.",
    focus: "Kerja sama ekonomi, pembangunan, dan koordinasi dalam tata kelola global.",
  },
  "Pakta Pertahanan Atlantik Utara (NATO)": {
    description: "Aliansi pertahanan kolektif negara-negara anggota di kawasan Atlantik Utara dan Eropa.",
    focus: "Konsultasi keamanan dan pertahanan kolektif berdasarkan perjanjian aliansi.",
  },
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": {
    description: "Organisasi negara-negara pengekspor minyak yang mengoordinasikan kebijakan perminyakan para anggotanya.",
    focus: "Koordinasi kebijakan minyak dan stabilitas pasar energi.",
  },
  "Kelompok Duapuluh (G20)": {
    description: "Forum kerja sama ekonomi internasional bagi ekonomi besar dan Uni Eropa serta Uni Afrika.",
    focus: "Koordinasi ekonomi global, stabilitas keuangan, dan pembangunan.",
  },
  "Kerja Sama Ekonomi Asia-Pasifik (APEC)": {
    description: "Forum ekonomi regional yang mendorong perdagangan dan kemakmuran di kawasan Asia-Pasifik.",
    focus: "Fasilitasi perdagangan, investasi, dan integrasi ekonomi kawasan.",
  },
  "Organisasi Kerja Sama Shanghai (SCO)": {
    description: "Organisasi regional yang mengembangkan kerja sama keamanan dan hubungan antarnegara anggotanya.",
    focus: "Keamanan kawasan, penanggulangan ancaman lintas batas, serta kerja sama ekonomi.",
  },
  "Organisasi Negara-Negara Amerika (OAS)": {
    description: "Organisasi regional negara-negara di benua Amerika untuk mendukung kerja sama dan tata kelola demokratis.",
    focus: "Demokrasi, hak asasi manusia, keamanan, dan pembangunan di kawasan Amerika.",
  },
  "Dewan Kerja Sama Teluk (GCC)": {
    description: "Organisasi regional yang memperkuat koordinasi di antara negara-negara anggota kawasan Teluk.",
    focus: "Kerja sama ekonomi, sosial, dan keamanan kawasan.",
  },
  "Pasar Umum Selatan (MERCOSUR)": {
    description: "Proses integrasi regional Amerika Selatan yang mendorong perdagangan dan koordinasi antaranggota.",
    focus: "Perdagangan regional, integrasi ekonomi, dan kerja sama kebijakan.",
  },
  "Persemakmuran Bangsa-Bangsa (Commonwealth)": {
    description: "Asosiasi sukarela negara-negara berdaulat yang bekerja sama dalam isu bersama dan pembangunan.",
    focus: "Demokrasi, pembangunan, pendidikan, dan pertukaran antarnegara.",
  },
  "Kelompok Tujuh (G7)": {
    description: "Forum informal negara-negara industri maju untuk membahas isu ekonomi dan tantangan global.",
    focus: "Koordinasi kebijakan ekonomi dan pembahasan isu internasional.",
  },
  "Dialog Keamanan Kuadrilateral (QUAD)": {
    description: "Kemitraan diplomatik antara Australia, India, Jepang, dan Amerika Serikat di kawasan Indo-Pasifik.",
    focus: "Dialog strategis dan kerja sama praktis di kawasan Indo-Pasifik.",
  },
  "Organisasi Kerja Sama dan Pembangunan Ekonomi (OECD)": {
    description: "Organisasi internasional yang membantu pemerintah menyusun kebijakan untuk meningkatkan kesejahteraan dan peluang ekonomi.",
    focus: "Analisis kebijakan, standar internasional, dan praktik pembangunan ekonomi.",
  },
};

export default function OrgIntlInfoModal({
  isOpen,
  onClose,
  orgName,
  orgIcon: OrgIcon,
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

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="organization-info-title"
        className="flex max-h-[min(80vh,640px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] font-sans shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#00FFAA]/30 bg-[#0A1A1A] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-2 text-[#00FFAA]">
              <OrgIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00FFAA]">
                <Info className="h-3 w-3" />
                Informasi Organisasi
              </div>
              <h2 id="organization-info-title" className="text-sm font-bold leading-tight text-[#E0E0E0] sm:text-base">{orgName}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded-lg border border-[#00FFAA]/30 p-2 text-[#6B8A8A] transition-colors hover:border-[#00FFAA] hover:text-[#00FFAA]"
            aria-label="Tutup informasi"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-[#00FFAA]">Tentang organisasi</h3>
            <p className="text-sm leading-relaxed text-[#C3D5D5]">{info.description}</p>
          </section>
          <section className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-[#00FFAA]">Fokus kerja</h3>
            <p className="text-sm leading-relaxed text-[#C3D5D5]">{info.focus}</p>
          </section>
        </div>

        <footer className="flex justify-end border-t border-[#00FFAA]/20 bg-[#0A1A1A] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#00FFAA] px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#0A1A1A] transition-colors hover:bg-[#00C282]"
          >
            Mengerti
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
