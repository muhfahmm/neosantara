"use client";

import type { TravelFuelStatus } from "./travelFuelLogic";

export default function TravelFuelCostPanel({
  status,
  label = "Biaya perjalanan",
}: {
  status: TravelFuelStatus;
  label?: string;
}) {
  const numberFormat = (value: number) =>
    value.toLocaleString("id-ID", { maximumFractionDigits: 0 });

  return (
    <div className={`mb-5 rounded-xl border p-3 text-sm ${
      status.ok
        ? "border-root-accent/25 bg-root-accent/5"
        : "border-root-danger/40 bg-root-danger/10"
    }`}>
      <p className="font-bold text-root-text">
        {label}:{" "}
        <span className={status.ok ? "text-root-accent" : "text-root-danger"}>
          {status.loading || status.cost === null
            ? "Menghitung..."
            : `${numberFormat(status.cost)} barel minyak`}
        </span>
        {" | "}Stok: {numberFormat(status.stock)}
        {" | "}Sisa: {numberFormat(status.remaining)}
      </p>
      {status.fallback && !status.loading && (
        <p className="mt-1 text-xs text-amber-300">
          Tarif database tidak tersedia; biaya menggunakan estimasi sementara.
        </p>
      )}
      {!status.ok && !status.loading && (
        <p className="mt-1 font-bold text-root-danger">
          Stok minyak bumi tidak mencukupi
        </p>
      )}
      {status.belowDailyPowerPlantNeed && status.ok && (
        <p className="mt-1 text-xs font-bold text-amber-300">
          Peringatan: sisa minyak di bawah kebutuhan harian PLTU (
          {numberFormat(status.dailyPowerPlantNeed)} barel).
        </p>
      )}
    </div>
  );
}