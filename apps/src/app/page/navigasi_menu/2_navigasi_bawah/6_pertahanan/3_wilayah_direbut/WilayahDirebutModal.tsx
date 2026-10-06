"use client"
import React, { useEffect, useState } from "react";
import { X, Shield, Globe2, MapPin } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: Record<string, unknown> | null;
  playerCountryName: string;
}

interface AnnexedCountry {
  name: string;
  iso?: string;
}

interface AnnexationRecord {
  attackerCountry?: string;
}

function getAnnexedCountries(playerCountryName: string): AnnexedCountry[] {
  if (typeof window === "undefined" || !playerCountryName.trim()) return [];

  const gameWindow = window as Window & {
    neosantara_annexed_countries?: Record<string, AnnexationRecord>;
  };
  const annexedStore = gameWindow.neosantara_annexed_countries ?? {};
  const normalizedPlayerCountry = playerCountryName.trim().toLocaleLowerCase();
  const annexedCountries = new Map<string, AnnexedCountry>();

  Object.entries(annexedStore).forEach(([targetKey, record]) => {
    if (record?.attackerCountry?.trim().toLocaleLowerCase() !== normalizedPlayerCountry) return;

    const targetCountry = COUNTRIES_DATA.find(
      country => country.country.trim().toLocaleLowerCase() === targetKey.trim().toLocaleLowerCase()
    );
    const name = targetCountry?.country || targetKey;
    annexedCountries.set(name.toLocaleLowerCase(), {
      name,
      iso: targetCountry?.iso
    });
  });

  return [...annexedCountries.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));
}

export default function WilayahDirebutModal({
  isOpen,
  onClose,
  countryDetail,
  playerCountryName
}: ModalProps) {
  const [annexedCountries, setAnnexedCountries] = useState<AnnexedCountry[]>(
    () => getAnnexedCountries(playerCountryName)
  );
  const countryDetailName = [
    countryDetail?.country,
    countryDetail?.nama_negara,
    countryDetail?.name_id,
    countryDetail?.name_en
  ].find((name): name is string => typeof name === "string");

  useEffect(() => {
    const updateAnnexedCountries = () => {
      setAnnexedCountries(getAnnexedCountries(playerCountryName));
    };
    updateAnnexedCountries();
    window.addEventListener("map_territory_color_updated", updateAnnexedCountries);
    return () => window.removeEventListener("map_territory_color_updated", updateAnnexedCountries);
  }, [playerCountryName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Wilayah yang Direbut</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                {playerCountryName || countryDetailName || "Negara"}
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

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] relative z-10">
          {annexedCountries.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
              <div className="p-5 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/20 mb-5">
                <Globe2 className="h-12 w-12 text-[#6B8A8A]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-[#E0E0E0]">
                Belum ada negara yang dianeksasi
              </h3>
              <p className="mt-2 max-w-md text-sm text-[#6B8A8A]">
                Negara yang berhasil direbut oleh {playerCountryName || "negara Anda"} akan ditampilkan di sini.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6B8A8A]">
                  Wilayah yang berada di bawah kendali {playerCountryName}
                </p>
                <span className="shrink-0 rounded-full border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-3 py-1 text-xs font-black text-[#00FFAA]">
                  {annexedCountries.length} Negara
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {annexedCountries.map(country => (
                  <div
                    key={country.name}
                    className="flex items-center gap-3 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4"
                  >
                    {country.iso ? (
                      <img
                        src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                        alt={`Bendera ${country.name}`}
                        className="h-6 w-9 rounded border border-[#00FFAA]/20 object-cover"
                      />
                    ) : (
                      <MapPin className="h-5 w-5 text-[#00FFAA]" />
                    )}
                    <span className="text-sm font-bold text-[#E0E0E0]">{country.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
