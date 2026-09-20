// info_bangunan_modals.tsx
"use client";
import React from "react";
import { Info, X } from "lucide-react";
import { getKelistrikanFuelRequirements } from "../requirements_logic/1_produksi/1_kelistrikan/fuelLogic";
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateProduction,
  calculateConsumption,
  isFoodRawMaterialDeficit,
  getFoodIngredientsRequirements,
} from "../../../3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";

const ELECTRICITY_FUEL_RESOURCE_KEYS = [
  "gas_alam",
  "uranium",
  "batu_bara",
  "minyak_bumi",
];

const electricityFuelBuildings = [
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_uap",
];

const calculateTotalFuelConsumption = (countryDetail: any) => {
  const totals: Record<string, number> = {
    gas_alam: 0,
    uranium: 0,
    batu_bara: 0,
    minyak_bumi: 0,
  };

  electricityFuelBuildings.forEach((buildingKey) => {
    const count = Number(countryDetail?.[buildingKey]) || 0;
    if (count === 0) return;
    switch (buildingKey) {
      case "pembangkit_listrik_tenaga_gas":
        totals.gas_alam += 2 * count;
        break;
      case "pembangkit_listrik_tenaga_nuklir":
        totals.uranium += 1 * count;
        break;
      case "pembangkit_listrik_tenaga_uap":
        totals.batu_bara += 50 * count;
        totals.minyak_bumi += 5 * count;
        break;
    }
  });

  return totals;
};

// 🔥 BARU: helper angka yang IDENTIK dengan IndustriPanganModal.tsx
// supaya tampilan desimal (koma) & warnanya selalu sama persis
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
    if (normalized === '' || normalized === '-' || normalized === '.') return 0;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatColoredNumber = (value: any, isPositive: boolean = true) => {
  const parsed = safeNumber(value);
  if (parsed === 0) return <span className="font-black text-[#8b7e66]">0</span>;
  const formatted = parsed.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const parts = formatted.split(',');
  const mainColor = isPositive ? 'text-emerald-700' : 'text-rose-700';
  const sign = isPositive ? '+' : '-';
  if (parts.length === 1) return <span className={`font-black ${mainColor}`}>{sign}{parts[0]}</span>;
  return (<span className={`font-black ${mainColor}`}>{sign}{parts[0]}<span className="text-amber-500 font-bold">,{parts[1]}</span></span>);
};

interface InfoBangunanProps {
  buildingKey: string;
  label: string;
  perCount: number;
  bMeta: any;
  countryDetail: any;
  metadata: any; // 🔥 BARU — wajib dikirim dari parent tab (lihat catatan di bawah)
  findMeta: (key: string) => any;
  isElectricityTab: boolean;
  isProductionZero: boolean;
  rawProduction: number;
  onClose: () => void;
}

export default function InfoBangunan({
  buildingKey,
  label,
  perCount,
  bMeta,
  countryDetail,
  metadata,
  findMeta,
  isElectricityTab,
  isProductionZero,
  rawProduction,
  onClose,
}: InfoBangunanProps) {
  const fuelRequirements = isElectricityTab ? getKelistrikanFuelRequirements(buildingKey) : [];
  const hasFuelConsumption = fuelRequirements.length > 0;
  const isFuelResource = ELECTRICITY_FUEL_RESOURCE_KEYS.includes(buildingKey);

  const foodKey = (bMeta?.dataKey || buildingKey).replace(/^\d+_/, '').replace(/^pabrik_/, '').replace(/^kebun_/, '').replace(/^peternakan_/, '');
  const activeFoodKey = FOOD_CONSUMPTION_PER_CAPITA[buildingKey] !== undefined 
    ? buildingKey 
    : (FOOD_CONSUMPTION_PER_CAPITA[bMeta?.dataKey] !== undefined ? bMeta.dataKey : foodKey);
  const isFoodCommodity = FOOD_CONSUMPTION_PER_CAPITA[activeFoodKey] !== undefined;
  const consumptionPerCapita = isFoodCommodity ? FOOD_CONSUMPTION_PER_CAPITA[activeFoodKey] : 0;
  const pop = Number(countryDetail?.jumlah_penduduk) || 0;

  const RAW_MATERIAL_CONSUMER_MAP: Record<string, Array<{ consumerKey: string; amountPerUnit: number }>> = {
    tebu: [{ consumerKey: 'gula', amountPerUnit: 10 }],
    gandum: [
      { consumerKey: 'roti', amountPerUnit: 15 },
      { consumerKey: 'mie_instan', amountPerUnit: 20 },
    ],
    kelapa_sawit: [{ consumerKey: 'minyak_goreng', amountPerUnit: 12 }],
    sapi_perah: [{ consumerKey: 'susu', amountPerUnit: 8 }],
    ayam_unggas: [{ consumerKey: 'pengolahan_daging', amountPerUnit: 5 }],
    sapi_potong: [{ consumerKey: 'pengolahan_daging', amountPerUnit: 2 }],
    domba_kambing: [{ consumerKey: 'pengolahan_daging', amountPerUnit: 3 }],
  };

  const getRawMaterialConsumption = (rawKey: string, detail: any) => {
    const consumers = RAW_MATERIAL_CONSUMER_MAP[rawKey];
    if (!consumers) return null;
    let total = 0;
    consumers.forEach(({ consumerKey, amountPerUnit }) => {
      const factoryCount = Number(detail?.[consumerKey]) || 0;
      total += factoryCount * amountPerUnit;
    });
    return total;
  };

  const rawMaterialCons = getRawMaterialConsumption(activeFoodKey, countryDetail);

  const totalFoodProduction = isFoodCommodity && metadata
    ? calculateProduction(activeFoodKey, countryDetail, metadata)
    : (bMeta?.produksi || 0) * perCount;

  const totalFoodConsumption = isFoodCommodity
    ? calculateConsumption(pop, consumptionPerCapita)
    : 0;

  const foodNettoRaw = totalFoodProduction - totalFoodConsumption;
  const foodNetto = Math.max(0, foodNettoRaw);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.02)_0%,transparent_100%)] pointer-events-none" />

        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-3 text-[#5c3c10]">
            <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
              <Info className="h-5 w-5 text-[#5c3c10]" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-tight">Info Bangunan - {label}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            aria-label="Tutup info"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 relative z-10 flex-1 overflow-y-auto space-y-4 text-xs font-semibold text-[#5c3c10]">
          <div className="bg-white/80 border border-[#C4B49C]/40 rounded-xl p-4 space-y-2 shadow-xs">
            {isElectricityTab ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[#8b7e66]">Produksi Listrik (Total):</span>
                  <span className={`font-black text-sm ${isProductionZero ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {rawProduction.toLocaleString('id-ID')} MW
                    {isProductionZero && ' (bahan bakar defisit)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-4 text-[#8b7e66]">
                  <span>Per Unit:</span>
                  <span>{(bMeta?.produksi || 0).toLocaleString('id-ID')} MW</span>
                </div>
                {bMeta?.konsumsi_listrik !== undefined && bMeta.konsumsi_listrik > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b7e66]">Listrik Dikonsumsi (Total):</span>
                      <span className="text-rose-700 font-bold">{(bMeta.konsumsi_listrik * perCount).toLocaleString('id-ID')} MW</span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-[#8b7e66]">Listrik Dikonsumsi (Satuan):</span>
                      <span className="text-rose-700 font-bold">{bMeta.konsumsi_listrik.toLocaleString('id-ID')} MW</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* 🔥 FIX: sekarang pakai totalFoodProduction (untuk komoditas pangan)
                    supaya nilainya identik dengan yang dipakai blok Neraca di bawah
                    dan dengan IndustriPanganModal.tsx */}
                {(() => {
                  const isRawDeficit = isFoodCommodity && isFoodRawMaterialDeficit(activeFoodKey, countryDetail, metadata);
                  return (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b7e66]">Total Produksi ({label}) Per Hari:</span>
                      <span className={`font-black text-sm ${isRawDeficit ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {totalFoodProduction.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                        {isRawDeficit && ' (bahan baku defisit)'}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex justify-between items-center pl-4 text-[#8b7e66]">
                  <span>Total Produksi Per Unit:</span>
                  <span>{(bMeta?.produksi || 0).toLocaleString('id-ID')}</span>
                </div>
                {isFoodCommodity && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b7e66]">Total Konsumsi ({label}) Per Hari:</span>
                    <span className="text-rose-700 font-black text-sm">
                      {totalFoodConsumption.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                    </span>
                  </div>
                )}

                {bMeta?.konsumsi_listrik !== undefined && bMeta.konsumsi_listrik > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8b7e66]">Listrik Dikonsumsi (Total):</span>
                      <span className="text-rose-700 font-bold">{(bMeta.konsumsi_listrik * perCount).toLocaleString('id-ID')} MW</span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-[#8b7e66]">Listrik Dikonsumsi (Satuan):</span>
                      <span className="text-rose-700 font-bold">{bMeta.konsumsi_listrik.toLocaleString('id-ID')} MW</span>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex justify-between items-center border-t border-[#C4B49C]/20 pt-2 mt-2">
              <span className="text-[#8b7e66]">Biaya Pembangunan:</span>
              <span className="text-[#5c3c10] font-black">{(Number(bMeta?.biaya_pembangunan) || 0).toLocaleString('id-ID')} EM</span>
            </div>
            {bMeta?.waktu_pembangunan !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-[#8b7e66]">Waktu Pembangunan:</span>
                <span className="text-[#5c3c10] font-bold">{bMeta.waktu_pembangunan} hari</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#8b7e66]">Jumlah Bangunan Saat Ini:</span>
              <span className="text-[#2e261a] font-black">{perCount} unit</span>
            </div>
          </div>

          {/* 🔥 FIX: Neraca Pangan Nasional sekarang pakai calculateProduction /
              calculateConsumption (fungsi yang sama dengan IndustriPanganModal.tsx)
              + formatColoredNumber (koma desimal muncul lagi) + netto di-clamp ke 0 */}
          {isFoodCommodity && (() => {
            const rawClean = label.replace(/^Pabrik\s+(Pengolahan\s+)?/i, '').replace(/^Pabrik\s+/i, '').trim();
            const displayFoodLabel = rawClean.length > 0 ? rawClean : label;
            const fuelName = displayFoodLabel.toLowerCase();

            const reqIngredients = getFoodIngredientsRequirements(activeFoodKey, metadata);
            const ingredients = reqIngredients.map(ing => ({
              key: ing.key,
              label: ing.label,
              consPerBuildingUnit: ing.amount,
            }));

            return (
              <>
                {/* 🍽️ CARD 1: WARNA KUNING (KONSUMSI PANGAN MASYARAKAT) */}
                <div className="rounded-xl bg-amber-50/80 border border-amber-300 p-4 space-y-2 shadow-xs mt-3">
                  <div className="font-black uppercase tracking-wider text-amber-900 border-b border-amber-200/80 pb-2 mb-1 flex items-center gap-1.5 text-sm">
                    🍽️ TOTAL KONSUMSI ({displayFoodLabel.toUpperCase()})
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-950 font-bold">Total Produksi ({displayFoodLabel}):</span>
                    {formatColoredNumber(totalFoodProduction, true)}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-950 font-bold">Total Konsumsi ({displayFoodLabel}):</span>
                    {formatColoredNumber(totalFoodConsumption, false)}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-200/80 mt-1 text-xs">
                    <span className="text-amber-950 font-black uppercase">SALDO / NETTO (PROD - KONSUMSI):</span>
                    {formatColoredNumber(foodNettoRaw, foodNettoRaw >= 0)}
                  </div>
                </div>

                {/* ⚡ CARD 2: WARNA MERAH (RINCIAN KONSUMSI BAHAN BAKU / MENTAH) */}
                {(() => {
                  if (ingredients && ingredients.length > 0) {
                    return (
                      <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 space-y-3 shadow-xs mt-3">
                        <div className="font-black uppercase tracking-wider text-rose-900 border-b border-rose-200 pb-2 mb-1 flex items-center gap-1.5 text-sm">
                          ⚡ TOTAL KONSUMSI {ingredients.length === 1 ? ingredients[0].label.toUpperCase() : 'BAHAN BAKU'}
                        </div>
                        {ingredients.map((ing, idx) => {
                          const ingGrossProd = calculateProduction(ing.key, countryDetail, metadata);
                          const ingPopCons = FOOD_CONSUMPTION_PER_CAPITA[ing.key] !== undefined
                            ? calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[ing.key])
                            : 0;
                          const ingCons = perCount * ing.consPerBuildingUnit;
                          const ingSaldo = (ingGrossProd - ingPopCons) - ingCons;

                          return (
                            <div key={idx} className={`flex flex-col gap-1 ${idx > 0 ? 'pt-2 border-t border-rose-200' : ''}`}>
                              {ingredients.length > 1 && (
                                <div className="font-bold text-rose-800 text-[11px] uppercase tracking-tight">
                                  {ing.label}
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-rose-900 font-bold">Total Produksi ({ing.label}):</span>
                                <span className="font-black text-emerald-800">+{ingGrossProd.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-rose-900 font-bold">Konsumsi ({displayFoodLabel} - {perCount} unit):</span>
                                <span className="font-black text-rose-800">-{ingCons.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                              </div>
                              {ingPopCons > 0 && (
                                <div className="flex justify-between items-center text-xs pl-2 text-rose-950/80">
                                  <span className="font-semibold">Konsumsi (Masyarakat / Internal):</span>
                                  <span className="font-bold text-rose-700">-{ingPopCons.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-rose-200 mt-1 text-xs">
                                <span className="text-rose-900 font-black uppercase">SALDO (PROD - KONSUMSI):</span>
                                <span className={`font-black ${ingSaldo < 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                                  {ingSaldo >= 0 ? `+${ingSaldo.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}` : ingSaldo.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  const foodKeys = ['gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu'];
                  const matchedConsumers: Array<{ consumerKey: string; amountPerUnit: number; label: string; count: number }> = [];
                  let factoryCons = 0;

                  for (const fk of foodKeys) {
                    const reqs = getFoodIngredientsRequirements(fk, metadata);
                    const matched = reqs.find(item => item.key === activeFoodKey);
                    if (matched) {
                      const count = Number(countryDetail?.[fk]) || 0;
                      const cMeta = findMeta ? findMeta(fk) : undefined;
                      const cLabel = cMeta?.label || fk.replace(/_/g, ' ');
                      matchedConsumers.push({
                        consumerKey: fk,
                        amountPerUnit: matched.amount,
                        label: cLabel,
                        count,
                      });
                      factoryCons += count * matched.amount;
                    }
                  }

                  // Jika tidak dikonsumsi oleh industri olahan pangan manapun, jangan tampilkan Card Merah
                  if (matchedConsumers.length === 0) {
                    return null;
                  }

                  const popCons = totalFoodConsumption;
                  const saldoVal = (totalFoodProduction - popCons) - factoryCons;

                  const consumerLabelStr = matchedConsumers.map(c => `${c.label} (${c.count} unit)`).join(', ');

                  return (
                    <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 space-y-3 shadow-xs mt-3">
                      <div className="font-black uppercase tracking-wider text-rose-900 border-b border-rose-200 pb-2 mb-1 flex items-center gap-1.5 text-sm">
                        ⚡ TOTAL KONSUMSI BAHAN BAKU PABRIK
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-rose-900 font-bold">Total Produksi ({fuelName}):</span>
                        <span className="font-black text-emerald-800">+{totalFoodProduction.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                      </div>
                      {factoryCons > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-rose-900 font-bold">Konsumsi ({consumerLabelStr}):</span>
                          <span className="font-black text-rose-800">-{factoryCons.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                        </div>
                      )}
                      {popCons > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-rose-900 font-bold">Konsumsi (Masyarakat / Internal):</span>
                          <span className="font-black text-rose-800">-{popCons.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-rose-200 mt-1 text-xs">
                        <span className="text-rose-900 font-black uppercase">SALDO (PROD - KONSUMSI):</span>
                        <span className={`font-black ${saldoVal < 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                          {saldoVal >= 0 ? `+${saldoVal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}` : saldoVal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </>
            );
          })()}



          {hasFuelConsumption &&
            (() => {
              return (
                <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 space-y-3 shadow-xs mt-3">
                  <div className="font-black uppercase tracking-wider text-rose-900 border-b border-rose-200 pb-2 mb-2 flex items-center gap-1.5 text-sm">
                    ⚡ Total Konsumsi Bahan Bakar
                  </div>
                  {fuelRequirements.map((req, idx) => {
                    const fCount = Number(countryDetail?.[req.resourceKey]) || 0;
                    const fMeta = findMeta(req.resourceKey);
                    const fProd = Number(fMeta?.produksi) || 0;
                    const totalFuelProd = fCount * fProd;
                    const totalFuelCons = req.amount * perCount;
                    const saldo = totalFuelProd - totalFuelCons;

                    return (
                      <div key={idx} className={`flex flex-col gap-1 ${idx > 0 ? 'pt-2 border-t border-rose-200' : ''}`}>
                        <div className="font-bold text-rose-800 text-[11px] uppercase tracking-tight">
                          {req.label}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-rose-900">Produksi:</span>
                          <span className="font-black text-emerald-800">+{totalFuelProd.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-rose-900">Konsumsi:</span>
                          <span className="font-black text-rose-800">-{totalFuelCons.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-rose-200/50 mt-0.5">
                          <span className="text-rose-900 font-black uppercase">Saldo:</span>
                          <span className={`font-black ${saldo < 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                            {saldo >= 0 ? `+${saldo.toLocaleString('id-ID')}` : saldo.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          {isFuelResource &&
            (() => {
              const fuelName = label.toLowerCase();
              const prodVal = perCount * (Number(bMeta?.produksi) || 0);
              const consVal = calculateTotalFuelConsumption(countryDetail)[buildingKey] || 0;
              const saldoVal = prodVal - consVal;
              return (
                <div className="rounded-xl bg-rose-50 border border-rose-300 p-4 space-y-2 shadow-xs mt-3">
                  <div className="font-black uppercase tracking-wider text-rose-900 border-b border-rose-200 pb-2 mb-1 flex items-center gap-1.5 text-sm">
                    ⚡ Total Konsumsi Bahan Bakar
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-rose-900 font-bold">Total Produksi ({fuelName}):</span>
                    <span className="font-black text-emerald-800">+{prodVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-rose-900 font-bold">Konsumsi ({fuelName}):</span>
                    <span className="font-black text-rose-800">-{consVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-rose-200 mt-1 text-xs">
                    <span className="text-rose-900 font-black uppercase">Saldo (Prod - Konsumsi):</span>
                    <span className={`font-black ${saldoVal < 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                      {saldoVal >= 0 ? `+${saldoVal.toLocaleString('id-ID')}` : saldoVal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })()}
        </div>

        <div className="p-6 bg-[#FAF6EE] border-t-2 border-[#C4B49C]/20 flex justify-end relative z-10 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer bg-[#5c3c10] text-[#FAF6EE] border border-[#5c3c10] hover:bg-[#8b7e66] hover:border-[#8b7e66] shadow-sm"
          >
            Tutup Info
          </button>
        </div>
      </div>
    </div>
  );
}