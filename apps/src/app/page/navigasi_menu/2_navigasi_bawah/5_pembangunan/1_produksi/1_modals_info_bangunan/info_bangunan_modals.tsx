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
  const absVal = Math.abs(parsed);
  const formatted = absVal.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const parts = formatted.split(',');
  const mainColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
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
  onNavigateToTab?: (tabId: string, itemKey?: string) => void;
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
  onNavigateToTab,
}: InfoBangunanProps) {
  const fuelRequirements = isElectricityTab ? getKelistrikanFuelRequirements(buildingKey) : [];
  const hasFuelConsumption = fuelRequirements.length > 0;
  const isFuelResource = ELECTRICITY_FUEL_RESOURCE_KEYS.includes(buildingKey);

  const normalizeFoodKey = (k: string) => (k || '').replace(/^\d+_/, '').replace(/^pabrik_pengolahan_/, '').replace(/^pabrik_/, '').replace(/^kebun_/, '').replace(/^peternakan_/, '');
  const candidateKeys = [
    buildingKey,
    bMeta?.dataKey,
    metadata?.[buildingKey]?.dataKey,
    normalizeFoodKey(buildingKey),
    normalizeFoodKey(bMeta?.dataKey || ''),
    normalizeFoodKey(metadata?.[buildingKey]?.dataKey || ''),
  ].filter(Boolean);

  const activeFoodKey = candidateKeys.find(k => FOOD_CONSUMPTION_PER_CAPITA[k!] !== undefined) || candidateKeys[0] || buildingKey;
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
        className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 text-[#E0E0E0]">
            <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Info className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-base font-black uppercase tracking-wider">Info Bangunan - {label}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            aria-label="Tutup info"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 relative z-10 flex-1 overflow-y-auto space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar">
          <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 space-y-2">
            {isElectricityTab ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B8A8A]">Produksi Listrik (Total):</span>
                  <span className={`font-black text-sm ${isProductionZero ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {rawProduction.toLocaleString('id-ID')} MW
                    {isProductionZero && ' (bahan bakar defisit)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-4 text-[#6B8A8A]">
                  <span>Per Unit:</span>
                  <span className="text-[#E0E0E0]">{(bMeta?.produksi || 0).toLocaleString('id-ID')} MW</span>
                </div>
                {bMeta?.konsumsi_listrik !== undefined && bMeta.konsumsi_listrik > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B8A8A]">Listrik Dikonsumsi (Total):</span>
                      <span className="text-rose-400 font-bold">{(bMeta.konsumsi_listrik * perCount).toLocaleString('id-ID')} MW</span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-[#6B8A8A]">Listrik Dikonsumsi (Satuan):</span>
                      <span className="text-rose-400 font-bold">{bMeta.konsumsi_listrik.toLocaleString('id-ID')} MW</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {(() => {
                  const isRawDeficit = isFoodCommodity && isFoodRawMaterialDeficit(activeFoodKey, countryDetail, metadata);
                  return (
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B8A8A]">Total Produksi ({label}) Per Hari:</span>
                      <span className={`font-black text-sm ${isRawDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {totalFoodProduction.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                        {isRawDeficit && ' (bahan baku defisit)'}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex justify-between items-center pl-4 text-[#6B8A8A]">
                  <span>Total Produksi Per Unit:</span>
                  <span className="text-[#E0E0E0]">{(bMeta?.produksi || 0).toLocaleString('id-ID')}</span>
                </div>
                {isFoodCommodity && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B8A8A]">Total Konsumsi ({label}) Per Hari:</span>
                    <span className="text-rose-400 font-black text-sm">
                      {totalFoodConsumption.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                    </span>
                  </div>
                )}

                {bMeta?.konsumsi_listrik !== undefined && bMeta.konsumsi_listrik > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B8A8A]">Listrik Dikonsumsi (Total):</span>
                      <span className="text-rose-400 font-bold">{(bMeta.konsumsi_listrik * perCount).toLocaleString('id-ID')} MW</span>
                    </div>
                    <div className="flex justify-between items-center pl-4">
                      <span className="text-[#6B8A8A]">Listrik Dikonsumsi (Satuan):</span>
                      <span className="text-rose-400 font-bold">{bMeta.konsumsi_listrik.toLocaleString('id-ID')} MW</span>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex justify-between items-center border-t border-[#00FFAA]/10 pt-2 mt-2">
              <span className="text-[#6B8A8A]">Biaya Pembangunan:</span>
              <span className="text-[#00FFAA] font-black">{(Number(bMeta?.biaya_pembangunan) || 0).toLocaleString('id-ID')} EM</span>
            </div>
            {bMeta?.waktu_pembangunan !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-[#6B8A8A]">Waktu Pembangunan:</span>
                <span className="text-[#E0E0E0] font-bold">{bMeta.waktu_pembangunan} hari</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#6B8A8A]">Jumlah Bangunan Saat Ini:</span>
              <span className="text-[#00FFAA] font-black">{perCount} unit</span>
            </div>
          </div>

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

            // Helper untuk memetakan item key ke ID tab produksi
            const getItemTabId = (itemKey: string): string => {
              const AGRIKULTUR_KEYS = ["padi", "padi_beras", "beras", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"];
              const PETERNAKAN_KEYS = ["sapi_potong", "sapi_perah", "ayam_unggas", "domba_kambing"];
              const PERIKANAN_KEYS = ["ikan_tangkap", "ikan_budidaya", "udang"];
              const OLAHAN_PANGAN_KEYS = ["minyak_goreng", "gula", "roti", "mie_instan", "susu", "pengolahan_daging"];

              const cleanKey = itemKey.replace(/^\d+_/, '').replace(/^pabrik_pengolahan_/, '').replace(/^pabrik_/, '').replace(/^kebun_/, '').replace(/^peternakan_/, '');

              if (AGRIKULTUR_KEYS.includes(cleanKey)) return "agrikultur";
              if (PETERNAKAN_KEYS.includes(cleanKey)) return "peternakan";
              if (PERIKANAN_KEYS.includes(cleanKey)) return "perikanan";
              if (OLAHAN_PANGAN_KEYS.includes(cleanKey)) return "olahan pangan";
              return "olahan pangan";
            };

            const card1TabId = getItemTabId(activeFoodKey);

            return (
              <>
                <div className="rounded-xl bg-[#0A1A1A] border border-amber-500/30 p-4 space-y-2 mt-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-1">
                    <div className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 text-sm">
                      🍽️ TOTAL KONSUMSI ({displayFoodLabel.toUpperCase()})
                    </div>
                    {onNavigateToTab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onNavigateToTab(card1TabId, activeFoodKey);
                        }}
                        className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
                      >
                        Buka Sektor {card1TabId.toUpperCase()} &rarr;
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#E0E0E0] font-bold">Total Produksi ({displayFoodLabel}):</span>
                    {formatColoredNumber(totalFoodProduction, true)}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#E0E0E0] font-bold">Total Konsumsi ({displayFoodLabel}):</span>
                    {formatColoredNumber(totalFoodConsumption, false)}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-amber-500/20 mt-1 text-xs">
                    <span className="text-amber-400 font-black uppercase">SALDO / NETTO (PROD - KONSUMSI):</span>
                    {formatColoredNumber(foodNettoRaw, foodNettoRaw >= 0)}
                  </div>
                </div>

                {(() => {
                  if (ingredients && ingredients.length > 0) {
                    const card2IngKey = ingredients[0].key;
                    const card2TabId = getItemTabId(card2IngKey);

                    return (
                      <div className="rounded-xl bg-[#0A1A1A] border border-rose-500/30 p-4 space-y-3 mt-3">
                        <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-1">
                          <div className="font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 text-sm">
                            ⚡ TOTAL KONSUMSI {ingredients.length === 1 ? ingredients[0].label.toUpperCase() : 'BAHAN BAKU'}
                          </div>
                          {onNavigateToTab && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onNavigateToTab(card2TabId, card2IngKey);
                              }}
                              className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
                            >
                              Buka Sektor {card2TabId.toUpperCase()} &rarr;
                            </button>
                          )}
                        </div>
                        {ingredients.map((ing, idx) => {
                          const ingGrossProd = calculateProduction(ing.key, countryDetail, metadata);
                          const ingPopCons = FOOD_CONSUMPTION_PER_CAPITA[ing.key] !== undefined
                            ? calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[ing.key])
                            : 0;
                          const ingCons = perCount * ing.consPerBuildingUnit;
                          const ingSaldo = (ingGrossProd - ingPopCons) - ingCons;

                          return (
                            <div key={idx} className={`flex flex-col gap-1 ${idx > 0 ? 'pt-2 border-t border-rose-500/20' : ''}`}>
                              {ingredients.length > 1 && (
                                <div className="font-bold text-rose-300 text-[11px] uppercase tracking-tight">
                                  {ing.label}
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-[#E0E0E0] font-bold">Total Produksi ({ing.label}):</span>
                                {formatColoredNumber(ingGrossProd, true)}
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-[#E0E0E0] font-bold">Konsumsi ({displayFoodLabel} - {perCount} unit):</span>
                                {formatColoredNumber(-ingCons, false)}
                              </div>
                              {ingPopCons > 0 && (
                                <div className="flex justify-between items-center text-xs pl-2 text-[#6B8A8A]">
                                  <span className="font-semibold">Konsumsi (Masyarakat / Internal):</span>
                                  {formatColoredNumber(-ingPopCons, false)}
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-rose-500/20 mt-1 text-xs">
                                <span className="text-rose-400 font-black uppercase">SALDO (PROD - KONSUMSI):</span>
                                {formatColoredNumber(ingSaldo, ingSaldo >= 0)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  const foodKeys = ['gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras'];
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

                  if (matchedConsumers.length === 0) {
                    return null;
                  }

                  const popCons = totalFoodConsumption;
                  const saldoVal = (totalFoodProduction - popCons) - factoryCons;

                  const consumerLabelStr = matchedConsumers.map(c => `${c.label} (${c.count} unit)`).join(', ');
                  const firstConsumerKey = matchedConsumers[0].consumerKey;
                  const card2ConsumerTabId = getItemTabId(firstConsumerKey);

                  return (
                    <div className="rounded-xl bg-[#0A1A1A] border border-rose-500/30 p-4 space-y-3 mt-3">
                      <div className="flex items-center justify-between border-b border-rose-500/20 pb-2 mb-1">
                        <div className="font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5 text-sm">
                          ⚡ TOTAL KONSUMSI BAHAN BAKU PABRIK
                        </div>
                        {onNavigateToTab && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onNavigateToTab(card2ConsumerTabId, firstConsumerKey);
                            }}
                            className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/40 hover:text-white transition-all cursor-pointer shadow-sm"
                          >
                            Buka Sektor {card2ConsumerTabId.toUpperCase()} &rarr;
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#E0E0E0] font-bold">Total Produksi ({fuelName}):</span>
                        {formatColoredNumber(totalFoodProduction, true)}
                      </div>
                      {factoryCons > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#E0E0E0] font-bold">Konsumsi ({consumerLabelStr}):</span>
                          {formatColoredNumber(-factoryCons, false)}
                        </div>
                      )}
                      {popCons > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#E0E0E0] font-bold">Konsumsi (Masyarakat / Internal):</span>
                          {formatColoredNumber(-popCons, false)}
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-rose-500/20 mt-1 text-xs">
                        <span className="text-rose-400 font-black uppercase">SALDO (PROD - KONSUMSI):</span>
                        {formatColoredNumber(saldoVal, saldoVal >= 0)}
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
                <div className="rounded-xl bg-[#0A1A1A] border border-rose-500/30 p-4 space-y-3 mt-3">
                  <div className="font-black uppercase tracking-wider text-rose-400 border-b border-rose-500/20 pb-2 mb-2 flex items-center gap-1.5 text-sm">
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
                      <div key={idx} className={`flex flex-col gap-1 ${idx > 0 ? 'pt-2 border-t border-rose-500/20' : ''}`}>
                        <div className="font-bold text-rose-300 text-[11px] uppercase tracking-tight">
                          {req.label}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#E0E0E0]">Produksi:</span>
                          <span className="font-black text-emerald-400">+{totalFuelProd.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#E0E0E0]">Konsumsi:</span>
                          <span className="font-black text-rose-400">-{totalFuelCons.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-rose-500/20 mt-0.5">
                          <span className="text-rose-400 font-black uppercase">Saldo:</span>
                          <span className={`font-black ${saldo < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                <div className="rounded-xl bg-[#0A1A1A] border border-rose-500/30 p-4 space-y-2 mt-3">
                  <div className="font-black uppercase tracking-wider text-rose-400 border-b border-rose-500/20 pb-2 mb-1 flex items-center gap-1.5 text-sm">
                    ⚡ Total Konsumsi Bahan Bakar
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#E0E0E0] font-bold">Total Produksi ({fuelName}):</span>
                    <span className="font-black text-emerald-400">+{prodVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#E0E0E0] font-bold">Konsumsi ({fuelName}):</span>
                    <span className="font-black text-rose-400">-{consVal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-rose-500/20 mt-1 text-xs">
                    <span className="text-rose-400 font-black uppercase">Saldo (Prod - Konsumsi):</span>
                    <span className={`font-black ${saldoVal < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {saldoVal >= 0 ? `+${saldoVal.toLocaleString('id-ID')}` : saldoVal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })()}
        </div>

        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-md"
          >
            Tutup Info
          </button>
        </div>
      </div>
    </div>
  );
}