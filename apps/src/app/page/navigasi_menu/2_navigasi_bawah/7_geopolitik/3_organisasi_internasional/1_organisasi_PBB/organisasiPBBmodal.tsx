"use client"
import React, { useEffect, useState } from "react";
import { X, Loader2, User, ChevronRight, Send, Clock, Check } from "lucide-react";
import { getOrgMembers } from "@/../../json/14_database_organisasi_internasional";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import PermohonanKeanggotaanModal from "../PermohonanKeanggotaanModal";
import { getApplicationForOrg, isUserJoinedOrg } from "../orgMembershipLogic";
import { getDaysElapsed, formatDate } from "@/app/logic/production_logic";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";

interface OrganisasiRegionalProps {
  orgName: string;
  orgIcon?: React.ElementType;
  selectedCountry?: any;
  onClose: () => void;
  onOpenCountryDetail?: (countryName: string) => void;
  onOpenPlayerDetail?: () => void;
}

interface MemberData {
  country: string;
  status: string;
  iso?: string;
}

const ORGANIZATION_BENEFITS: Record<string, string> = {
  "Interpol": "Tingkat Kejahatan Turun -5%",
  "Organisasi Kesehatan Dunia (WHO)": "Risiko Epidemi & Pandemi Turun -5%",
  "UNESCO": "Kecepatan Riset Sains +5%",
  "Organisasi Perdagangan Dunia (WTO)": "Harga Jual +15%, Harga Beli -10%",
  "Organisasi Buruh Internasional (ILO)": "Hasil Perikanan +10%",
  "Organisasi Pangan dan Pertanian (FAO)": "Produksi Pangan +10%",
  "Organisasi Telekomunikasi Internasional (ITU)": "Kecepatan Riset +5%",
  "Organisasi Meteorologi Dunia (WMO)": "Risiko Bencana Alam -5%",
  "Organisasi Maritim Internasional (IMO)": "Hasil Perikanan +10%",
};

export default function OrganisasiRegional({ orgName, orgIcon: Icon, selectedCountry, onClose, onOpenCountryDetail, onOpenPlayerDetail }: OrganisasiRegionalProps) {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPermohonanOpen, setIsPermohonanOpen] = useState(false);

  const playerCountryName = selectedCountry?.country || "";

  const getIsoFromName = (name: string) => {
    const found = COUNTRIES_DATA?.find(
      (c) => c.country?.toLowerCase().trim() === name?.toLowerCase().trim()
    );
    return found?.iso?.toLowerCase() || "";
  };

  const renderFlag = (iso: string | undefined, altName: string) => {
    if (!iso || iso.length !== 2) return null;
    return (
      <div className="w-6 h-4 rounded-sm overflow-hidden border border-root-accent/20 flex-shrink-0 shadow-sm bg-[#051111] relative">
        <img
          src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
          alt={altName}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  };

  useEffect(() => {
    setLoading(true);
    const data = getOrgMembers(orgName, playerCountryName);
    const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};
    const activeMembers = data.filter((m: MemberData) => {
      const raw = String(m.country || '').trim();
      const norm = raw.toLowerCase();
      const clean = norm.replace(/[^a-z0-9]/g, '');
      const iso = String(m.iso || getIsoFromName(raw) || '').toLowerCase().trim();

      if (annexedStore[raw] || annexedStore[norm] || (clean && annexedStore[clean])) return false;
      if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return false;
      return true;
    });
    setMembers(activeMembers);
    setLoading(false);
  }, [orgName]);

  const handleOpenDetail = (countryName: string, isPlayer: boolean) => {
    if (isPlayer) {
      if (onOpenPlayerDetail) onOpenPlayerDetail();
    } else {
      if (onOpenCountryDetail) onOpenCountryDetail(countryName);
    }
    onClose();
  };

  return (
    <div className="w-full h-full flex flex-col bg-root-surface">
      {/* HEADER */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && (
            <div className="p-1.5 sm:p-2 bg-root-surface rounded-xl border border-root-accent/30">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
          )}
          <div>
            <h3 className="text-base sm:text-xl font-bold text-root-accent tracking-tight leading-none uppercase">
              {orgName}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">
              Organisasi PBB
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
        >
          <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* BODY - Daftar Negara Anggota */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-root-surface custom-scrollbar">
        {ORGANIZATION_BENEFITS[orgName] && (() => {
          const app = getApplicationForOrg(playerCountryName, orgName);
          const currentDateStr = getCurrentGameDateString() || formatDate(new Date());
          const remainingDays = app ? Math.max(0, 30 - getDaysElapsed(app.submissionDate, currentDateStr)) : 30;

          return (
            <div className="mb-4 p-3.5 rounded-xl bg-[#0E2A20] border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold text-emerald-300 shadow-md">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Efek Keanggotaan Organisasi:</span>
                <span className="font-black text-emerald-400 text-sm">{ORGANIZATION_BENEFITS[orgName]}</span>
              </div>
              {(app?.status === "accepted" || isUserJoinedOrg(playerCountryName, orgName)) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[11px] uppercase tracking-wider shrink-0 shadow-sm">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Anggota Aktif</span>
                </span>
              ) : app?.status === "pending" ? (
                <button
                  onClick={() => setIsPermohonanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Clock className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                  <span>Peninjauan ({remainingDays} Hari)</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsPermohonanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-root-accent text-root-canvas hover:bg-root-accent/80 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim Permohonan</span>
                </button>
              )}
            </div>
          );
        })()}

        <div className="w-full bg-root-canvas border border-root-accent/20 rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-root-accent/20 pb-2">
            <h4 className="text-xs font-black text-root-accent uppercase tracking-wider">
              Daftar Negara Anggota ({members.length} Negara)
            </h4>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-root-accent/60 font-bold">
              <Loader2 className="h-5 w-5 animate-spin text-root-accent" />
              Memuat data anggota...
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center text-root-accent/60 font-medium">
              Belum ada data anggota yang ditemukan untuk organisasi ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((member, idx) => {
                const isPlayer = member.country?.toLowerCase().trim() === playerCountryName.toLowerCase().trim();
                return (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 flex flex-col gap-1 shadow-sm border cursor-pointer transition-all ${
                      isPlayer
                        ? 'bg-root-accent/20 border-2 border-root-accent text-root-accent'
                        : 'bg-root-surface/80 border-root-accent/20 hover:border-root-accent/60 text-root-accent'
                    }`}
                    onClick={() => handleOpenDetail(member.country, isPlayer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderFlag(member.iso || getIsoFromName(member.country), member.country)}
                        <span className={`text-sm font-bold ${isPlayer ? 'text-root-accent' : 'text-root-accent/90'}`}>
                          {member.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPlayer && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-root-accent text-root-canvas text-[9px] font-black uppercase tracking-wider shadow-sm">
                            <User className="w-3 h-3" />
                            ANDA
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-root-accent/40 group-hover:text-root-accent transition-colors" />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider self-start px-2 py-0.5 rounded-full ${
                      member.status === 'Anggota Tetap' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      member.status === 'Anggota' ? 'bg-root-accent/10 text-root-accent border border-root-accent/30' :
                      'bg-root-accent/5 text-root-accent/60 border border-root-accent/20'
                    }`}>
                      {member.status || 'Anggota'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <PermohonanKeanggotaanModal
        isOpen={isPermohonanOpen}
        onClose={() => setIsPermohonanOpen(false)}
        orgName={orgName}
        countryName={playerCountryName}
        orgIcon={Icon}
      />
    </div>
  );
}