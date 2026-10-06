"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Vote, Search } from "lucide-react";
import { COUNTRIES_DATA } from "../../../../../map_system/map-data";
import { STATIC_PBB_VOTES } from "./staticVoteData";
import { fetchAllCountryProfilesFromDb, type CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles";
import { applyCatholicVoteBonus } from "../../../5_pembangunan/1_produksi/bonus_logic/agama_bonus_logic/katolik";

interface CountryVoteRow {
  name_id: string;
  iso?: string;
  un_vote: number;
}

const normalizeName = (value?: string) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
};

const renderFlag = (iso?: string, fallbackName?: string) => {
  if (!iso || iso.length !== 2) {
    return <span className="inline-block h-4 w-6 rounded-sm bg-slate-200 text-center text-[10px] leading-4">🏳️</span>;
  }

  const code = iso.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      alt={fallbackName || code}
      className="h-4 w-6 rounded-sm object-cover"
      onError={(event) => {
        const img = event.currentTarget as HTMLImageElement;
        img.src = "https://flagcdn.com/w20/un.png";
      }}
    />
  );
};

export default function SuaraPBB({ countryDetail }: { countryDetail?: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryProfiles, setCountryProfiles] = useState<CountryProfile[]>([]);

  useEffect(() => {
    let isCurrent = true;
    fetchAllCountryProfilesFromDb().then(profiles => {
      if (isCurrent) setCountryProfiles(profiles);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const countryVotes = useMemo<CountryVoteRow[]>(() => {
    const byName = new Map<string, string>();
    const religionByName = new Map<string, string>();
    for (const country of COUNTRIES_DATA) {
      const normalized = normalizeName(country.country);
      if (normalized) {
        byName.set(normalized, country.iso?.toLowerCase() || "");
      }
    }
    for (const profile of countryProfiles) {
      const normalized = normalizeName(profile.name_id);
      if (normalized) religionByName.set(normalized, profile.religion);
    }

    const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

    // Map awal dari STATIC_PBB_VOTES
    const baseVotes = new Map<string, CountryVoteRow>();
    STATIC_PBB_VOTES.forEach((entry) => {
      const norm = normalizeName(entry.name_id);
      const iso = byName.get(norm);
      const religion = religionByName.get(norm);
      baseVotes.set(entry.name_id, {
        name_id: entry.name_id,
        iso,
        un_vote: applyCatholicVoteBonus(entry.un_vote, religion),
      });
    });

    // Proses pengalihan & penjumlahan suara untuk negara yang dianeksasi
    // annexedStore format: { [targetCountryName]: { attackerCountry: string } }
    const annexedTargets = new Set<string>();

    Object.entries(annexedStore).forEach(([targetKey, data]: [string, any]) => {
      if (!data || !data.attackerCountry) return;
      
      // Temukan nama asli penyerang dan target
      const targetNorm = normalizeName(targetKey);
      const attackerName = data.attackerCountry;
      const attackerNorm = normalizeName(attackerName);

      // Cari entry target di baseVotes
      let foundTargetKey: string | null = null;
      let targetVoteVal = 0;

      for (const [key, val] of baseVotes.entries()) {
        if (normalizeName(key) === targetNorm || (val.iso && val.iso.toLowerCase() === targetNorm)) {
          foundTargetKey = key;
          targetVoteVal = val.un_vote;
          break;
        }
      }

      if (foundTargetKey && !annexedTargets.has(foundTargetKey)) {
        annexedTargets.add(foundTargetKey);

        // Tambahkan suara target ke penyerang
        let foundAttackerKey: string | null = null;
        for (const [key] of baseVotes.entries()) {
          if (normalizeName(key) === attackerNorm) {
            foundAttackerKey = key;
            break;
          }
        }

        if (foundAttackerKey) {
          const attackerEntry = baseVotes.get(foundAttackerKey)!;
          baseVotes.set(foundAttackerKey, {
            ...attackerEntry,
            un_vote: attackerEntry.un_vote + targetVoteVal
          });
        }
      }
    });

    // Filter out target yang sudah dianeksasi
    return Array.from(baseVotes.values())
      .filter((entry) => !annexedTargets.has(entry.name_id))
      .sort((a, b) => (b.un_vote ?? 0) - (a.un_vote ?? 0));
  }, [countryProfiles]);

  const filteredVotes = useMemo(() => {
    if (!searchQuery.trim()) return countryVotes;
    const q = searchQuery.toLowerCase().trim();
    return countryVotes.filter(item => 
      item.name_id.toLowerCase().includes(q)
    );
  }, [countryVotes, searchQuery]);

  return (
    <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#00FFAA]/15 mb-4">
        <div className="flex items-center gap-3">
          <Vote className="h-5 w-5 text-[#00FFAA]" />
          <h4 className="text-sm font-black text-[#E0E0E0] uppercase tracking-wide">Suara Negara di Majelis Umum</h4>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00FFAA]/60" />
            <input
              type="text"
              placeholder="Cari negara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#051111] border border-[#00FFAA]/30 rounded-lg pl-8 pr-3 py-1 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-colors"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A] whitespace-nowrap">
            {filteredVotes.length} negara
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-[#051111] border-b border-[#00FFAA]/20 sticky top-0 z-10">
            <tr>
              {/* ✅ KOLOM NOMOR BARU */}
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-center text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap w-12">No</th>
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap">Negara</th>
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap">Bendera</th>
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap">Suara PBB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00FFAA]/10">
            {filteredVotes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-[#6B8A8A]">
                  Tidak ada negara yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredVotes.map((item, idx) => {
                const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
                const isUserCountry = item.name_id.toLowerCase().trim() === selectedCountryName.toLowerCase().trim();
                
                return (
                  <tr 
                    key={`${item.name_id}-${idx}`} 
                    className={`transition-colors ${
                      isUserCountry
                        ? 'bg-[#00FFAA]/15 hover:bg-[#00FFAA]/25 border-l-4 border-l-[#00FFAA]'
                        : 'hover:bg-[#00FFAA]/5'
                    }`}
                  >
                    {/* ✅ NOMOR URUT DENGAN BADGE */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[24px] h-[20px] px-1.5 rounded-md font-black text-[10px] sm:text-[11px] ${
                          isUserCountry
                            ? 'bg-[#00FFAA] text-[#0A1A1A]'
                            : idx < 3
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : 'bg-[#0F2424] text-[#6B8A8A] border border-[#00FFAA]/20'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className={`px-3 py-2 font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>{item.name_id}</td>
                    <td className="px-3 py-2">{renderFlag(item.iso, item.name_id)}</td>
                    <td className={`px-3 py-2 font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#6B8A8A]'}`}>{item.un_vote}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}