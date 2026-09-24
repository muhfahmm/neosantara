"use client";
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { convertBarakToSoldiers } from "../logic/1_barak_logic";
import KonfirmasiInfrastrukturModal from "../2_modals_konfirmasi_pembangunan/2_konfirmasi_infrastruktur_modal";
import { deductBuildingMaterials } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { REQUIREMENTS as INFANTERI_REQUIREMENTS } from "../requirements_logic/1_infanteri/requirements";
import { REQUIREMENTS as HANGAR_REQUIREMENTS } from "../requirements_logic/2_hangar_tank/requirements";
import { REQUIREMENTS as GUDANG_REQUIREMENTS } from "../requirements_logic/3_gudang_senjata/requirements";
import { REQUIREMENTS as LAUT_REQUIREMENTS } from "../requirements_logic/4_pangkalan_laut/requirements";
import { REQUIREMENTS as UDARA_REQUIREMENTS } from "../requirements_logic/5_pangkalan_udara/requirements";

interface TabProps {
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onCapacityFull?: (infraKey: string) => void;
  highlightKey?: string | null;
  onGotoProduction?: (tab: string, key: string) => void;
  ongoingConstructions?: any[];
  currentDate?: string | Date;
}

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

const getNestedValue = (obj: any, key: string): number => {
  if (key === "barak") {
    const barakCount = Number(obj?.[key] ?? 0) || Number(obj?.pertahanan?.[key] ?? 0) || 0;
    return barakCount;
  }
  if (obj?.[key] !== undefined && obj?.[key] !== null) return Number(obj[key]);
  if (obj?.pertahanan?.[key] !== undefined && obj?.pertahanan?.[key] !== null) return Number(obj.pertahanan[key]);
  return 0;
};

// 🟢 SATU-SATUNYA fungsi tanggal – dipakai untuk semua keperluan
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

export default function InfrastrukturMiliter({ 
  countryDetail, 
  setCountryDetail: _setCountryDetail, 
  highlightKey, 
  onGotoProduction, 
  ongoingConstructions = [], 
  currentDate 
}: TabProps) {
  const [selectedForBuild, setSelectedForBuild] = useState<{ key: string; label: string } | null>(null);
  const [isConfirmBuildOpen, setIsConfirmBuildOpen] = useState(false);
  const [infrastrukturData, setInfrastrukturData] = useState<Record<string, any>>({});

  // 🟢 Muat metadata infrastruktur
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/metadata/armada_metadata.json');
        const data = await response.json();
        setInfrastrukturData(data);
      } catch (error) {
        console.error('Error loading infrastructure metadata:', error);
      }
    };
    loadMetadata();
  }, []);

  // 🟢 Proses konstruksi yang selesai (berdasarkan tanggal simulasi)
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

      const isInfraKey = ["barak", "hangar_tank", "gudang_senjata", "pangkalan_laut", "pangkalan_udara"].includes(construction.buildingKey);
      const isInfraType = construction.type === "infra_construction" || !construction.type;

      if (!(isInfraKey && isInfraType)) continue;

      const endDate = new Date(construction.endDate);
      if (isNaN(endDate.getTime())) continue;

      if (endDate.getTime() <= todayGameDate.getTime()) {
        hasChanged = true;
        const targetKey = construction.buildingKey;
        const qty = construction.quantity || 1;

        if (updatedDetail[targetKey] !== undefined) {
          updatedDetail[targetKey] = (Number(updatedDetail[targetKey]) || 0) + qty;
        } else if (updatedDetail.pertahanan?.[targetKey] !== undefined) {
          updatedDetail.pertahanan[targetKey] = (Number(updatedDetail.pertahanan[targetKey]) || 0) + qty;
        } else {
          updatedDetail[targetKey] = (Number(updatedDetail[targetKey]) || 0) + qty;
        }

        updatedConstructions.splice(i, 1);
      }
    }

    if (hasChanged) {
      updatedDetail.ongoingConstructions = updatedConstructions;
      _setCountryDetail(updatedDetail);
    }
  }, [countryDetail?.game_date, countryDetail?.ongoingConstructions, currentDate, _setCountryDetail]);

  // 🟢 Helper untuk stok material
  const calculateMaterialStocks = (countryDetailData: any) => {
    const stocks: Record<string, number> = {};
    const materialKeys = ['emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi', 'pabrik_semikonduktor', 'pabrik_mesin_mobil', 'pabrik_mesin_motor', 'semen_beton', 'kayu'];
    materialKeys.forEach(key => {
      stocks[key] = Number(countryDetailData?.[`inventory_${key}`]) || 0;
    });
    return stocks;
  };

  const calculateMissingMaterials = (requirements: any[], stocks: Record<string, number>) => {
    return requirements.filter(req => {
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

  const handleInfoClick = (key: string) => {
    const item = infrastrukturData[key];
    if (!item) {
      alert("Data infrastruktur belum dimuat.");
      return;
    }
    setSelectedForBuild({ key, label: item?.label || key });
    setIsConfirmBuildOpen(true);
  };

  // 🟢 Fungsi konfirmasi pembangunan (sudah termasuk cek kas & material)
  const handleConfirmBuild = (quantity: number = 1) => {
    if (!selectedForBuild?.key || !infrastrukturData[selectedForBuild.key]) return;

    const key = selectedForBuild.key;
    const buildingData = infrastrukturData[key];
    const qty = Math.max(1, Math.floor(quantity));
    const waktu = Number(buildingData.waktu_pembangunan) || 0;
    const costPerUnit = Number(buildingData.biaya_pembangunan) || 0;
    const totalCost = costPerUnit * qty;
    const currentAnggaran = Number(countryDetail?.anggaran) || 0;

    // 1. Cek kas negara
    if (currentAnggaran < totalCost) {
      alert(`💰 Kas negara tidak mencukupi!\nDibutuhkan: ${formatNumber(totalCost)} EM\nTersedia: ${formatNumber(currentAnggaran)} EM`);
      return;
    }

    // 2. Ambil requirements material
    let requirementsForDeduction: any[] = [];
    if (key === "barak") {
      const barakReqs = INFANTERI_REQUIREMENTS.find((r) => r.buildingKey === "barak");
      requirementsForDeduction = barakReqs?.requirements || [];
    } else if (key === "hangar_tank") {
      const hangarReqs = HANGAR_REQUIREMENTS.find((r) => r.buildingKey === "hangar_tank");
      requirementsForDeduction = hangarReqs?.requirements || [];
    } else if (key === "gudang_senjata") {
      const gudangReqs = GUDANG_REQUIREMENTS.find((r) => r.buildingKey === "gudang_senjata");
      requirementsForDeduction = gudangReqs?.requirements || [];
    } else if (key === "pangkalan_laut") {
      const lautReqs = LAUT_REQUIREMENTS.find((r) => r.buildingKey === "pangkalan_laut");
      requirementsForDeduction = lautReqs?.requirements || [];
    } else if (key === "pangkalan_udara") {
      const udaraReqs = UDARA_REQUIREMENTS.find((r) => r.buildingKey === "pangkalan_udara");
      requirementsForDeduction = udaraReqs?.requirements || [];
    }

    // 3. Cek material (gunakan stok saat ini)
    const materialStocks = calculateMaterialStocks(countryDetail);
    const missing = calculateMissingMaterials(requirementsForDeduction, materialStocks);
    if (missing.length > 0) {
      alert(`❌ Material berikut tidak mencukupi:\n${missing.map(m => `${m.label} (butuh ${m.amount || 1})`).join('\n')}`);
      return;
    }

    // 4. Deduct kas dan material (per unit)
    const updatedDetailWithMaterials = deductBuildingMaterials(
      { ...countryDetail, anggaran: currentAnggaran - totalCost },
      requirementsForDeduction,
      qty
    );

    // 5. Jika waktu 0 (instan), tambahkan langsung
    if (waktu <= 0) {
      updatedDetailWithMaterials[key] = (Number(countryDetail?.[key]) || 0) + qty;
      _setCountryDetail(updatedDetailWithMaterials);
      setIsConfirmBuildOpen(false);
      setSelectedForBuild(null);
      return;
    }

    // 6. Buat antrean konstruksi
    const safeDateString = getSafeDateString(currentDate, countryDetail?.game_date);
    let startDateStr = safeDateString;
    const ongoing = countryDetail.ongoingConstructions || [];
    const existingForThisKey = ongoing.filter((c: any) => c.buildingKey === key);

    if (existingForThisKey.length > 0) {
      const lastEndDateStr = existingForThisKey[existingForThisKey.length - 1].endDate;
      startDateStr = lastEndDateStr;
    }

    const newOngoing = [...ongoing];
    for (let i = 0; i < qty; i++) {
      const nextStart = i === 0 ? startDateStr : addDays(newOngoing[newOngoing.length - 1].endDate, 0);
      const nextEnd = addDays(nextStart, waktu);
      newOngoing.push({
        id: Date.now() + Math.random() + i,
        buildingKey: key,
        startDate: nextStart,
        endDate: nextEnd,
        type: "infra_construction",
        quantity: 1
      });
    }

    const finalUpdate = { ...updatedDetailWithMaterials, ongoingConstructions: newOngoing };
    _setCountryDetail(finalUpdate);
    setIsConfirmBuildOpen(false);
    setSelectedForBuild(null);
  };

  // 🟢 Helper untuk mendapatkan modal props
  const getModalProps = () => {
    if (!selectedForBuild?.key) return null;
    const buildingData = infrastrukturData[selectedForBuild.key];
    if (!buildingData) return null;

    const materialStocks = calculateMaterialStocks(countryDetail);

    const modalPropsBase = {
      isOpen: isConfirmBuildOpen,
      onClose: () => {
        setIsConfirmBuildOpen(false);
        setSelectedForBuild(null);
      },
      buildingLabel: selectedForBuild.label,
      buildingDescription: selectedForBuild.label,
      cost: buildingData.biaya_pembangunan || 0,
      waktuPembangunan: buildingData.waktu_pembangunan || 0,
      konsumsiListrik: buildingData.konsumsi_listrik,
      requirements: [] as any[],
      materialStocks: materialStocks,
      anggaran: Number(countryDetail?.anggaran) || 0,
      missingMaterials: [] as any[],
      onConfirm: handleConfirmBuild,
      onMaterialClick: (resourceKey: string, label: string) => {
        const { tab, buildingKey } = getTabForResource(resourceKey);
        onGotoProduction?.(tab, buildingKey || resourceKey);
      },
      loadingMetadata: false,
      isDisabled: false,
    };

    const findRequirementsForBuilding = (buildingKey: string, requirementsArray: any[]) => {
      const found = requirementsArray.find((r) => r.buildingKey === buildingKey);
      return found?.requirements || [];
    };

    const key = selectedForBuild.key;
    const currentBarak = Number(getNestedValue(countryDetail, "barak")) || 0;
    const ongoingBarak = (ongoingConstructions || []).filter((c: any) => c.buildingKey === "barak").length || 0;
    const storedInfantry = Number((countryDetail?.armada?.darat?.pasukan_infanteri ?? getNestedValue(countryDetail, "pasukan_infanteri")) || 0);

    if (key === "barak") {
      const barakRequirements = findRequirementsForBuilding("barak", INFANTERI_REQUIREMENTS);
      const maxCap = (currentBarak + ongoingBarak) * 10000;
      return (
        <KonfirmasiInfrastrukturModal
          {...modalPropsBase}
          requirements={barakRequirements}
          missingMaterials={calculateMissingMaterials(barakRequirements, materialStocks)}
          capacityType="infanteri"
          currentCapacity={storedInfantry}
          maxCapacity={maxCap}
          currentBarakCount={currentBarak}
        />
      );
    }

    if (key === "hangar_tank") {
      const hangarRequirements = findRequirementsForBuilding("hangar_tank", HANGAR_REQUIREMENTS);
      return (
        <KonfirmasiInfrastrukturModal
          {...modalPropsBase}
          requirements={hangarRequirements}
          missingMaterials={calculateMissingMaterials(hangarRequirements, materialStocks)}
          capacityType="hangar_tank"
          currentTankCount={Number(countryDetail?.armada?.darat?.tank_tempur_utama ?? 0)}
          currentApcCount={Number(countryDetail?.armada?.darat?.apc_ifv ?? 0)}
          currentHangarCount={Number(getNestedValue(countryDetail, "hangar_tank"))}
        />
      );
    }

    if (key === "gudang_senjata") {
      const gudangRequirements = findRequirementsForBuilding("gudang_senjata", GUDANG_REQUIREMENTS);
      return (
        <KonfirmasiInfrastrukturModal
          {...modalPropsBase}
          requirements={gudangRequirements}
          missingMaterials={calculateMissingMaterials(gudangRequirements, materialStocks)}
          capacityType="gudang_senjata"
          currentArtileriCount={Number(countryDetail?.armada?.darat?.artileri_berat ?? 0)}
          currentRoketCount={Number(countryDetail?.armada?.darat?.sistem_peluncur_roket ?? 0)}
          currentPertahanUdaraCount={Number(countryDetail?.armada?.darat?.pertahanan_udara_mobile ?? 0)}
          currentKendaraanTaktisCount={Number(countryDetail?.armada?.darat?.kendaraan_taktis ?? 0)}
          currentGudangCount={Number(getNestedValue(countryDetail, "gudang_senjata"))}
        />
      );
    }

    if (key === "pangkalan_laut") {
      const lautRequirements = findRequirementsForBuilding("pangkalan_laut", LAUT_REQUIREMENTS);
      return (
        <KonfirmasiInfrastrukturModal
          {...modalPropsBase}
          requirements={lautRequirements}
          missingMaterials={calculateMissingMaterials(lautRequirements, materialStocks)}
          capacityType="pangkalan_laut"
          kapalIndukCount={Number(countryDetail?.armada?.laut?.kapal_induk ?? 0)}
          kapalIndukNuklirCount={Number(countryDetail?.armada?.laut?.kapal_induk_nuklir ?? 0)}
          kapalDestroyerCount={Number(countryDetail?.armada?.laut?.kapal_destroyer ?? 0)}
          kapalKorvetCount={Number(countryDetail?.armada?.laut?.kapal_korvet ?? 0)}
          kapalSelamNuklirCount={Number(countryDetail?.armada?.laut?.kapal_selam_nuklir ?? 0)}
          kapalSelamRegulerCount={Number(countryDetail?.armada?.laut?.kapal_selam_regular ?? 0)}
          kapalRanjauCount={Number(countryDetail?.armada?.laut?.kapal_ranjau ?? 0)}
          kapalLogistikCount={Number(countryDetail?.armada?.laut?.kapal_logistik ?? 0)}
          currentPangkalanLautCount={Number(getNestedValue(countryDetail, "pangkalan_laut"))}
        />
      );
    }

    if (key === "pangkalan_udara") {
      const udaraRequirements = findRequirementsForBuilding("pangkalan_udara", UDARA_REQUIREMENTS);
      return (
        <KonfirmasiInfrastrukturModal
          {...modalPropsBase}
          requirements={udaraRequirements}
          missingMaterials={calculateMissingMaterials(udaraRequirements, materialStocks)}
          capacityType="pangkalan_udara"
          jetTemturSilamanCount={Number(countryDetail?.armada?.udara?.jet_tempur_siluman ?? 0)}
          jetTemturInterceptorCount={Number(countryDetail?.armada?.udara?.jet_tempur_interceptor ?? 0)}
          pesawatPengebomCount={Number(countryDetail?.armada?.udara?.pesawat_pengebom ?? 0)}
          helikopterSerangCount={Number(countryDetail?.armada?.udara?.helikopter_serang ?? 0)}
          pesawatPengintaiCount={Number(countryDetail?.armada?.udara?.pesawat_pengintai ?? 0)}
          droneIntaiUavCount={Number(countryDetail?.armada?.udara?.drone_intai_uav ?? 0)}
          droneKamikazeCount={Number(countryDetail?.armada?.udara?.drone_kamikaze ?? 0)}
          pesawatAngkutCount={Number(countryDetail?.armada?.udara?.pesawat_angkut ?? 0)}
          currentPangkalanUdaraCount={Number(getNestedValue(countryDetail, "pangkalan_udara"))}
        />
      );
    }

    return null;
  };

  // 🟢 Render UI
  return (
    <div className="space-y-6">
      <div className="text-xs font-semibold text-[#6B8A8A] leading-relaxed">
        Fasilitas pendukung logistik dan pertahanan yang menjadi tulang punggung kekuatan militer nasional.
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.keys(infrastrukturData).map((key) => {
          const item = infrastrukturData[key];
          if (!item) return null;
          const value = getNestedValue(countryDetail, key);
          
          const buildingConstructions = ongoingConstructions.filter(
            (c: any) => c.buildingKey === key
          );
          const queueCount = buildingConstructions.length;
          const isBuilding = queueCount > 0;
          const lastEndDate = isBuilding ? buildingConstructions[buildingConstructions.length - 1].endDate : null;

          return (
            <div 
              key={key}
              onClick={() => {
                setSelectedForBuild({ key, label: item.label });
                setIsConfirmBuildOpen(true);
              }}
              className={`relative rounded-2xl overflow-visible flex flex-col transition-all bg-[#0A1A1A] border p-5 min-h-[180px] cursor-pointer ${
                highlightKey === key 
                  ? 'border-[#00FFAA] shadow-[0_0_12px_rgba(0,255,170,0.3)]' 
                  : 'border-[#00FFAA]/20 hover:border-[#00FFAA]/50 hover:shadow-md'
              }`}
            >
              {isBuilding && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                  {formatBadgeDate(lastEndDate)}
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider flex-1 pr-2">
                  {item.label}
                </p>
                <button
                  onClick={() => handleInfoClick(key)}
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                    <span className="text-base sm:text-lg lg:text-xl font-black text-[#E0E0E0] leading-tight break-words">{formatNumber(value)}</span>
                    {isBuilding && (
                      <span className="text-xs sm:text-sm font-bold text-[#00FFAA] leading-none">
                        +{queueCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] mt-1 font-bold text-[#6B8A8A]">{item.satuan_kapasitas || "Unit"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Render modal konfirmasi jika dipilih */}
      {selectedForBuild && getModalProps()}
    </div>
  );
}