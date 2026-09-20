"use client";
import React, { useState } from "react";
import { Info } from "lucide-react";
import KonfirmasiArmadaPolisiModal from "../2_modals_konfirmasi_pembangunan/3_konfirmasi_armada_polisi_modal";
import InfoArmadaPolisiModal from "../modals_info/3_info_armada_polisi_modal";

interface TabProps {
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onCapacityFull?: (infraKey: string) => void;
  highlightKey?: string | null;
}

const polisiData = {
  markas_besar_polri: {
    key: "markas_besar_polri",
    label: "Markas Besar Polri",
    biaya_pembangunan: 93750,
    waktu_pembangunan: 90,
    lowongan_kerja: 45000,
    konsumsi_listrik: 1,
    satuan: "Unit"
  },
  akademi_kepolisian: {
    key: "akademi_kepolisian",
    label: "Akademi Kepolisian",
    biaya_pembangunan: 33750,
    waktu_pembangunan: 60,
    lowongan_kerja: 8500,
    konsumsi_listrik: 0.8,
    satuan: "Unit"
  },
  pusat_forensik: {
    key: "pusat_forensik",
    label: "Pusat Forensik",
    biaya_pembangunan: 26250,
    waktu_pembangunan: 60,
    lowongan_kerja: 2500,
    konsumsi_listrik: 0.5,
    satuan: "Unit"
  },
  kantor_polisi: {
    key: "kantor_polisi",
    label: "Kantor Polisi",
    biaya_pembangunan: 18750,
    waktu_pembangunan: 30,
    lowongan_kerja: 5500,
    konsumsi_listrik: 0.5,
    satuan: "Unit"
  },
  pos_polisi: {
    key: "pos_polisi",
    label: "Pos Polisi",
    biaya_pembangunan: 7500,
    waktu_pembangunan: 30,
    lowongan_kerja: 1200,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  network_cctv: {
    key: "network_cctv",
    label: "Network CCTV",
    biaya_pembangunan: 11250,
    waktu_pembangunan: 5,
    lowongan_kerja: 800,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  armada_mobil_polisi: {
    key: "armada_mobil_polisi",
    label: "Armada Mobil Polisi",
    biaya_pembangunan: 3750,
    waktu_pembangunan: 15,
    lowongan_kerja: 500,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  mobil_patroli_interceptor: {
    key: "mobil_patroli_interceptor",
    label: "Mobil Patroli Interceptor",
    biaya_pembangunan: 2250,
    waktu_pembangunan: 15,
    lowongan_kerja: 200,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  unit_roda_dua: {
    key: "unit_roda_dua",
    label: "Unit Roda Dua",
    biaya_pembangunan: 1125,
    waktu_pembangunan: 7,
    lowongan_kerja: 100,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  helikopter_polisi: {
    key: "helikopter_polisi",
    label: "Helikopter Polisi",
    biaya_pembangunan: 33750,
    waktu_pembangunan: 90,
    lowongan_kerja: 1500,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  unit_k9: {
    key: "unit_k9",
    label: "Unit K9",
    biaya_pembangunan: 2250,
    waktu_pembangunan: 7,
    lowongan_kerja: 800,
    konsumsi_listrik: 25,
    satuan: "Unit"
  },
  pasukan_swat: {
    key: "pasukan_swat",
    label: "Pasukan SWAT",
    biaya_pembangunan: 26250,
    waktu_pembangunan: 60,
    lowongan_kerja: 8500,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  },
  samapta: {
    key: "samapta",
    label: "Samapta",
    biaya_pembangunan: 15000,
    waktu_pembangunan: 30,
    lowongan_kerja: 12000,
    konsumsi_listrik: 0.1,
    satuan: "Unit"
  }
};

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

const getNestedValue = (obj: any, key: string): number => {
  if (obj?.[key] !== undefined && obj?.[key] !== null) return Number(obj[key]);
  if (obj?.armada_polisi?.[key] !== undefined && obj?.armada_polisi?.[key] !== null) return Number(obj.armada_polisi[key]);
  return 0;
};

export default function ArmadaPolisi({ countryDetail, setCountryDetail: _setCountryDetail }: TabProps) {
  // 🔥 State untuk Modal Info
  const [infoKey, setInfoKey] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // 🔥 State untuk Modal Konfirmasi Pembangunan
  const [selectedForBuild, setSelectedForBuild] = useState<{ key: string; label: string } | null>(null);
  const [isConfirmBuildOpen, setIsConfirmBuildOpen] = useState(false);

  const handleInfoClick = (key: string) => {
    setInfoKey(key);
    setIsInfoOpen(true);
  };

  const selectedItem = infoKey ? polisiData[infoKey as keyof typeof polisiData] : null;

  const handleInfoClose = () => {
    setIsInfoOpen(false);
    setInfoKey(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-xs font-semibold text-[#6B8A8A] leading-relaxed">
        Perangkat keamanan dalam negeri yang berperan menjaga stabilitas dan ketertiban masyarakat dari tingkat nasional hingga daerah.
      </div>

      <div className="grid grid-cols-5 gap-6">
        {(Object.keys(polisiData) as (keyof typeof polisiData)[]).map((key) => {
          const item = polisiData[key];
          const value = getNestedValue(countryDetail, key);

          return (
            <div 
              key={key}
              onClick={() => {
                setSelectedForBuild({ key, label: item.label });
                setIsConfirmBuildOpen(true);
              }}
              className="relative rounded-2xl overflow-hidden flex flex-col transition-all bg-[#0A1A1A] border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 hover:shadow-md cursor-pointer p-5 min-h-[180px]"
            >
              
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider flex-1 pr-2">
                  {item.label}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInfoClick(key);
                  }}
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                    <span className="text-base sm:text-lg lg:text-xl font-black text-[#E0E0E0] leading-tight break-words">
                      {formatNumber(value)}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1 font-bold text-[#6B8A8A]">
                    {item.satuan}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 Modal Konfirmasi Pembangunan */}
      {selectedForBuild && polisiData[selectedForBuild.key as keyof typeof polisiData] && (
        <KonfirmasiArmadaPolisiModal
          isOpen={isConfirmBuildOpen}
          onClose={() => {
            setIsConfirmBuildOpen(false);
            setSelectedForBuild(null);
          }}
          buildingLabel={selectedForBuild.label}
          buildingDescription={selectedForBuild.label}
          cost={polisiData[selectedForBuild.key as keyof typeof polisiData].biaya_pembangunan}
          waktuPembangunan={polisiData[selectedForBuild.key as keyof typeof polisiData].waktu_pembangunan}
          konsumsiListrik={polisiData[selectedForBuild.key as keyof typeof polisiData].konsumsi_listrik}
          requirements={[]}
          materialStocks={{}}
          anggaran={Number(countryDetail?.anggaran) || 0}
          missingMaterials={[]}
          onConfirm={(quantity = 1) => {
            if (!selectedForBuild) return;
            const key = selectedForBuild.key;
            const updatedDetail = { ...countryDetail };
            if (!updatedDetail.armada_polisi) updatedDetail.armada_polisi = {};

            const currentValue = Number(getNestedValue(countryDetail, key)) || 0;
            updatedDetail.armada_polisi[key] = currentValue + quantity;
            _setCountryDetail(updatedDetail);
            setIsConfirmBuildOpen(false);
            setSelectedForBuild(null);
          }}
          onMaterialClick={(resourceKey: string, label: string) => {
            console.log(`Material clicked: ${label} (${resourceKey})`);
          }}
          loadingMetadata={false}
          isDisabled={false}
        />
      )}

      {/* 🔥 Modal Info Armada Polisi */}
      {selectedItem && (
        <InfoArmadaPolisiModal
          isOpen={isInfoOpen}
          onClose={handleInfoClose}
          selectedItem={selectedItem}
          formatNumber={formatNumber}
          getNestedValue={getNestedValue}
          countryDetail={countryDetail}
        />
      )}
    </div>
  );
}