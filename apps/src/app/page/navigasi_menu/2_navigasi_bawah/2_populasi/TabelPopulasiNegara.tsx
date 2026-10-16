"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { calculateDailyPopulationChange } from "@/app/logic/populations_logic/population_logic";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";

interface CountryPopulationRow {
  id: number;
  country_slug: string;
  name_id: string;
  name_en: string;
  jumlah_penduduk: number;
  perubahan_harian: number;
}

const getDailyChange = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function TabelPopulasiNegara() {
  const [countries, setCountries] = useState<CountryPopulationRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadCountries = async () => {
      setLoading(true);
      setError(null);
      try {
        const [countryResponse, metadataResponse] = await Promise.all([
          fetch("/api/country-data?all=true", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/building-metadata", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);
        if (!countryResponse.ok) {
          throw new Error(`Permintaan data negara gagal (HTTP ${countryResponse.status}).`);
        }

        const [rows, metadata] = await Promise.all([
          countryResponse.json() as Promise<unknown>,
          metadataResponse.ok ? metadataResponse.json() : Promise.resolve({}),
        ]);
        if (!Array.isArray(rows)) {
          throw new Error("Format data populasi negara tidak valid.");
        }

        const gameDate = getCurrentGameDateString();
        const validRows = rows
          .filter((row): row is Record<string, unknown> =>
            row !== null &&
            typeof row === "object" &&
            typeof row.name_id === "string",
          )
          .map((row, index): CountryPopulationRow | null => {
            const country = applyNpcCountrySimulationState(row);
            const population = Number(
              country.jumlah_penduduk ?? country.populasi,
            );
            if (!Number.isFinite(population) || population < 0) return null;

            const countryName = String(
              country.name_id ??
              country.nama_negara ??
              country.name_en ??
              country.country ??
              "Negara tidak diketahui",
            );
            const dailyChange = calculateDailyPopulationChange(
              { ...country, jumlah_penduduk: population },
              countryName,
              metadata,
              gameDate,
            ).netDailyChange;

            return {
              id: Number(country.id) || index + 1,
              country_slug: String(country.country_slug ?? countryName),
              name_id: countryName,
              name_en: String(country.name_en ?? ""),
              jumlah_penduduk: population,
              perubahan_harian: dailyChange,
            };
          })
          .filter((row): row is CountryPopulationRow => row !== null)
          .sort((a, b) =>
            getDailyChange(b.perubahan_harian) -
            getDailyChange(a.perubahan_harian),
          );

        if (validRows.length === 0) {
          throw new Error("Data perubahan populasi negara belum tersedia.");
        }
        setCountries(validRows);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        console.error("Gagal memuat tabel populasi negara:", cause);
        setError(
          cause instanceof Error
            ? cause.message
            : "Terjadi kesalahan saat memuat data populasi.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadCountries();
    return () => controller.abort();
  }, []);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    if (!query) return countries;
    return countries.filter((country) =>
      `${country.name_id} ${country.name_en} ${country.country_slug}`
        .toLocaleLowerCase("id-ID")
        .includes(query),
    );
  }, [countries, search]);

  return (
    <section
      aria-label="Tabel populasi negara"
      className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-3.5 lg:p-4.5 2xl:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00FFAA] lg:text-sm">
            <Users className="h-4 w-4" />
            Populasi Negara
          </h3>
          <p className="mt-1 text-[9px] text-[#6B8A8A] lg:text-[10px]">
            {loading
              ? "Memuat data negara..."
              : `${countries.length} negara · urut dari pertumbuhan harian tertinggi`}
          </p>
        </div>
        <label className="flex min-w-[170px] items-center gap-2 rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] px-2.5 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#6B8A8A]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari negara..."
            aria-label="Cari negara"
            className="w-full bg-transparent text-xs text-[#E0E0E0] outline-none placeholder:text-[#6B8A8A]"
          />
        </label>
      </div>

      {loading && (
        <p className="mt-4 text-xs text-[#6B8A8A]" role="status">
          Sedang mengambil data populasi...
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-3 max-h-[50vh] overflow-auto rounded-lg border border-[#00FFAA]/15">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#0A1A1A]">
              <tr className="text-[9px] font-black uppercase tracking-wider text-[#6B8A8A]">
                <th scope="col" className="px-3 py-2.5">No.</th>
                <th scope="col" className="px-3 py-2.5">Negara</th>
                <th scope="col" className="px-3 py-2.5 text-right">Pertumbuhan / hari</th>
                <th scope="col" className="px-3 py-2.5 text-right">Estimasi / bulan</th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((country, index) => (
                (() => {
                  const dailyChange = getDailyChange(country.perubahan_harian);
                  const monthlyChange = dailyChange * 30;
                  const changeColor =
                    dailyChange < 0 ? "text-rose-400" : "text-[#00FFAA]";

                  return (
                    <tr
                      key={country.id ?? country.country_slug}
                      className="border-t border-[#00FFAA]/10 text-xs odd:bg-[#0F2424] even:bg-[#0A1A1A]/50"
                    >
                      <td className="px-3 py-2 text-[#6B8A8A]">{index + 1}</td>
                      <td className="px-3 py-2 font-semibold text-[#E0E0E0]">
                        {country.name_id}
                        {country.name_en && country.name_en !== country.name_id && (
                          <span className="ml-1.5 text-[10px] font-normal text-[#6B8A8A]">
                            ({country.name_en})
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-2 text-right font-black tabular-nums ${changeColor}`}>
                        {dailyChange > 0 ? "+" : ""}
                        {dailyChange.toLocaleString("id-ID")} jiwa
                      </td>
                      <td className={`px-3 py-2 text-right font-black tabular-nums ${changeColor}`}>
                        {monthlyChange > 0 ? "+" : ""}
                        {monthlyChange.toLocaleString("id-ID")} jiwa
                      </td>
                    </tr>
                  );
                })()
              ))}
              {filteredCountries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-xs text-[#6B8A8A]">
                    Tidak ada negara yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
