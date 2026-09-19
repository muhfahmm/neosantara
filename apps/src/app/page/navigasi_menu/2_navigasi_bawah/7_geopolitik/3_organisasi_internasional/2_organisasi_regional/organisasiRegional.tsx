"use client"
import React, { useEffect, useState } from "react";
import { X, Loader2, User, ChevronRight } from "lucide-react";
import { getOrgMembers } from "@/../../json/database_organisasi_internasional";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

interface OrganisasiPBBModalProps {
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

export default function OrganisasiPBBModal({ orgName, orgIcon: Icon, selectedCountry, onClose, onOpenCountryDetail, onOpenPlayerDetail }: OrganisasiPBBModalProps) {
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
      <div className="w-6 h-4 rounded-sm overflow-hidden border border-[#5c3c10]/20 flex-shrink-0 shadow-sm bg-[#e4dac3] relative">
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
    <div className="w-full h-full flex flex-col bg-[#FAF6EE]">
      {/* HEADER */}
      <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] flex-shrink-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-1.5 bg-[#5c3c10]/10 rounded-lg border border-[#5c3c10]/20">
              <Icon className="h-7 w-7 text-[#5c3c10]" />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-[#5c3c10] uppercase tracking-tight">
              {orgName}
            </h3>
            <p className="text-xs text-[#8b7e66] font-semibold mt-1">
              Organisasi PBB
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
        >
          <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* BODY - Daftar Negara Anggota */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40">
        <div className="max-w-4xl mx-auto bg-white/70 border border-[#C4B49C]/30 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-[#C4B49C]/20 pb-2">
            <h4 className="text-xs font-black text-[#5c3c10] uppercase tracking-wider">
              Daftar Negara Anggota ({members.length} Negara)
            </h4>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-[#8b7e66] font-bold">
              <Loader2 className="h-5 w-5 animate-spin" />
              Memuat data anggota...
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center text-[#8b7e66] font-bold">
              Belum ada data anggota yang ditemukan untuk organisasi ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((member, idx) => {
                const isPlayer = member.country?.toLowerCase().trim() === playerCountryName.toLowerCase().trim();
                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 flex flex-col gap-1 shadow-sm border-2 cursor-pointer transition-all hover:bg-[#e4dac3]/20 ${
                      isPlayer
                        ? 'bg-emerald-50/70 border-emerald-500'
                        : 'bg-[#FAF6EE]/80 border border-[#C4B49C]/30'
                    }`}
                    onClick={() => handleOpenDetail(member.country, isPlayer)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderFlag(member.iso || getIsoFromName(member.country), member.country)}
                        <span className={`text-sm font-black ${isPlayer ? 'text-emerald-800' : 'text-[#5c3c10]'}`}>
                          {member.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPlayer && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                            <User className="w-3 h-3" />
                            ANDA
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#C4B49C] group-hover:text-[#5c3c10] transition-colors" />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider self-start px-2 py-0.5 rounded-full ${
                      member.status === 'Anggota Tetap' ? 'bg-amber-600/10 text-amber-700 border border-amber-600/20' :
                      member.status === 'Anggota' ? 'bg-emerald-600/10 text-emerald-700 border border-emerald-600/20' :
                      'bg-[#5c3c10]/10 text-[#5c3c10] border border-[#5c3c10]/15'
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