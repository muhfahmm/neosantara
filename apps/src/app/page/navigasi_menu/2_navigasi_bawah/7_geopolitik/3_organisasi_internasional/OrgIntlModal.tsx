"use client"
import React, { useState, useEffect } from "react";
import { X, Info, Globe, Shield, HeartPulse, BookOpen, ArrowRightLeft, Users, Sprout, Plane, Ship, Wifi, Cloud, Landmark, Flag, Star, Handshake, BarChart, Crown, TrendingUp } from "lucide-react";
import OrganisasiPBBModal from "./1_organisasi_PBB/organisasiPBBmodal";
import OrganisasiRegional from "./2_organisasi_regional/organisasiRegional";
import OrgIntlInfoModal from "./OrgIntlInfoModal";
import {
  getOrgMembers,
  ORGANIZATION_MEMBERSHIP_UPDATED_EVENT
} from "@/../../json/database_organisasi_internasional";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: { country?: string | null } | null;
  countryDetail?: Record<string, unknown> | null;
  onOpenCountryDetail?: (countryName: string) => void;
  onOpenPlayerDetail?: () => void;
}

const UN_ORGANIZATIONS = [
  "Interpol", "Organisasi Kesehatan Dunia (WHO)", "UNESCO",
  "Organisasi Perdagangan Dunia (WTO)", "Organisasi Buruh Internasional (ILO)",
  "Organisasi Pangan dan Pertanian (FAO)",
  "Organisasi Maritim Internasional (IMO)", "Organisasi Telekomunikasi Internasional (ITU)",
  "Organisasi Meteorologi Dunia (WMO)",
];

const REGIONAL_ORGANIZATIONS = [
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)", "Uni Eropa (EU)",
  "Liga Arab", "Uni Afrika (AU)", "Organisasi Kerja Sama Islam (OKI)",
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)",
  "Pakta Pertahanan Atlantik Utara (NATO)", "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)",
  "Kelompok Duapuluh (G20)",
];

const orgIconMap: Record<string, React.ElementType> = {
  "Interpol": Shield,
  "Organisasi Kesehatan Dunia (WHO)": HeartPulse,
  "UNESCO": BookOpen,
  "Organisasi Perdagangan Dunia (WTO)": ArrowRightLeft,
  "Organisasi Buruh Internasional (ILO)": Users,
  "Organisasi Pangan dan Pertanian (FAO)": Sprout,
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

export default function OrgIntlModal({ isOpen, onClose, selectedCountry, countryDetail, onOpenCountryDetail, onOpenPlayerDetail }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"pbb" | "regional">("pbb");
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [selectedOrgName, setSelectedOrgName] = useState<string | null>(null);
  const [selectedOrgIcon, setSelectedOrgIcon] = useState<React.ElementType | null>(null);
  const [infoOrgName, setInfoOrgName] = useState<string | null>(null);
  const [, setMembershipVersion] = useState(0);

  useEffect(() => {
    const refreshMembership = () => setMembershipVersion(version => version + 1);
    window.addEventListener(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT, refreshMembership);
    return () => window.removeEventListener(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT, refreshMembership);
  }, []);

  const playerCountryName = selectedCountry?.country || "Indonesia";

  const membershipMap: Record<string, boolean> = {};
  [...UN_ORGANIZATIONS, ...REGIONAL_ORGANIZATIONS].forEach((org) => {
    const members = getOrgMembers(org, playerCountryName);
    membershipMap[org] = members.some(
      (member: { country?: string }) => member.country?.toLowerCase().trim() === playerCountryName.toLowerCase().trim()
    );
  });

  if (!isOpen) return null;

  const handleOrgClick = (orgName: string) => {
    const IconComponent = orgIconMap[orgName] || Globe;
    setSelectedOrgName(orgName);
    setSelectedOrgIcon(() => IconComponent);
    setIsChildModalOpen(true);
  };

  const handleClose = () => {
    setInfoOrgName(null);
    setIsChildModalOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <OrgIntlInfoModal
          isOpen={Boolean(infoOrgName)}
          onClose={() => setInfoOrgName(null)}
          orgName={infoOrgName || ""}
          orgIcon={infoOrgName ? orgIconMap[infoOrgName] || Globe : Globe}
          isMember={Boolean(infoOrgName && membershipMap[infoOrgName])}
          countryDetail={countryDetail}
        />
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA] animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Keanggotaan Blok Internasional</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">{playerCountryName}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {UN_ORGANIZATIONS.map((org) => {
                const Icon = orgIconMap[org] || Globe;
                const isMember = membershipMap[org] || false;
                return (
                  <div
                    key={org}
                    className={`group relative rounded-xl p-3 shadow-md transition-all ${isMember ? 'bg-[#00FFAA]/15 border-2 border-[#00FFAA]' : 'bg-[#0A1A1A] border border-[#00FFAA]/20'} hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/10`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOrgClick(org)}
                      className="flex min-h-[72px] w-full items-center gap-3 pr-7 text-left cursor-pointer"
                      aria-label={`Lihat keanggotaan ${org}`}
                    >
                      <Icon className="h-6 w-6 flex-shrink-0 text-[#00FFAA]" />
                      <span className="text-[10px] font-bold text-[#E0E0E0] uppercase tracking-tight leading-tight">{org}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInfoOrgName(org)}
                      className="absolute right-2 top-2 rounded-lg border border-[#00FFAA]/20 bg-[#051111] p-1 text-[#6B8A8A] transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 hover:text-[#00FFAA] cursor-pointer"
                      aria-label={`Informasi ${org}`}
                      title={`Informasi ${org}`}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "regional" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {REGIONAL_ORGANIZATIONS.map((org) => {
                const Icon = orgIconMap[org] || Globe;
                const isMember = membershipMap[org] || false;
                return (
                  <div
                    key={org}
                    className={`group relative rounded-xl p-3 shadow-md transition-all ${isMember ? 'bg-[#00FFAA]/15 border-2 border-[#00FFAA]' : 'bg-[#0A1A1A] border border-[#00FFAA]/20'} hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/10`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOrgClick(org)}
                      className="flex min-h-[72px] w-full items-center gap-3 pr-7 text-left cursor-pointer"
                      aria-label={`Lihat keanggotaan ${org}`}
                    >
                      <Icon className="h-6 w-6 flex-shrink-0 text-[#00FFAA]" />
                      <span className="text-[10px] font-bold text-[#E0E0E0] uppercase tracking-tight leading-tight">{org}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInfoOrgName(org)}
                      className="absolute right-2 top-2 rounded-lg border border-[#00FFAA]/20 bg-[#051111] p-1 text-[#6B8A8A] transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 hover:text-[#00FFAA] cursor-pointer"
                      aria-label={`Informasi ${org}`}
                      title={`Informasi ${org}`}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
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