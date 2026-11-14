"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Info, Globe, Shield, HeartPulse, BookOpen, ArrowRightLeft, Users, Sprout, Ship, Wifi, Cloud, Landmark, Flag, Star, Handshake, BarChart, Crown, TrendingUp } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import OrganisasiPBBModal from "./1_organisasi_PBB/organisasiPBBmodal";
import OrganisasiRegional from "./2_organisasi_regional/organisasiRegional";
import OrgIntlInfoModal from "./OrgIntlInfoModal";
import MenuInfoButton from "../../MenuInfoButton";
import {
  getOrgMembers,
  ORGANIZATION_MEMBERSHIP_UPDATED_EVENT
} from "@/../../json/14_database_organisasi_internasional";

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

const orgImageMap: Record<string, string> = {
  "Interpol": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/interpol.svg",
  "Organisasi Kesehatan Dunia (WHO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-kesehatan-dunia-who.svg",
  "UNESCO": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/unesco.svg",
  "Organisasi Perdagangan Dunia (WTO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-perdagangan-dunia-wto.svg",
  "Organisasi Buruh Internasional (ILO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-buruh-internasional-ilo.svg",
  "Organisasi Pangan dan Pertanian (FAO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-pangan-pertanian-fao.svg",
  "Organisasi Maritim Internasional (IMO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-maritim-internasional-imo.svg",
  "Organisasi Telekomunikasi Internasional (ITU)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-telekomunikasi-internasional-itu.svg",
  "Organisasi Meteorologi Dunia (WMO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-pbb/organisasi-meteorologi-dunia-wmo.svg",
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/asean.svg",
  "Uni Eropa (EU)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/uni-eropa-eu.svg",
  "Liga Arab": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/liga-arab.svg",
  "Uni Afrika (AU)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/uni-afrika-au.svg",
  "Organisasi Kerja Sama Islam (OKI)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/organisasi-kerja-sama-islam-oki.svg",
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/brics.svg",
  "Pakta Pertahanan Atlantik Utara (NATO)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/nato.svg",
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/opec.svg",
  "Kelompok Duapuluh (G20)": "/images/game/interface/sub-tabs/geopolitik/organisasi-regional/g20.svg",
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
    <>
      {infoOrgName && (
        <OrgIntlInfoModal
          isOpen
          onClose={() => setInfoOrgName(null)}
          orgName={infoOrgName}
          orgIcon={orgIconMap[infoOrgName] || Globe}
          isMember={Boolean(membershipMap[infoOrgName])}
          countryDetail={countryDetail}
        />
      )}
      {!infoOrgName && <NotebookModalWrapper onClose={handleClose}>
      <div className="root-modal-util-b74379da23">
        
        <div className="satisfaction-modal-header root-modal-util-9462ce2345">
          <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
            <div className="root-modal-util-08dfbca033">
              <div className="root-modal-util-739d92b232">
                <Globe aria-hidden="true" className="root-modal-util-d252947d10 text-root-accent animate-pulse" />
              </div>
              <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                Keanggotaan Blok Internasional
              </h2>
            </div>
          </div>
          <div className="root-modal-util-08dfbca033">
            <MenuInfoButton
              title="Organisasi Internasional"
              description="Jelajahi organisasi PBB dan badan khusus serta organisasi regional. Buka tiap organisasi untuk melihat keanggotaan, informasi, dan peluang kerja sama yang tersedia bagi negara Anda."
            />
            <SharedModalCloseButton onClick={handleClose} />
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-root-surface relative z-10 neon-scrollbar">
          <div className="bg-root-canvas p-1 rounded-xl border border-root-accent/20 inline-flex mb-6 shadow-sm">
            <button
              onClick={() => setActiveTab("pbb")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "pbb"
                  ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20"
                  : "text-root-subtle hover:text-root-accent"
              }`}
            >
              Organisasi PBB & Badan Khusus
            </button>
            <button
              onClick={() => setActiveTab("regional")}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "regional"
                  ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20"
                  : "text-root-subtle hover:text-root-accent"
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
                    className={`group relative rounded-xl p-3 shadow-md transition-all ${isMember ? 'bg-root-accent/15 border-2 border-root-accent' : 'bg-root-canvas border border-root-accent/20'} hover:border-root-accent/60 hover:bg-root-accent/10`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOrgClick(org)}
                      className="flex min-h-[88px] w-full items-center gap-3 pr-7 text-left cursor-pointer"
                      aria-label={`Lihat keanggotaan ${org}`}
                    >
                      {orgImageMap[org] ? (
                        <Image src={orgImageMap[org]} alt="" aria-hidden="true" width={48} height={48} className="h-12 w-12 flex-shrink-0 object-contain" />
                      ) : (
                        <Icon className="h-6 w-6 flex-shrink-0 text-root-accent" />
                      )}
                      <span className="text-[10px] font-bold text-root-text uppercase tracking-tight leading-tight">{org}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInfoOrgName(org)}
                      className="absolute right-2 top-2 rounded-lg border border-root-accent/20 bg-root-surface p-1 text-root-subtle transition-all hover:border-root-accent hover:bg-root-accent/10 hover:text-root-accent cursor-pointer"
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
                    className={`group relative rounded-xl p-3 shadow-md transition-all ${isMember ? 'bg-root-accent/15 border-2 border-root-accent' : 'bg-root-canvas border border-root-accent/20'} hover:border-root-accent/60 hover:bg-root-accent/10`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOrgClick(org)}
                      className="flex min-h-[88px] w-full items-center gap-3 pr-7 text-left cursor-pointer"
                      aria-label={`Lihat keanggotaan ${org}`}
                    >
                      {orgImageMap[org] ? (
                        <Image src={orgImageMap[org]} alt="" aria-hidden="true" width={48} height={48} className="h-12 w-12 flex-shrink-0 object-contain" />
                      ) : (
                        <Icon className="h-6 w-6 flex-shrink-0 text-root-accent" />
                      )}
                      <span className="text-[10px] font-bold text-root-text uppercase tracking-tight leading-tight">{org}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInfoOrgName(org)}
                      className="absolute right-2 top-2 rounded-lg border border-root-accent/20 bg-root-surface p-1 text-root-subtle transition-all hover:border-root-accent hover:bg-root-accent/10 hover:text-root-accent cursor-pointer"
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
          <div className="absolute inset-0 z-30 bg-root-surface flex flex-col rounded-2xl overflow-hidden pointer-events-auto">
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
    </NotebookModalWrapper>}
    </>
  );
}