"use client"
import React, { useState, useMemo } from "react";
import { X, Globe, Shield, HeartPulse, BookOpen, ArrowRightLeft, Users, Sprout, Plane, Ship, Wifi, Cloud, Landmark, Flag, Star, Handshake, BarChart, Crown, TrendingUp } from "lucide-react";
import OrganisasiPBBModal from "./1_organisasi_PBB/organisasiPBBmodal";
import OrganisasiRegional from "./2_organisasi_regional/organisasiRegional";
import { getOrgMembers } from "@/../../json/database_organisasi_internasional";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: any;
  onOpenCountryDetail?: (countryName: string) => void;
  onOpenPlayerDetail?: () => void;
}

const orgIconMap: Record<string, React.ElementType> = {
  "Interpol": Shield,
  "Organisasi Kesehatan Dunia (WHO)": HeartPulse,
  "UNESCO": BookOpen,
  "Organisasi Perdagangan Dunia (WTO)": ArrowRightLeft,
  "Organisasi Buruh Internasional (ILO)": Users,
  "Organisasi Pangan dan Pertanian (FAO)": Sprout,
  "Organisasi Penerbangan Sipil Internasional (ICAO)": Plane,
  "Organisasi Maritim Internasional (IMO)": Ship,
  "Organisasi Telekomunikasi Internasional (ITU)": Wifi,
  "Organisasi Meteorologi Dunia (WMO)": Cloud,
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": Landmark,
  "Uni Eropa (EU)": Flag,
  "Liga Arab": Flag,
  "Uni Afrika (AU)": Globe,
  "Organisasi Kerja Sama Islam (OKI)": Star,
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": Handshake,
  "Pakta Pertahanan Atlantik Utara (NATO)": Shield,
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": BarChart,
  "Kelompok Duapuluh (G20)": Users,
  "Kerja Sama Ekonomi Asia-Pasifik (APEC)": Globe,
  "Organisasi Kerja Sama Shanghai (SCO)": Shield,
  "Organisasi Negara-Negara Amerika (OAS)": Globe,
  "Dewan Kerja Sama Teluk (GCC)": Landmark,
  "Pasar Umum Selatan (MERCOSUR)": Globe,
  "Persemakmuran Bangsa-Bangsa (Commonwealth)": Crown,
  "Kelompok Tujuh (G7)": Star,
  "Dialog Keamanan Kuadrilateral (QUAD)": Shield,
  "Organisasi Kerja Sama dan Pembangunan Ekonomi (OECD)": TrendingUp,
};

export default function OrgIntlModal({ isOpen, onClose, selectedCountry, onOpenCountryDetail, onOpenPlayerDetail }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"pbb" | "regional">("pbb");
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);
  const [selectedOrgIcon, setSelectedOrgIcon] = useState<React.ElementType | null>(null);

  if (!isOpen) return null;

  const playerCountryName = selectedCountry?.country || "Indonesia";

  const unOrganizations = [
    "Interpol", "Organisasi Kesehatan Dunia (WHO)", "UNESCO",
    "Organisasi Perdagangan Dunia (WTO)", "Organisasi Buruh Internasional (ILO)",
    "Organisasi Pangan dan Pertanian (FAO)", "Organisasi Penerbangan Sipil Internasional (ICAO)",
    "Organisasi Maritim Internasional (IMO)", "Organisasi Telekomunikasi Internasional (ITU)",
    "Organisasi Meteorologi Dunia (WMO)",
  ];

  const regionalOrganizations = [
    "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)", "Uni Eropa (EU)",
    "Liga Arab", "Uni Afrika (AU)", "Organisasi Kerja Sama Islam (OKI)",
    "BRICS (Brasil, Rusia, India, China, Afrika Selatan)",
    "Pakta Pertahanan Atlantik Utara (NATO)", "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)",
    "Kelompok Duapuluh (G20)", "Kerja Sama Ekonomi Asia-Pasifik (APEC)",
    "Organisasi Kerja Sama Shanghai (SCO)", "Organisasi Negara-Negara Amerika (OAS)",
    "Dewan Kerja Sama Teluk (GCC)", "Pasar Umum Selatan (MERCOSUR)",
    "Persemakmuran Bangsa-Bangsa (Commonwealth)", "Kelompok Tujuh (G7)",
    "Dialog Keamanan Kuadrilateral (QUAD)", "Organisasi Kerja Sama dan Pembangunan Ekonomi (OECD)",
  ];

  const membershipMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    const allOrgs = [...unOrganizations, ...regionalOrganizations];
    allOrgs.forEach((org) => {
      const members = getOrgMembers(org);
      map[org] = members.some(
        (m: any) => m.country?.toLowerCase().trim() === playerCountryName.toLowerCase().trim()
      );
    });
    return map;
  }, [playerCountryName]);

  const handleOrgClick = (orgName: string) => {
    const IconComponent = orgIconMap[orgName] || Globe;
    setSelectedOrgName(orgName);
    setSelectedOrgIcon(() => IconComponent);
    setIsChildModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        
        {/* HEADER UTAMA */}
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                <Globe className="h-6 w-6 text-[#5c3c10] animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Keanggotaan Blok Internasional</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY UTAMA */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <p className="text-xs text-[#8b7e66] font-semibold leading-relaxed mb-6">
            Negara Anda berpartisipasi aktif dalam berbagai pakta pertahanan militer multilateral serta kerja sama blok dagang bebas dunia. Pilih salah satu kategori di bawah untuk melihat daftar organisasinya.
          </p>

          <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex mb-6 shadow-sm">
            <button onClick={() => setActiveTab("pbb")} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "pbb" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>Organisasi PBB</button>
            <button onClick={() => setActiveTab("regional")} className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "regional" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>Organisasi Regional</button>
          </div>

          {activeTab === "pbb" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {unOrganizations.map((org, idx) => {
                const Icon = orgIconMap[org] || Globe;
                const isMember = membershipMap[org] || false;
                return (
                  <div
                    key={idx}
                    onClick={() => handleOrgClick(org)}
                    className={`bg-white/70 rounded-xl p-4 text-center shadow-sm hover:bg-[#e4dac3]/30 hover:border-[#5c3c10]/40 transition-all cursor-pointer flex flex-col items-center gap-2 ${isMember ? 'border-2 border-emerald-500' : 'border border-[#C4B49C]/30'}`}
                  >
                    <Icon className="h-6 w-6 text-[#5c3c10]" />
                    <span className="text-[10px] font-black text-[#5c3c10] uppercase tracking-tight leading-tight block">{org}</span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "regional" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {regionalOrganizations.map((org, idx) => {
                const Icon = orgIconMap[org] || Globe;
                const isMember = membershipMap[org] || false;
                return (
                  <div
                    key={idx}
                    onClick={() => handleOrgClick(org)}
                    className={`bg-white/70 rounded-xl p-4 text-center shadow-sm hover:bg-[#e4dac3]/30 hover:border-[#5c3c10]/40 transition-all cursor-pointer flex flex-col items-center gap-2 ${isMember ? 'border-2 border-emerald-500' : 'border border-[#C4B49C]/30'}`}
                  >
                    <Icon className="h-6 w-6 text-[#5c3c10]" />
                    <span className="text-[10px] font-black text-[#5c3c10] uppercase tracking-tight leading-tight block">{org}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PERBAIKAN: MODAL ANAK - Hapus bg-black/60 dan backdrop-blur-sm, ganti dengan bg-transparent */}
        {isChildModalOpen && selectedOrgName && selectedOrgIcon && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-transparent pointer-events-auto">
            <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-6xl h-[84vh] overflow-hidden shadow-2xl flex flex-col relative font-sans shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {activeTab === "pbb" ? (
                <OrganisasiPBBModal
                  orgName={selectedOrgName}
                  orgIcon={selectedOrgIcon}
                  selectedCountry={selectedCountry}
                  onClose={() => setIsChildModalOpen(false)}
                  onOpenCountryDetail={onOpenCountryDetail}
                  onOpenPlayerDetail={onOpenPlayerDetail}
                />
              ) : (
                <OrganisasiRegional
                  orgName={selectedOrgName}
                  orgIcon={selectedOrgIcon}
                  selectedCountry={selectedCountry}
                  onClose={() => setIsChildModalOpen(false)}
                  onOpenCountryDetail={onOpenCountryDetail}
                  onOpenPlayerDetail={onOpenPlayerDetail}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}