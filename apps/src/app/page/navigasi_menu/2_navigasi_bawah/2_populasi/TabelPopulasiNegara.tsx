"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { calculateDailyPopulationChange } from "@/app/logic/populations_logic/population_logic";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";

import { NPC_COUNTRY_SIMULATION_UPDATED_EVENT } from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";

interface CountryPopulationRow {
  id: number;
  country_slug: string;
  name_id: string;
  name_en: string;
  jumlah_penduduk: number;
  perubahan_harian: number;
}

interface TabelPopulasiNegaraProps {
  userCountryDetail?: Record<string, any>;
  currentDate?: Date | string;
}

const getDailyChange = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function TabelPopulasiNegara({
  userCountryDetail,
  currentDate,
}: TabelPopulasiNegaraProps = {}) {
  const [rawCountries, setRawCountries] = useState<Record<string, unknown>[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dengarkan event simulasi NPC dan tanggal agar tabel langsung terupdate seketika
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    if (typeof window !== "undefined") {
      window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, handleUpdate);
      return () => {
        window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, handleUpdate);
      };
    }
  }, []);

  // Ambil data dasar negara dan metadata hanya sekali saat mount
  useEffect(() => {
    const controller = new AbortController();

    const loadInitialData = async () => {
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

        const [rows, meta] = await Promise.all([
          countryResponse.json() as Promise<unknown>,
          metadataResponse.ok ? metadataResponse.json() : Promise.resolve({}),
        ]);
        if (!Array.isArray(rows)) {
          throw new Error("Format data populasi negara tidak valid.");
        }

        const validRows = rows.filter(
          (row): row is Record<string, unknown> =>
            row !== null && typeof row === "object" && typeof row.name_id === "string",
        );

        setRawCountries(validRows);
        setMetadata(meta && typeof meta === "object" ? meta : {});
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        console.error("Gagal memuat data awal populasi negara:", cause);
        setError(
          cause instanceof Error
            ? cause.message
            : "Terjadi kesalahan saat memuat data populasi.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadInitialData();
    return () => controller.abort();
  }, []);

  // Hitung ulang baris secara instan di memori (O(N) cepat tanpa fetch ulang API & tanpa spinner)
  // setiap kali tanggal berjalan, simulasi NPC terupdate, atau user mengubah kebijakan
  const countries = useMemo<CountryPopulationRow[]>(() => {
    if (rawCountries.length === 0) return [];

    const gameDate = currentDate
      ? (currentDate instanceof Date ? currentDate.toISOString().slice(0, 10) : String(currentDate).slice(0, 10))
      : getCurrentGameDateString();

    const userSlug = String(
      userCountryDetail?.country_slug ||
      userCountryDetail?.slug ||
      userCountryDetail?.country ||
      ""
    ).toLowerCase();

    return rawCountries
      .map((row, index): CountryPopulationRow | null => {
        const rawSlug = String(row.country_slug ?? row.slug ?? "").toLowerCase();
        const rawName = String(row.name_id ?? row.nama_negara ?? row.country ?? "").toLowerCase();
        const isUser = Boolean(
          userCountryDetail &&
          (rawSlug === userSlug || rawName === userSlug || (row.is_user as boolean) === true)
        );

        // Jika user country, gunakan data terbaru yang live dari state user
        const countrySource = isUser ? { ...row, ...userCountryDetail, is_user: true } : row;
        const country = isUser ? countrySource : applyNpcCountrySimulationState(countrySource);

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
  }, [rawCountries, metadata, currentDate, userCountryDetail, refreshTrigger]);

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
      className={`${rootBorderRadius.card} border border-root-accent/20 bg-root-surface p-3.5 lg:p-4.5 2xl:p-6`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`${rootModalTypography.sectionTitle} flex items-center gap-2`}>
            <Users className="h-4 w-4" />
            Populasi Negara
          </h3>
          <p className={`${rootModalTypography.muted} mt-1 text-[9px] lg:text-[10px]`}>
            {loading
              ? "Memuat data negara..."
              : `${countries.length} negara · urut dari pertumbuhan harian tertinggi`}
          </p>
        </div>
        <label className="flex min-w-[170px] items-center gap-2 rounded-lg border border-root-accent/20 bg-root-canvas px-2.5 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-root-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari negara..."
            aria-label="Cari negara"
            className="w-full bg-transparent text-xs text-root-text outline-none placeholder:text-root-muted"
          />
        </label>
      </div>

      {loading && (
        <p className={`${rootModalTypography.muted} mt-4 text-xs`} role="status">
          Sedang mengambil data populasi...
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className={`mt-3 max-h-[50vh] overflow-auto ${rootBorderRadius.card} border border-root-accent/15`}>
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-root-canvas">
              <tr className={`${rootModalTypography.label} text-left`}>
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
                  const changeColor = rootModalTypography.value;

                  return (
                    <tr
                      key={country.id ?? country.country_slug}
                      className="border-t border-root-accent/10 text-xs odd:bg-root-surface even:bg-root-canvas/50"
                    >
                      <td className="px-3 py-2 text-root-subtle">{index + 1}</td>
                      <td className="px-3 py-2 font-semibold text-root-text">
                        {country.name_id}
                        {country.name_en && country.name_en !== country.name_id && (
                          <span className="ml-1.5 text-[10px] font-normal text-root-subtle">
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
                  <td colSpan={4} className="px-3 py-6 text-center text-xs text-root-subtle">
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