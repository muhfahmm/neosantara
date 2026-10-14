"use client";

import { Hammer, Clock3 } from "lucide-react";

interface ConstructionEntry {
  id?: string | number;
  buildingKey?: string;
  startDate?: string;
  endDate?: string;
}

interface DevelopingAIBuildingProps {
  countryDetail?: Record<string, unknown> | null;
  currentDate?: Date | string;
}

function parseDate(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) return null;
  return timestamp;
}

function getDateTimestamp(value?: Date | string): number | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const localDate = [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
    return parseDate(localDate);
  }
  return parseDate(value);
}

function formatDate(value?: string): string {
  const timestamp = parseDate(value);
  return timestamp === null
    ? "Tanggal tidak tersedia"
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(timestamp);
}

function getBuildingLabel(buildingKey?: string): string {
  if (!buildingKey) return "Bangunan tidak diketahui";
  return buildingKey.replace(/_/g, " ").replace(/\b\w/g, character => character.toUpperCase());
}

export default function DevelopingAIBuilding({
  countryDetail,
  currentDate,
}: DevelopingAIBuildingProps) {
  const constructions = Array.isArray(countryDetail?.ongoingConstructions)
    ? countryDetail.ongoingConstructions as ConstructionEntry[]
    : [];
  const now = getDateTimestamp(currentDate) ?? parseDate(new Date().toISOString().slice(0, 10));

  return (
    <section className="space-y-5 text-[#E0E0E0]">
      <header className="flex items-center gap-3 border-b border-[#00FFAA]/20 pb-4">
        <div className="rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-2.5">
          <Hammer className="h-5 w-5 text-[#00FFAA]" />
        </div>
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-[#00FFAA]">
            Progress Pembangunan
          </h2>
          <p className="mt-1 text-xs text-[#6B8A8A]">
            Pantau pembangunan yang sedang berjalan di negara ini.
          </p>
        </div>
      </header>

      {constructions.length === 0 ? (
        <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] px-5 py-8 text-center">
          <Clock3 className="mx-auto mb-3 h-7 w-7 text-[#6B8A8A]" />
          <p className="text-sm font-bold text-[#E0E0E0]">
            Belum ada pembangunan yang sedang berjalan.
          </p>
          <p className="mt-2 text-xs text-[#6B8A8A]">
            Antrean pembangunan negara akan ditampilkan di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B8A8A]">
              Total antrean pembangunan
            </span>
            <span className="text-sm font-black text-[#00FFAA]">{constructions.length}</span>
          </div>

          <div className="space-y-3">
            {constructions.map((construction, index) => {
              const start = parseDate(construction.startDate);
              const end = parseDate(construction.endDate);
              const duration = start !== null && end !== null ? end - start : 0;
              const elapsed = start !== null && now !== null ? now - start : 0;
              const progress = duration > 0
                ? Math.min(100, Math.max(0, Math.floor((elapsed / duration) * 100)))
                : end !== null && now !== null && now >= end
                  ? 100
                  : 0;
              const status = start === null || end === null
                ? "Jadwal tidak lengkap"
                : now !== null && now >= end
                  ? "Selesai, menunggu pembaruan data"
                  : "Sedang dibangun";

              return (
                <article
                  key={construction.id ?? `${construction.buildingKey ?? "construction"}-${index}`}
                  className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-[#E0E0E0]">
                        {getBuildingLabel(construction.buildingKey)}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#6B8A8A]">
                        {formatDate(construction.startDate)} – {formatDate(construction.endDate)}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#00FFAA]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00FFAA]">
                      {status}
                    </span>
                  </div>

                  <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-[#00FFAA]/10"
                    role="progressbar"
                    aria-label={`Progress pembangunan ${getBuildingLabel(construction.buildingKey)}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                  >
                    <div
                      className="h-full rounded-full bg-[#00FFAA] transition-[width]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-xs font-black text-[#00FFAA]">{progress}%</p>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
