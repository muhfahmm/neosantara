"use client"
import React, { useMemo } from "react";
import { Vote } from "lucide-react";
import { COUNTRIES_DATA } from "../../../../../map_system/map-data";
import { STATIC_PBB_VOTES } from "./staticVoteData";

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
  const countryVotes = useMemo<CountryVoteRow[]>(() => {
    const byName = new Map<string, string>();
    for (const country of COUNTRIES_DATA) {
      const normalized = normalizeName(country.country);
      if (normalized) {
        byName.set(normalized, country.iso?.toLowerCase() || "");
      }
    }

    return STATIC_PBB_VOTES
      .map((entry) => {
        const normalized = normalizeName(entry.name_id);
        const iso = byName.get(normalized);
        return {
          name_id: entry.name_id,
          iso,
          un_vote: entry.un_vote,
        } satisfies CountryVoteRow;
      })
      .filter((entry) => typeof entry.un_vote === "number")
      .sort((a, b) => (b.un_vote ?? 0) - (a.un_vote ?? 0));
  }, []);

  return (
    <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#00FFAA]/15 mb-4">
        <div className="flex items-center gap-3">
          <Vote className="h-5 w-5 text-[#00FFAA]" />
          <h4 className="text-sm font-black text-[#E0E0E0] uppercase tracking-wide">Suara Negara di Majelis Umum</h4>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
          {countryVotes.length} negara
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-[#051111] border-b border-[#00FFAA]/20 sticky top-0 z-10">
            <tr>
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap">Negara</th>
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap">Bendera</th>
              <th className="sticky top-0 z-10 bg-[#051111] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider whitespace-nowrap">Suara PBB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00FFAA]/10">
            {countryVotes.map((item, idx) => {
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
                  <td className={`px-3 py-2 font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>{item.name_id}</td>
                  <td className="px-3 py-2">{renderFlag(item.iso, item.name_id)}</td>
                  <td className={`px-3 py-2 font-bold ${isUserCountry ? 'text-[#00FFAA]' : 'text-[#6B8A8A]'}`}>{item.un_vote}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
