"use client"
import React, { useEffect, useState } from "react";
import { X, Loader2, User, ChevronRight } from "lucide-react";
import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

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

export default function OrganisasiRegional({ orgName, orgIcon: Icon, selectedCountry, onClose, onOpenCountryDetail, onOpenPlayerDetail }: OrganisasiRegionalProps) {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="w-6 h-4 rounded-sm overflow-hidden border border-[#00FFAA]/20 flex-shrink-0 shadow-sm bg-[#051111] relative">
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
    const data = getOrgMembers(orgName);
    setMembers(data);
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
    <div className="w-full h-full flex flex-col bg-[#0F2424]">
      {/* HEADER */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && (
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
          )}
          <div>
            <h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
              {orgName}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
              Organisasi PBB
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
        >
          <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* BODY - Daftar Negara Anggota */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] custom-scrollbar">
        <div className="w-full bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-[#00FFAA]/20 pb-2">
            <h4 className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
              Daftar Negara Anggota ({members.length} Negara)
            </h4>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-[#00FFAA]/60 font-bold">
              <Loader2 className="h-5 w-5 animate-spin text-[#00FFAA]" />
              Memuat data anggota...
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center text-[#00FFAA]/60 font-medium">
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
                        ? 'bg-[#00FFAA]/20 border-2 border-[#00FFAA] text-[#00FFAA]'
                        : 'bg-[#0F2424]/80 border-[#00FFAA]/20 hover:border-[#00FFAA]/60 text-[#00FFAA]'
                    }`}
                    onClick={() => handleOpenDetail(member.country, isPlayer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderFlag(member.iso || getIsoFromName(member.country), member.country)}
                        <span className={`text-sm font-bold ${isPlayer ? 'text-[#00FFAA]' : 'text-[#00FFAA]/90'}`}>
                          {member.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPlayer && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00FFAA] text-[#0A1A1A] text-[9px] font-black uppercase tracking-wider shadow-sm">
                            <User className="w-3 h-3" />
                            ANDA
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#00FFAA]/40 group-hover:text-[#00FFAA] transition-colors" />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider self-start px-2 py-0.5 rounded-full ${
                      member.status === 'Anggota Tetap' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      member.status === 'Anggota' ? 'bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30' :
                      'bg-[#00FFAA]/5 text-[#00FFAA]/60 border border-[#00FFAA]/20'
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
    </div>
  );
}