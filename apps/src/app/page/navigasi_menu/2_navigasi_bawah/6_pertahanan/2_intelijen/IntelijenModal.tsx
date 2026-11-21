"use client"
import React, { useEffect, useRef, useState } from "react";
import { Eye, Bomb } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalSearchToolbar from "@/app/page/root_modals_design_menu/RootModalSearchToolbar";
import MenuInfoButton from "../../MenuInfoButton";
import Spionase from "./table_menu/1_tabel_spionase";
import Sabotase from "./table_menu/2_tabel_sabotase";
import ResultSpionaseModals from "@/app/page/detail_negara/3_operasi_militer/2_spionase/ResultSpionaseModals";
import ResultSabotaseModals from "@/app/page/detail_negara/3_operasi_militer/3_sabotase/ResultSabotaseModals";
import {
  resolveSpionaseOperation,
  type SpionaseOperationResult,
} from "@/app/page/detail_negara/3_operasi_militer/2_spionase/logic/spionaseLogic";
import {
  resolveSabotaseOperation,
  type SabotaseOperationResult,
} from "@/app/page/detail_negara/3_operasi_militer/3_sabotase/logic/sabotaseLogic";
import {
  checkTravelFuel,
  consumeTravelFuel,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import {
  getCovertPersonnel,
  consumePersonnel,
} from "@/app/page/detail_negara/3_operasi_militer/covertPersonnelStorage";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  prefetchedAllCountries?: any[]; // 🔥 Tambahkan prop ini!
}

export default function IntelijenModal({ isOpen, onClose, countryDetail, setCountryDetail, prefetchedAllCountries }: ModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'spionase' | 'sabotase'>('spionase');
  const [isPersonnelRecruitModalOpen, setIsPersonnelRecruitModalOpen] = useState(false);
  const [isCovertConfirmationOpen, setIsCovertConfirmationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [spionaseResult, setSpionaseResult] = useState<SpionaseOperationResult | null>(null);
  const [sabotaseResult, setSabotaseResult] = useState<SabotaseOperationResult | null>(null);
  const pendingCovertOperationsRef = useRef(new Map<string, {
    operation: 'spionase' | 'sabotase';
    operationTarget?: string;
    successChance: number;
    succeeded: boolean;
  }>());
  const launchedTravelFuelIdsRef = useRef(new Set<string>());
  const tr = (operation: 'spionase' | 'sabotase', key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_${operation === 'spionase' ? 'espionage' : 'sabotage'}.${key}`, params);
  const handleClose = () => {
    setIsPersonnelRecruitModalOpen(false);
    setIsCovertConfirmationOpen(false);
    onClose();
  };

  useEffect(() => {
    const handleCovertOperationResolved = (event: Event) => {
      const detail = (event as CustomEvent<{
        pathId?: string;
        kind?: string;
        targetCountry?: string;
        operationSucceeded?: boolean;
        losses?: SabotaseOperationResult['losses'];
        militaryReport?: SpionaseOperationResult['militaryReport'];
        economicReport?: SpionaseOperationResult['economicReport'];
      }>).detail;
      if (
        (detail?.kind !== 'spionase' && detail?.kind !== 'sabotase') ||
        !detail.pathId ||
        !detail.targetCountry ||
        typeof detail.operationSucceeded !== 'boolean'
      ) return;

      const covertInfo = pendingCovertOperationsRef.current.get(detail.pathId);
      if (!covertInfo || covertInfo.operation !== detail.kind) return;

      pendingCovertOperationsRef.current.delete(detail.pathId);
      if (detail.kind === 'spionase') {
        setSpionaseResult({
          operation: 'spionase',
          targetCountry: detail.targetCountry,
          operationTarget: covertInfo.operationTarget,
          successChance: covertInfo.successChance,
          succeeded: detail.operationSucceeded,
          militaryReport: detail.militaryReport,
          economicReport: detail.economicReport,
        });
      } else {
        setSabotaseResult({
          operation: 'sabotase',
          targetCountry: detail.targetCountry,
          operationTarget: covertInfo.operationTarget,
          successChance: covertInfo.successChance,
          succeeded: detail.operationSucceeded,
          losses: detail.losses,
        });
      }
    };

    window.addEventListener('neosantara_covert_operation_resolved', handleCovertOperationResolved);
    return () => window.removeEventListener('neosantara_covert_operation_resolved', handleCovertOperationResolved);
  }, []);

  if (!isOpen) return null;

  const launchCovertOperation = (operation: 'spionase' | 'sabotase', targetCountry: string, pathId: string, operationTarget?: string) => {
    const result = operation === 'spionase'
      ? resolveSpionaseOperation(countryDetail, operationTarget)
      : resolveSabotaseOperation(countryDetail, operationTarget);
    pendingCovertOperationsRef.current.set(pathId, {
      operation,
      operationTarget,
      successChance: result.successChance,
      succeeded: result.succeeded,
    });
    window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
      detail: {
        pathId,
        kind: operation,
        senderCountry: countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id,
        targetCountry,
        operationTarget,
        operationSucceeded: result.succeeded,
      },
    }));
  };

  // 🔥 Logika aksi untuk Spionase
  const handleSpionaseAction = (target: { countryName: string }, fuelCost: number, pathId: string, operationTarget: string, personnelCount: number) => {
    if (!countryDetail || !checkTravelFuel(countryDetail, fuelCost).ok) return;
    if (!Number.isInteger(personnelCount) || personnelCount < 1) return;
    const personnel = getCovertPersonnel();
    if (personnel.mataMata < personnelCount) {
      alert(tr('spionase', 'confirmation.insufficientPersonnel', {
        available: personnel.mataMata,
        required: personnelCount,
      }));
      return;
    }
    if (launchedTravelFuelIdsRef.current.has(pathId)) return;
    if (!consumePersonnel('mataMata', personnelCount)) return;

    const updatedDetail = consumeTravelFuel(
      countryDetail,
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
    launchCovertOperation('spionase', target.countryName, pathId, operationTarget);
  };

  // 🔥 Logika aksi untuk Sabotase
  const handleSabotaseAction = (target: { countryName: string }, fuelCost: number, pathId: string, operationTarget: string, personnelCount: number) => {
    if (!countryDetail || !checkTravelFuel(countryDetail, fuelCost).ok) return;
    if (!Number.isInteger(personnelCount) || personnelCount < 1) return;
    const personnel = getCovertPersonnel();
    if (personnel.penyabot < personnelCount) {
      alert(tr('sabotase', 'confirmation.insufficientPersonnel', {
        available: personnel.penyabot,
        required: personnelCount,
      }));
      return;
    }
    if (launchedTravelFuelIdsRef.current.has(pathId)) return;
    if (!consumePersonnel('penyabot', personnelCount)) return;

    const updatedDetail = consumeTravelFuel(
      countryDetail,
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
    launchCovertOperation('sabotase', target.countryName, pathId, operationTarget);
  };

  return (
    <>
      <NotebookModalWrapper onClose={handleClose} isHidden={isPersonnelRecruitModalOpen || isCovertConfirmationOpen}>
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
                  {tr(activeTab, 'menu.title')}
                </h2>
              </div>
            </div>
            <div className="root-modal-util-08dfbca033">
              <MenuInfoButton
                title={tr(activeTab, 'menu.infoTitle')}
                description={tr(activeTab, 'menu.infoDescription')}
              />
              <RootModalCloseButton onClick={handleClose} />
            </div>
          </div>

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col bg-root-surface">
            <RootModalSearchToolbar
              items={[
                {
                  label: tr(activeTab, 'menu.spionageTab'),
                  icon: <Eye className="h-3.5 w-3.5" />,
                  isActive: activeTab === "spionase",
                  onClick: () => setActiveTab("spionase"),
                },
                {
                  label: tr(activeTab, 'menu.sabotageTab'),
                  icon: <Bomb className="h-3.5 w-3.5" />,
                  isActive: activeTab === "sabotase",
                  onClick: () => setActiveTab("sabotase"),
                },
              ]}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={tr(activeTab, 'menu.searchPlaceholder')}
              searchAriaLabel={tr(activeTab, 'menu.searchAriaLabel')}
            />
          <div className="intelijen-results min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="h-full min-h-0 w-full">
              {activeTab === 'spionase' && (
                <Spionase
                  prefetchedAllCountries={prefetchedAllCountries}
                  countryDetail={countryDetail}
                  updatePlayerCountryDetail={setCountryDetail}
                  onRecruitModalVisibilityChange={setIsPersonnelRecruitModalOpen}
                  onConfirmationModalVisibilityChange={setIsCovertConfirmationOpen}
                  onAction={handleSpionaseAction}
                  searchQuery={searchQuery}
                />
              )}
              {activeTab === 'sabotase' && (
                <Sabotase
                  prefetchedAllCountries={prefetchedAllCountries}
                  countryDetail={countryDetail}
                  updatePlayerCountryDetail={setCountryDetail}
                  onRecruitModalVisibilityChange={setIsPersonnelRecruitModalOpen}
                  onConfirmationModalVisibilityChange={setIsCovertConfirmationOpen}
                  onAction={handleSabotaseAction}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        </div>
        </div>
      </NotebookModalWrapper>

      <ResultSpionaseModals
        result={spionaseResult}
        onClose={() => setSpionaseResult(null)}
      />
      <ResultSabotaseModals
        result={sabotaseResult}
        onClose={() => setSabotaseResult(null)}
      />
    </>
  );
}