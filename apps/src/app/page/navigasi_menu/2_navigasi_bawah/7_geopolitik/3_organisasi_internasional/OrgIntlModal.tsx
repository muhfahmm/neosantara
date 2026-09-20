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
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Globe className="h-6 w-6 text-[#00FFAA] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Keanggotaan Blok Internasional</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar">
          <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 shadow-sm">
            <button
              onClick={() => setActiveTab("pbb")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "pbb"
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                  : "text-[#6B8A8A] hover:text-[#00FFAA]"
              }`}
            >
              Organisasi PBB & Badan Khusus
            </button>
            <button
              onClick={() => setActiveTab("regional")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "regional"
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20"
                  : "text-[#6B8A8A] hover:text-[#00FFAA]"
              }`}
            >
              Organisasi Regional & Blok Ekonomi
            </button>
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
                    className={`rounded-xl p-4 text-center shadow-md hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/10 transition-all cursor-pointer flex flex-col items-center gap-2.5 ${isMember ? 'bg-[#00FFAA]/15 border-2 border-[#00FFAA]' : 'bg-[#0A1A1A] border border-[#00FFAA]/20'}`}
                  >
                    <Icon className="h-6 w-6 text-[#00FFAA]" />
                    <span className="text-[10px] font-bold text-[#E0E0E0] uppercase tracking-tight leading-tight block">{org}</span>
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
                    className={`rounded-xl p-4 text-center shadow-md hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/10 transition-all cursor-pointer flex flex-col items-center gap-2.5 ${isMember ? 'bg-[#00FFAA]/15 border-2 border-[#00FFAA]' : 'bg-[#0A1A1A] border border-[#00FFAA]/20'}`}
                  >
                    <Icon className="h-6 w-6 text-[#00FFAA]" />
                    <span className="text-[10px] font-bold text-[#E0E0E0] uppercase tracking-tight leading-tight block">{org}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL ANAK */}
        {isChildModalOpen && selectedOrgName && selectedOrgIcon && (
          <div className="absolute inset-0 z-30 bg-[#0F2424] flex flex-col rounded-2xl overflow-hidden pointer-events-auto">
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
        )}

      </div>
    </div>
  );
}