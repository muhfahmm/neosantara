"use client"
import React, { useEffect, useRef, useState } from "react";
import { Eye, Bomb, Search } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import MenuInfoButton from "../../MenuInfoButton";
import Spionase from "./table_menu/1_tabel_spionase";
import Sabotase from "./table_menu/2_tabel_sabotase";
import CovertOperationResultModal from "@/app/page/detail_negara/3_operasi_militer/CovertOperationResultModal";
import {
  resolveCovertOperation,
  type CovertOperationResult,
  type CovertOperationType,
} from "@/app/page/detail_negara/3_operasi_militer/covertOperationLogic";
import {
  checkTravelFuel,
  consumeTravelFuel,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  prefetchedAllCountries?: any[]; // 🔥 Tambahkan prop ini!
}

export default function IntelijenModal({ isOpen, onClose, countryDetail, setCountryDetail, prefetchedAllCountries }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'spionase' | 'sabotase'>('spionase');
  const [searchQuery, setSearchQuery] = useState("");
  const [covertOperationResult, setCovertOperationResult] = useState<CovertOperationResult | null>(null);
  const pendingCovertOperationsRef = useRef(new Map<string, CovertOperationType>());
  const launchedTravelFuelIdsRef = useRef(new Set<string>());

  useEffect(() => {
    const handleCovertOperationArrival = (event: Event) => {
      const path = (event as CustomEvent<{ pathId?: string; targetCountry?: string }>).detail;
      const operation = path?.pathId ? pendingCovertOperationsRef.current.get(path.pathId) : undefined;
      if (!path?.pathId || !operation || !path.targetCountry) return;

      pendingCovertOperationsRef.current.delete(path.pathId);
      const result = resolveCovertOperation(operation, countryDetail);
      setCovertOperationResult({ operation, targetCountry: path.targetCountry, ...result });
    };

    window.addEventListener('neosantara_covert_operation_arrived', handleCovertOperationArrival);
    return () => window.removeEventListener('neosantara_covert_operation_arrived', handleCovertOperationArrival);
  }, [countryDetail]);

  if (!isOpen) return null;

  const anggaran = countryDetail?.anggaran || 0;
  const launchCovertOperation = (operation: CovertOperationType, targetCountry: string, pathId: string) => {
    pendingCovertOperationsRef.current.set(pathId, operation);
    window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
      detail: {
        pathId,
        kind: operation,
        senderCountry: countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id,
        targetCountry,
      },
    }));
  };

  // 🔥 Logika aksi untuk Spionase
  const handleSpionaseAction = (target: { countryName: string }, fuelCost: number, pathId: string) => {
    if (!countryDetail || !checkTravelFuel(countryDetail, fuelCost).ok) return;
    if (anggaran < 10000000) {
      alert("Kas negara tidak mencukupi untuk misi spionase!");
      return;
    }
    if (launchedTravelFuelIdsRef.current.has(pathId)) return;
    const updatedDetail = consumeTravelFuel(
      { ...countryDetail, anggaran: anggaran - 10000000 },
      fuelCost,
      {
        id: pathId,
        date: String(countryDetail?.currentDate || countryDetail?.gameDate || new Date().toISOString()).slice(0, 10),
        targetCountry: target.countryName,
        travelType: "spionase",
        amount: fuelCost,
      },
    );
    if (updatedDetail === countryDetail) return;
    launchedTravelFuelIdsRef.current.add(pathId);
    setCountryDetail(updatedDetail);
    launchCovertOperation('spionase', target.countryName, pathId);
  };

  // 🔥 Logika aksi untuk Sabotase
  const handleSabotaseAction = (target: { countryName: string }, fuelCost: number, pathId: string) => {
    if (!countryDetail || !checkTravelFuel(countryDetail, fuelCost).ok) return;
    if (anggaran < 20000000) {
      alert("Kas negara tidak mencukupi untuk operasi sabotase!");
      return;
    }
    if (launchedTravelFuelIdsRef.current.has(pathId)) return;
    const updatedDetail = consumeTravelFuel(
      { ...countryDetail, anggaran: anggaran - 20000000 },
      fuelCost,
      {
        id: pathId,
        date: String(countryDetail?.currentDate || countryDetail?.gameDate || new Date().toISOString()).slice(0, 10),
        targetCountry: target.countryName,
        travelType: "sabotase",
        amount: fuelCost,
      },
    );
    if (updatedDetail === countryDetail) return;
    launchedTravelFuelIdsRef.current.add(pathId);
    setCountryDetail(updatedDetail);
    launchCovertOperation('sabotase', target.countryName, pathId);
  };

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="root-modal-util-b74379da23 intelijen-modal">

          <div className="satisfaction-modal-header root-modal-util-9462ce2345">
            <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
              <div className="root-modal-util-08dfbca033">
                <div className="root-modal-util-739d92b232">
                  {activeTab === 'spionase' ? (
                    <Eye aria-hidden="true" className="root-modal-util-d252947d10 text-root-accent animate-pulse" />
                  ) : (
                    <Bomb aria-hidden="true" className="root-modal-util-d252947d10 text-orange-400 animate-pulse" />
                  )}
                </div>
                <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                  {activeTab === 'spionase' ? 'Spionase' : 'Sabotase'}
                </h2>
              </div>
            </div>
            <div className="root-modal-util-08dfbca033">
              <MenuInfoButton
                title="Intelijen"
                description="Gunakan Spionase untuk mengumpulkan informasi negara lain dan Sabotase untuk menjalankan operasi rahasia. Setiap operasi membutuhkan anggaran dan dapat menimbulkan konsekuensi diplomatik; pilih sasaran dengan mempertimbangkan risiko serta hasil yang diharapkan."
              />
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col bg-root-surface">
          <div className="intelijen-toolbar flex shrink-0 flex-col gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <RootModalTabs
              compact
              className="intelijen-tabs w-fit"
              items={[
                {
                  label: "Spionase",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  isActive: activeTab === "spionase",
                  onClick: () => setActiveTab("spionase"),
                },
                {
                  label: "Sabotase",
                  icon: <Bomb className="h-3.5 w-3.5" />,
                  isActive: activeTab === "sabotase",
                  onClick: () => setActiveTab("sabotase"),
                },
              ]}
            />
            <div className="intelijen-search relative w-full sm:max-w-64">
              <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-root-accent/60" />
              <input
                type="search"
                aria-label="Cari negara target"
                placeholder="Cari negara target..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="intelijen-search-input h-9 w-full rounded-lg border border-root-accent/30 bg-[#051111] py-1 pl-8 pr-3 text-xs text-root-text placeholder-root-subtle transition-colors focus:border-root-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="intelijen-results min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="h-full min-h-0 w-full">
              {activeTab === 'spionase' && (
                <Spionase
                  prefetchedAllCountries={prefetchedAllCountries}
                  countryDetail={countryDetail}
                  onAction={handleSpionaseAction}
                  searchQuery={searchQuery}
                />
              )}
              {activeTab === 'sabotase' && (
                <Sabotase
                  prefetchedAllCountries={prefetchedAllCountries}
                  countryDetail={countryDetail}
                  onAction={handleSabotaseAction}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        </div>
        </div>
      </NotebookModalWrapper>

      <CovertOperationResultModal
        result={covertOperationResult}
        onClose={() => setCovertOperationResult(null)}
      />
    </>
  );
}