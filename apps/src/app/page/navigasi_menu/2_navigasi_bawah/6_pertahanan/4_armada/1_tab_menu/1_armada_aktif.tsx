"use client"
import React, { useState, useEffect } from "react";
import { Swords, Ship, Plane, Info } from "lucide-react";
import { BARAK_TO_SOLDIERS_MULTIPLIER } from "../logic/1_barak_logic";
import { getArmadaUnitBreakdown } from "../logic/armadaLogic";
import { convertBarakToSoldiers } from "../logic/1_barak_logic";
import KonfirmasiArmadaAktifModal from "../2_modals_konfirmasi_pembangunan/1_konfirmasi_armada_aktif_modal";
import InfoArmadaAktifModal from "../modals_info/1_info_armada_aktif_modal";
import { REQUIREMENTS as INFANTERI_REQUIREMENTS, findRequirements as findInfanteriRequirements } from "../requirements_logic/1_infanteri/requirements";
import armadaMetadata from "../../../../../../../../../json/semua_fitur_negara/2_pertahanan/1_armada_militer/metadata_armada_militer.json";

interface TabProps {
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onCapacityFull?: (infraKey: string) => void;
  highlightKey?: string | null;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
}

const armadaCatalog = {
  darat: [
    { key: "barak", label: "Pasukan Infanteri", group: "darat" },
    { key: "tank_tempur_utama", label: "Tank Tempur Utama", group: "darat" },
    { key: "apc_ifv", label: "APC / IFV", group: "darat" },
    { key: "artileri_berat", label: "Artileri Berat", group: "darat" },
    { key: "sistem_peluncur_roket", label: "Sistem Peluncur Roket", group: "darat" },
    { key: "pertahanan_udara_mobile", label: "Pertahanan Udara Mobile", group: "darat" },
    { key: "kendaraan_taktis", label: "Kendaraan Taktis", group: "darat" },
  ],
  laut: [
    { key: "kapal_induk", label: "Kapal Induk", group: "laut" },
    { key: "kapal_induk_nuklir", label: "Kapal Induk Nuklir", group: "laut" },
    { key: "kapal_destroyer", label: "Kapal Destroyer", group: "laut" },
    { key: "kapal_korvet", label: "Kapal Korvet", group: "laut" },
    { key: "kapal_selam_nuklir", label: "Kapal Selam Nuklir", group: "laut" },
    { key: "kapal_selam_regular", label: "Kapal Selam Reguler", group: "laut" },
    { key: "kapal_ranjau", label: "Kapal Ranjau", group: "laut" },
    { key: "kapal_logistik", label: "Kapal Logistik", group: "laut" },
  ],
  udara: [
    { key: "jet_tempur_siluman", label: "Jet Tempur Siluman", group: "udara" },
    { key: "jet_tempur_interceptor", label: "Jet Tempur Interceptor", group: "udara" },
    { key: "pesawat_pengebom", label: "Pesawat Pengebom", group: "udara" },
    { key: "helikopter_serang", label: "Helikopter Serang", group: "udara" },
    { key: "pesawat_pengintai", label: "Pesawat Pengintai", group: "udara" },
    { key: "drone_intai_uav", label: "Drone Intai UAV", group: "udara" },
    { key: "drone_kamikaze", label: "Drone Kamikaze", group: "udara" },
    { key: "pesawat_angkut", label: "Pesawat Angkut", group: "udara" },
  ],
};

const allArmadaItems = [...armadaCatalog.darat, ...armadaCatalog.laut, ...armadaCatalog.udara];

const groupMeta = {
  darat: { title: "Darat", icon: Swords, accent: "from-rose-700 to-orange-600" },
  laut: { title: "Laut", icon: Ship, accent: "from-sky-700 to-cyan-600" },
  udara: { title: "Udara", icon: Plane, accent: "from-indigo-700 to-violet-600" },
};
const groupKeys = Object.keys(groupMeta) as (keyof typeof groupMeta)[];

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

// Format Tanggal
const formatBadgeDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return dateString;
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';
    return `${day} ${month}, ${year}`;
  } catch {
    return dateString;
  }
};

const addDays = (dateString: string, days: number): string => {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

// Satu-satunya fungsi untuk mendapatkan tanggal "hari ini" dalam game
const getSafeDateString = (currentDate?: string | Date, gameDate?: string): string => {
  if (currentDate) {
    const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }
  if (gameDate) {
    return gameDate.split('T')[0];
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function ArmadaAktif({ countryDetail, setCountryDetail: _setCountryDetail, onCapacityFull, highlightKey, onGotoProduction, currentDate }: TabProps) {
  const unitBreakdown = getArmadaUnitBreakdown(countryDetail?.armada || countryDetail || {});

  const getData = (key: string, group?: string): number => {
    if (!countryDetail) return 0;
    if (countryDetail?.[key] !== undefined && countryDetail?.[key] !== null) {
      const val = Number(countryDetail[key]); if (!Number.isNaN(val)) return val;
    }
    if (countryDetail?.pertahanan?.[key] !== undefined && countryDetail?.pertahanan?.[key] !== null) {
      const val = Number(countryDetail.pertahanan[key]); if (!Number.isNaN(val)) return val;
    }
    if (countryDetail?.armada?.[key] !== undefined && countryDetail?.armada?.[key] !== null) {
      const val = Number(countryDetail.armada[key]); if (!Number.isNaN(val)) return val;
    }
    if (group && countryDetail?.armada?.[group]?.[key] !== undefined && countryDetail?.armada?.[group]?.[key] !== null) {
      const val = Number(countryDetail.armada[group][key]); if (!Number.isNaN(val)) return val;
    }
    if (group && countryDetail?.[group]?.[key] !== undefined && countryDetail?.[group]?.[key] !== null) {
      const val = Number(countryDetail[group][key]); if (!Number.isNaN(val)) return val;
    }
    return 0;
  };

  const calculateMaterialStocks = (countryDetailData: any) => {
    const stocks: Record<string, number> = {};
    const materialKeys = ['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi', 'pabrik_semikonduktor', 'pabrik_mesin_mobil', 'pabrik_mesin_motor', 'semen_beton', 'kayu'];
    materialKeys.forEach(key => {
      stocks[key] = Number(countryDetailData?.[`inventory_${key}`]) || 0;
    });
    return stocks;
  };

  const calculateMissingMaterials = (requirements: any[] | null | undefined, stocks: Record<string, number>) => {
    const safeRequirements = requirements || [];
    return safeRequirements.filter(req => {
      const stock = stocks[req.resourceKey] ?? 0;
      return stock <= 0;
    });
  };

  const getTabForResource = (resourceKey: string): { tab: string; buildingKey: string } => {
    const resourceToTabAndBuilding: Record<string, { tab: string; buildingKey: string }> = {
      emas: { tab: 'mineral', buildingKey: 'emas' },
      uranium: { tab: 'mineral', buildingKey: 'uranium' },
      batu_bara: { tab: 'mineral', buildingKey: 'batu_bara' },
      minyak_bumi: { tab: 'mineral', buildingKey: 'minyak_bumi' },
      gas_alam: { tab: 'mineral', buildingKey: 'gas_alam' },
      batu_gunung: { tab: 'mineral', buildingKey: 'garam' },
      litium: { tab: 'mineral', buildingKey: 'litium' },
      logam_tanah_jarang: { tab: 'mineral', buildingKey: 'logam_tanah_jarang' },
      bijih_besi: { tab: 'mineral', buildingKey: 'bijih_besi' },
      pabrik_semikonduktor: { tab: 'manufaktur', buildingKey: 'pabrik_semikonduktor' },
      pabrik_mesin_mobil: { tab: 'manufaktur', buildingKey: 'pabrik_mesin_mobil' },
      pabrik_mesin_motor: { tab: 'manufaktur', buildingKey: 'pabrik_mesin_motor' },
      semen_beton: { tab: 'manufaktur', buildingKey: 'semen_beton' },
      kayu: { tab: 'manufaktur', buildingKey: 'kayu' },
    };
    return resourceToTabAndBuilding[resourceKey] || { tab: 'kelistrikan', buildingKey: '' };
  };

  const [infoKey, setInfoKey] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [selectedForBuild, setSelectedForBuild] = useState<{ key: string; label: string } | null>(null);
  const [isConfirmBuildOpen, setIsConfirmBuildOpen] = useState(false);

  const buildTimeForKey = (key: string): number => {
    const meta = (armadaMetadata as Record<string, any>)[key];
    if (meta && typeof meta.waktu_pembangunan_armada_aktif === 'number') {
      return meta.waktu_pembangunan_armada_aktif;
    }
    return 7;
  };

  const costForKey = (key: string): number => {
    const meta = (armadaMetadata as Record<string, any>)[key];
    if (meta && typeof meta.biaya_pembangunan === 'number') {
      return meta.biaya_pembangunan;
    }
    return 0;
  };

  useEffect(() => {
    if (!countryDetail || !_setCountryDetail) return;

    const todayGameDateStr = getSafeDateString(currentDate, countryDetail?.game_date);
    const todayGameDate = new Date(todayGameDateStr);
    const ongoing = countryDetail?.ongoingConstructions || [];

    let hasChanged = false;
    let updatedDetail = { ...countryDetail };
    let updatedConstructions = [...ongoing];

    for (let i = updatedConstructions.length - 1; i >= 0; i--) {
      const construction = updatedConstructions[i];

      if (construction.type !== "recruitment" && construction.type !== "construction") continue;

      const endDate = new Date(construction.endDate);
      if (isNaN(endDate.getTime())) continue;

      if (endDate.getTime() <= todayGameDate.getTime()) {
        hasChanged = true;

        const targetKey = construction.buildingKey;
        if (construction.type === "recruitment") {
          if (!updatedDetail.armada) updatedDetail.armada = {};
          if (!updatedDetail.armada.darat) updatedDetail.armada.darat = {};
          const currentCount = Number(updatedDetail.armada.darat.pasukan_infanteri || 0);
          updatedDetail.armada.darat.pasukan_infanteri = currentCount + construction.quantity;
        } else {
          const group = armadaCatalog.darat.find(i => i.key === targetKey)?.group ||
                        armadaCatalog.laut.find(i => i.key === targetKey)?.group ||
                        armadaCatalog.udara.find(i => i.key === targetKey)?.group;

          if (group && updatedDetail.armada?.[group]?.[targetKey] !== undefined) {
            updatedDetail.armada[group][targetKey] = (Number(updatedDetail.armada[group][targetKey]) || 0) + (construction.quantity || 1);
          } else {
            if (updatedDetail[targetKey] !== undefined) {
              updatedDetail[targetKey] = (Number(updatedDetail[targetKey]) || 0) + (construction.quantity || 1);
            } else if (updatedDetail.pertahanan?.[targetKey] !== undefined) {
              updatedDetail.pertahanan[targetKey] = (Number(updatedDetail.pertahanan[targetKey]) || 0) + (construction.quantity || 1);
            }
          }
        }

        updatedConstructions.splice(i, 1);
      }
    }

    if (hasChanged) {
      updatedDetail.ongoingConstructions = updatedConstructions;
      _setCountryDetail(updatedDetail);
    }
  }, [countryDetail?.game_date, countryDetail?.ongoingConstructions, currentDate, _setCountryDetail]);

  const handleInfoClick = (key: string) => {
    setInfoKey(key);
    setIsInfoOpen(true);
  };

  const handleConfirm = (quantity: number = 1) => {
    if (!selectedForBuild) return;
    const key = selectedForBuild.key;
    const updatedDetail = { ...countryDetail };

    const isRecruitment = key === "barak";
    const group = armadaCatalog.darat.find(i => i.key === key)?.group ||
                  armadaCatalog.laut.find(i => i.key === key)?.group ||
                  armadaCatalog.udara.find(i => i.key === key)?.group;

    const currentDateStr = getSafeDateString(currentDate, countryDetail?.game_date);

    let targetKey = isRecruitment ? "pasukan_infanteri" : key;
    let type = isRecruitment ? "recruitment" : "construction";

    if (isRecruitment && quantity === 0) {
      alert("Masukkan jumlah pasukan yang ingin direkrut.");
      return;
    }
    if (!isRecruitment && quantity <= 0) {
      alert("Masukkan jumlah unit yang ingin dibangun.");
      return;
    }

    const unitCost = costForKey(key);
    const totalCost = isRecruitment ? 0 : unitCost * quantity;
    const currentAnggaran = Number(countryDetail?.anggaran) || 0;

    if (!isRecruitment && totalCost > currentAnggaran) {
      alert("Kas negara tidak cukup untuk membangun unit sejumlah ini.");
      return;
    }

    let days = 0;
    if (isRecruitment) {
      days = Math.ceil(quantity / 10000) * buildTimeForKey("barak");
    } else {
      days = Math.ceil(buildTimeForKey(key) * quantity);
    }
    const endDateStr = addDays(currentDateStr, days);

    if (!updatedDetail.ongoingConstructions) updatedDetail.ongoingConstructions = [];

    updatedDetail.ongoingConstructions.push({
      id: `${type}_${Date.now()}`,
      buildingKey: targetKey,
      label: selectedForBuild.label,
      quantity: quantity,
      cost: totalCost,
      startDate: currentDateStr,
      endDate: endDateStr,
      type: type,
      group: group
    });

    if (totalCost > 0) {
      updatedDetail.anggaran = currentAnggaran - totalCost;
    }

    _setCountryDetail(updatedDetail);
    setIsConfirmBuildOpen(false);
    setSelectedForBuild(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-xs font-semibold text-[#8b7e66] leading-relaxed">
        Inventaris alutsista negara dipisahkan berdasarkan kelompok operasional untuk memudahkan evaluasi kekuatan darat, laut, dan udara.
      </div>

      {groupKeys.map((group) => {
        const Icon = groupMeta[group].icon;

        // 🔥 PERBAIKAN LOGIKA DISINI: Hitung total kekuatan grup dari array unitBreakdown
        const groupItemKeys = armadaCatalog[group].map((item) => item.key);
        const totalGroupPower = unitBreakdown
          .filter((item) => groupItemKeys.includes(item.dataKey))
          .reduce((sum, item) => sum + (item.totalPower || 0), 0);

        return (
          <section key={group} className="space-y-4">
            {/* 🔥 Header Grup dengan Total Kekuatan di sampingnya */}
            <div className="flex items-center justify-between border-b border-[#00FFAA]/20 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-[#00FFAA]" />
                <h3 className="text-base font-black text-[#00FFAA] uppercase tracking-wider">
                  Matra {groupMeta[group].title}
                </h3>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#6B8A8A]">
                Total Kekuatan: <span className="text-[#00FFAA]">{formatNumber(totalGroupPower)}</span>
              </span>
            </div>

            {currentDate && (
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00FFAA]">
                  {currentDate instanceof Date
                    ? currentDate.toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })
                    : currentDate}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {armadaCatalog[group].map((item) => {
                const value = getData(item.key, group);
                let displayText = formatNumber(value);

                if (item.key === "barak") {
                  const currentBarakCount = getData("barak");
                  const infantryCount = getData("pasukan_infanteri", "darat");
                  const maxCapacity = currentBarakCount * 10000;
                  displayText = `${formatNumber(infantryCount)} / ${formatNumber(maxCapacity)}`;
                }

                const pendingItems = (countryDetail?.ongoingConstructions || []).filter(
                  (c: any) => {
                    const targetBuildingKey = item.key === "barak" ? "pasukan_infanteri" : item.key;
                    return c.buildingKey === targetBuildingKey && (c.type === "recruitment" || c.type === "construction");
                  }
                );
                const hasPending = pendingItems.length > 0;
                const lastEndDate = hasPending ? pendingItems[pendingItems.length - 1].endDate : null;
                const totalPendingQuantity = hasPending ? pendingItems.reduce((sum: number, r: any) => sum + (r.quantity || 1), 0) : 0;

                return (
                  <div
                    key={`${group}-${item.key}`}
                    onClick={() => {
                      setSelectedForBuild({ key: item.key, label: item.label });
                      setIsConfirmBuildOpen(true);
                    }}
                    className={`relative rounded-2xl flex flex-col justify-between transition-all bg-[#0A1A1A] border border-[#00FFAA]/20 shadow-sm hover:border-[#00FFAA]/50 hover:shadow-md cursor-pointer p-2.5 sm:p-3 min-h-[100px] sm:min-h-[110px] ${hasPending ? 'overflow-visible' : 'overflow-hidden'}`}
                  >
                    {hasPending && lastEndDate && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                        {formatBadgeDate(lastEndDate)}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider flex-1 pr-1.5 leading-snug">
                        {item.label}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInfoClick(item.key);
                        }}
                        className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-colors cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-end gap-1 flex-wrap">
                          <span className={`${item.key === "barak" ? "text-xs sm:text-sm" : "text-sm sm:text-base lg:text-lg"} font-black text-[#E0E0E0] leading-tight break-words`}>
                            {displayText}
                          </span>
                          {hasPending && (
                            <span className="text-[10px] sm:text-xs font-black text-[#00FFAA]">
                              +{formatNumber(totalPendingQuantity)}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[10px] mt-0.5 font-bold text-[#6B8A8A]">
                          {item.key === "barak" ? "Pasukan / Kapasitas" : "unit"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Modal Konfirmasi */}
      {selectedForBuild && isConfirmBuildOpen && (
        <KonfirmasiArmadaAktifModal
          isOpen={isConfirmBuildOpen}
          onClose={() => {
            setIsConfirmBuildOpen(false);
            setSelectedForBuild(null);
          }}
          buildingLabel={selectedForBuild.label}
          buildingDescription={selectedForBuild.label}
          cost={Number((armadaMetadata as Record<string, any>)[selectedForBuild.key]?.biaya_pembangunan ?? 0)}
          waktuPembangunan={buildTimeForKey(selectedForBuild.key)}
          requirements={selectedForBuild.key === "barak" ? (findInfanteriRequirements("barak")?.requirements || []) : []}
          materialStocks={calculateMaterialStocks(countryDetail)}
          anggaran={Number(countryDetail?.anggaran) || 0}
          missingMaterials={[]}
          onConfirm={handleConfirm}
          onMaterialClick={(resourceKey: string, label: string) => {
            const { tab, buildingKey } = getTabForResource(resourceKey);
            onGotoProduction?.(tab, buildingKey || resourceKey);
          }}
          loadingMetadata={false}
          isDisabled={false}
          capacityType={selectedForBuild.key === "barak" ? "infanteri" : selectedForBuild.key === "tank_tempur_utama" || selectedForBuild.key === "apc_ifv" ? "hangar_tank" : selectedForBuild.key === "artileri_berat" || selectedForBuild.key === "sistem_peluncur_roket" || selectedForBuild.key === "pertahanan_udara_mobile" || selectedForBuild.key === "kendaraan_taktis" ? "gudang_senjata" : ["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? "pangkalan_laut" : ["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? "pangkalan_udara" : undefined}
          currentCapacity={selectedForBuild.key === "barak" ? Number(getData("pasukan_infanteri", "darat") || 0) : 0}
          maxCapacity={selectedForBuild.key === "barak" ? (() => {
            const cB = getData("barak"); return cB * 10000;
          })() : 0}
          currentBarakCount={selectedForBuild.key === "barak" ? getData("barak") : undefined}
          currentTankCount={selectedForBuild.key === "tank_tempur_utama" || selectedForBuild.key === "apc_ifv" ? getData("tank_tempur_utama", "darat") : 0}
          currentApcCount={selectedForBuild.key === "tank_tempur_utama" || selectedForBuild.key === "apc_ifv" ? getData("apc_ifv", "darat") : 0}
          currentHangarCount={selectedForBuild.key === "tank_tempur_utama" || selectedForBuild.key === "apc_ifv" ? getData("hangar_tank") : 0}
          currentArtileriCount={selectedForBuild.key === "artileri_berat" || selectedForBuild.key === "sistem_peluncur_roket" || selectedForBuild.key === "pertahanan_udara_mobile" || selectedForBuild.key === "kendaraan_taktis" ? getData("artileri_berat", "darat") : 0}
          currentRoketCount={selectedForBuild.key === "artileri_berat" || selectedForBuild.key === "sistem_peluncur_roket" || selectedForBuild.key === "pertahanan_udara_mobile" || selectedForBuild.key === "kendaraan_taktis" ? getData("sistem_peluncur_roket", "darat") : 0}
          currentPertahanUdaraCount={selectedForBuild.key === "artileri_berat" || selectedForBuild.key === "sistem_peluncur_roket" || selectedForBuild.key === "pertahanan_udara_mobile" || selectedForBuild.key === "kendaraan_taktis" ? getData("pertahanan_udara_mobile", "darat") : 0}
          currentKendaraanTaktisCount={selectedForBuild.key === "artileri_berat" || selectedForBuild.key === "sistem_peluncur_roket" || selectedForBuild.key === "pertahanan_udara_mobile" || selectedForBuild.key === "kendaraan_taktis" ? getData("kendaraan_taktis", "darat") : 0}
          currentGudangCount={selectedForBuild.key === "artileri_berat" || selectedForBuild.key === "sistem_peluncur_roket" || selectedForBuild.key === "pertahanan_udara_mobile" || selectedForBuild.key === "kendaraan_taktis" ? getData("gudang_senjata") : 0}
          kapalIndukCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_induk", "laut") : 0}
          kapalIndukNuklirCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_induk_nuklir", "laut") : 0}
          kapalDestroyerCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_destroyer", "laut") : 0}
          kapalKorvetCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_korvet", "laut") : 0}
          kapalSelamNuklirCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_selam_nuklir", "laut") : 0}
          kapalSelamRegulerCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_selam_regular", "laut") : 0}
          kapalRanjauCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_ranjau", "laut") : 0}
          kapalLogistikCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("kapal_logistik", "laut") : 0}
          currentPangkalanLautCount={["kapal_induk", "kapal_induk_nuklir", "kapal_destroyer", "kapal_korvet", "kapal_selam_nuklir", "kapal_selam_regular", "kapal_ranjau", "kapal_logistik"].includes(selectedForBuild.key) ? getData("pangkalan_laut") : 0}
          jetTemturSilamanCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("jet_tempur_siluman", "udara") : 0}
          jetTemturInterceptorCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("jet_tempur_interceptor", "udara") : 0}
          pesawatPengebomCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("pesawat_pengebom", "udara") : 0}
          helikopterSerangCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("helikopter_serang", "udara") : 0}
          pesawatPengintaiCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("pesawat_pengintai", "udara") : 0}
          droneIntaiUavCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("drone_intai_uav", "udara") : 0}
          droneKamikazeCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("drone_kamikaze", "udara") : 0}
          pesawatAngkutCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("pesawat_angkut", "udara") : 0}
          currentPangkalanUdaraCount={["jet_tempur_siluman", "jet_tempur_interceptor", "pesawat_pengebom", "helikopter_serang", "pesawat_pengintai", "drone_intai_uav", "drone_kamikaze", "pesawat_angkut"].includes(selectedForBuild.key) ? getData("pangkalan_udara") : 0}
          onNavigateToInfra={onCapacityFull}
          infraKeyToHighlight={highlightKey}
          unitDataKey={selectedForBuild.key === "barak" ? "pasukan_infanteri" : selectedForBuild.key}
          currentGameDate={
            currentDate
              ? currentDate instanceof Date
                ? currentDate.toISOString()
                : String(currentDate)
              : countryDetail?.game_date || new Date().toISOString()
          }
        />
      )}

      {/* Modal Info Armada Aktif */}
      {isInfoOpen && infoKey && (
        <InfoArmadaAktifModal
          isOpen={isInfoOpen}
          onClose={() => {
            setIsInfoOpen(false);
            setInfoKey(null);
          }}
          selectedItem={allArmadaItems.find(i => i.key === infoKey)}
          selectedCategory={allArmadaItems.find(i => i.key === infoKey)?.group}
          groupMeta={groupMeta}
          formatNumber={formatNumber}
          unitBreakdown={unitBreakdown}
          isCapacityFull={infoKey === "barak" && (() => {
            const currentBarakCount = getData("barak");
            const infantryCount = getData("pasukan_infanteri", "darat");
            const maxCapacity = currentBarakCount * 10000;
            return currentBarakCount > 0 && infantryCount >= maxCapacity;
          })()}
          capacityDisplay={infoKey === "barak" ? (() => {
            const currentBarakCount = getData("barak");
            const infantryCount = getData("pasukan_infanteri", "darat");
            const maxCapacity = currentBarakCount * 10000;
            return `${formatNumber(infantryCount)} / ${formatNumber(maxCapacity)}`;
          })() : ""}
          onNavigateToInfra={onCapacityFull}
        />
      )}
    </div>
  );
}