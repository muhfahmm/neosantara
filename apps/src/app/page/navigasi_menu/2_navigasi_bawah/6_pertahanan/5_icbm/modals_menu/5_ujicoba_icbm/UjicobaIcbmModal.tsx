"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect } from "react";
import { Flame, ShieldAlert, CheckCircle2, AlertTriangle, Crosshair, MapPin } from "lucide-react";
import { executeIcbmTestLaunch, getRealisticTargetLocationName, type NeighborImpact } from "./ujicobaIcbmLogic";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import { formatIcbmDate, useIcbmMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation";

interface UjicobaIcbmModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string | Date;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  totalReadyIcbm: number;
}

export default function UjicobaIcbmModal({
  isOpen,
  onClose,
  currentDate,
  countryDetail,
  setCountryDetail,
  totalReadyIcbm,
}: UjicobaIcbmModalProps) {
  const { language, translate } = useIcbmMenuTranslation();
  const [selectedTarget, setSelectedTarget] = useState<{
    name: string;
    rawName: string;
    isDomestic: boolean;
    isSea: boolean;
    coordinates?: { x: number; y: number };
  } | null>(null);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [testResult, setTestResult] = useState<{
    message: string;
    affectedNeighbors?: NeighborImpact[];
  } | null>(null);

  const formatDateString = (date?: string | Date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const safeCurrentDate = formatDateString(currentDate) || formatDateString(new Date());
  const userCountryName =
    countryDetail?.country || countryDetail?.nama_negara || countryDetail?.nama || "Indonesia";

  // Tangani event saat user memilih titik di map
  useEffect(() => {
    if (!isOpen) return;

    const handleTargetSelected = (event: any) => {
      const data = event.detail;
      if (data) {
        const rawLoc = data.locationName || translate("test.coordinates", {
          x: Math.round(data.x || 0),
          y: Math.round(data.y || 0),
        });
        const { realisticName, isDomestic, isSea } = getRealisticTargetLocationName(rawLoc, userCountryName, translate);

        setSelectedTarget({
          name: realisticName,
          rawName: rawLoc,
          isDomestic,
          isSea,
          coordinates: { x: data.x, y: data.y },
        });
        setIsSelectingOnMap(false);
      }
    };

    window.addEventListener("icbm_target_selected", handleTargetSelected);
    return () => {
      window.removeEventListener("icbm_target_selected", handleTargetSelected);
    };
  }, [isOpen, userCountryName, translate]);

  const handleStartSelectingLocation = () => {
    setIsSelectingOnMap(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("start_icbm_target_selection", {
          detail: { active: true },
        })
      );
    }
  };

  const handleCancelSelectingLocation = () => {
    setIsSelectingOnMap(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("start_icbm_target_selection", {
          detail: { active: false },
        })
      );
    }
  };

  const handleLaunchTest = () => {
    const rawTarget = selectedTarget?.rawName || selectedTarget?.name || translate("test.targetLocationGeneric");
    const coords = selectedTarget?.coordinates;

    const result = executeIcbmTestLaunch(
      totalReadyIcbm,
      safeCurrentDate,
      userCountryName,
      rawTarget,
      coords,
      translate
    );

    if (!result.success) {
      setTestResult({
        message: translate("test.noStockMessage", {
          country: userCountryName,
        }),
      });
      return;
    }

    // Trigger efek ledakan / keclap putih di koordinat target jika ada
    if (typeof window !== "undefined" && coords) {
      window.dispatchEvent(
        new CustomEvent("trigger_icbm_explosion_flash", {
          detail: {
            x: coords.x,
            y: coords.y,
            targetName: result.targetLocation,
          },
        })
      );
    }

    let neighborSummary = "";
    if (result.affectedNeighbors && result.affectedNeighbors.length > 0) {
      neighborSummary = `\n\n📉 ${translate("test.diplomacyLabel")}\n${result.affectedNeighbors.map((n) => `• ${translate("test.relationPenalty", { country: n.country, penalty: n.penalty })}`).join("\n")}`;
    }

    // Buat notifikasi pertahanan resmi
    const titleKey = "navigation_icbm_menu.test.notificationTitle";
    const senderKey = "navigation_icbm_menu.test.notificationSender";
    const messageKey = "navigation_icbm_menu.test.notificationMessage";
    const effectTextKey = "navigation_icbm_menu.test.notificationEffect";
    const titleParams = { target: result.targetLocation || "" };
    const messageParams = {
      country: userCountryName,
      date: formatIcbmDate(safeCurrentDate, language),
      target: result.targetLocation || "",
      count: result.remainingIcbm,
      neighborSummary,
    };
    const effectTextParams = { count: result.remainingIcbm };
    const testNotif = {
      id: `icbm-test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: translate("test.notificationTitle", titleParams),
      titleKey,
      titleParams,
      sender: translate("test.notificationSender"),
      senderKey,
      message: translate("test.notificationMessage", messageParams),
      messageKey,
      messageParams,
      timestamp: safeCurrentDate,
      type: "peringkat",
      value: 0,
      isRead: false,
      tradeType: "icbm_test",
      endDateStr: safeCurrentDate,
      effectText: translate("test.notificationEffect", effectTextParams),
      effectTextKey,
      effectTextParams,
      isHandled: false,
    };

    setCountryDetail((prev: any) => {
      const existingPending = Array.isArray(prev?.pending_notifications)
        ? prev.pending_notifications
        : [];

      // Update atau kurangi icbmBuildTask jika ada agar tidak mengembalikan completedCount yang lama
      let updatedTask = prev?.icbmBuildTask;
      if (updatedTask && typeof updatedTask === "object") {
        const currentQty = Math.max(0, Number(updatedTask.quantity) || 0);
        if (currentQty > 0) {
          const nextQty = Math.max(0, currentQty - 1);
          updatedTask = nextQty > 0 ? { ...updatedTask, quantity: nextQty } : null;
        }
      }

      const consumedCount = Math.max(0, Number(prev?.icbm_consumed || 0) + 1);

      return {
        ...(prev || {}),
        icbm: result.remainingIcbm,
        icbm_jumlah: result.remainingIcbm,
        icbmBuildTask: updatedTask,
        icbm_consumed: consumedCount,
        pending_notifications: [testNotif, ...existingPending],
      };
    });

    setTestResult({
      message: result.isDomesticTest
        ? translate("test.domesticResult", { country: userCountryName, target: result.targetLocation || "" })
        : result.isSeaTest
          ? translate("test.seaResult", { country: userCountryName, target: result.targetLocation || "" })
          : translate("test.targetResult", { country: userCountryName, target: result.targetLocation || "" }),
      affectedNeighbors: result.affectedNeighbors,
    });
    setIsConfirming(false);
  };

  const handleCloseModal = () => {
    handleCancelSelectingLocation();
    setSelectedTarget(null);
    setTestResult(null);
    setIsConfirming(false);
    onClose();
  };

  if (!isOpen) return null;

  // JIKA SEDANG MEMILIH TEMPAT DI MAP:
  // Munculkan floating HUD bar di bagian atas layar agar user leluasa melihat dan mengklik map!
  if (isSelectingOnMap) {
    return (
      <div className="fixed top-6 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none animate-fadeIn">
        <div className="bg-root-canvas/95 border-2 border-root-accent  rounded-2xl px-6 py-3.5 shadow-[0_0_25px_rgba(0,255,170,0.3)] flex items-center gap-4 pointer-events-auto">
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-root-accent uppercase tracking-wide flex items-center gap-2">
              <span>{translate("test.mapMode")}</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </h4>
            <p className="text-[11px] text-root-text font-medium">
              {translate("test.mapInstruction")}
            </p>
          </div>
          <button
            onClick={handleCancelSelectingLocation}
            className="ml-2 px-3.5 py-1.5 rounded-xl border border-root-subtle/40 bg-root-surface text-root-text hover:text-white font-bold text-xs uppercase cursor-pointer transition-all"
          >
            {translate("common.cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <NotebookModalWrapper onClose={handleCloseModal} zIndexClass="z-[95]">
      <div className="root-modal-util-b74379da23 font-sans">
        
        <div className="satisfaction-modal-header root-modal-util-9462ce2345">
          <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
            <div className="root-modal-util-08dfbca033">
              <div className="root-modal-util-739d92b232">
                <Flame aria-hidden="true" className="root-modal-util-d252947d10 text-rose-400 animate-pulse" />
              </div>
              <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                {translate("test.title")}
                <span className="ml-2 align-middle text-[9px] font-semibold tracking-normal text-root-subtle normal-case">
                  {translate("test.subtitle")}
                </span>
              </h2>
            </div>
          </div>
          <div className="root-modal-util-08dfbca033">
            <SharedModalCloseButton onClick={handleCloseModal} />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 bg-root-surface flex flex-col gap-4 text-xs">
          {testResult ? (
            <div className="rounded-xl border border-root-accent/30 bg-root-canvas p-4 flex flex-col items-center text-center gap-3 max-h-[75vh] overflow-y-auto">
              <CheckCircle2 className="h-10 w-10 text-root-accent shrink-0" />
              <div className="space-y-2 text-left w-full">
                <p className="font-black text-root-accent text-sm uppercase text-center">{translate("test.reportTitle")}</p>
                <div className="p-3 bg-root-surface rounded-lg border border-root-accent/20 text-root-text text-xs leading-relaxed">
                  {testResult.message}
                </div>

                {/* Dampak Negara Tetangga jika ada */}
                {testResult.affectedNeighbors && testResult.affectedNeighbors.length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1.5">
                    <p className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {translate("test.neighborImpact")}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-root-text">
                      {testResult.affectedNeighbors.map((n, idx) => (
                        <div key={idx} className="flex justify-between bg-root-canvas/60 px-2 py-1 rounded">
                          <span>{n.country}</span>
                          <span className="text-rose-400 font-bold">-{n.penalty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              <SharedModalCloseButton
                onClick={handleCloseModal}
                className="mt-2 px-6 py-2 rounded-xl bg-root-accent text-root-canvas font-black uppercase text-xs hover:bg-root-accent/80 transition-all cursor-pointer"
               appearance="custom">
                {translate("test.closeReport")}
              </SharedModalCloseButton>
            </div>
          ) : isConfirming ? (
            <div className="rounded-xl border border-rose-500/30 bg-root-canvas p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-rose-400 font-black">
                <AlertTriangle className="h-5 w-5" />
                <span>{translate("test.confirmTitle")}</span>
              </div>
              <div className="p-3 bg-root-surface rounded-lg border border-rose-500/20 text-root-text text-xs space-y-1.5">
                <p>
                  {translate("test.location")} <strong className="text-root-accent">{selectedTarget?.name}</strong>
                </p>
                <p>
                  {translate("test.ammunition")}
                </p>
                {selectedTarget?.isDomestic ? (
                  <p className="text-emerald-400 text-[11px] font-bold">
                    🛡️ {translate("test.domesticWarning")}
                  </p>
                ) : selectedTarget?.isSea ? (
                  <p className="text-amber-400 text-[11px] leading-relaxed">
                    ⚠️ {translate("test.seaWarning")}
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-4 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-text font-bold text-xs hover:text-root-accent transition-all cursor-pointer"
                >
                  {translate("test.back")}
                </button>
                <button
                  onClick={handleLaunchTest}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Flame className="h-4 w-4" />
                  {translate("test.confirmLaunch")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Status Info Box */}
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-root-accent/10 pb-2">
                  <span className="text-root-subtle font-bold uppercase text-[10px]">{translate("test.readyStock")}</span>
                  <span className="font-black text-root-accent text-sm">
                    {totalReadyIcbm.toLocaleString(language)} <span className="text-[10px] text-root-subtle font-normal">{translate("common.unit")}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-root-accent/10 pb-2">
                  <span className="text-root-subtle font-bold uppercase text-[10px]">{translate("test.testRequirement")}</span>
                  <span className="font-black text-rose-400 text-sm">1 {translate("common.unit")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-root-subtle font-bold uppercase text-[10px]">{translate("test.selectedLocation")}</span>
                  <span className="font-bold text-root-text text-xs flex items-center gap-1">
                    <Crosshair className="h-3.5 w-3.5 text-rose-400" />
                    {selectedTarget ? (
                      <span className="text-root-accent font-black">{selectedTarget.name}</span>
                    ) : (
                      <span className="text-root-subtle italic">{translate("test.notSelected")}</span>
                    )}
                  </span>
                </div>
              </div>

              {selectedTarget && (
                <div className="rounded-xl border border-root-accent/30 bg-root-accent/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-root-accent" />
                    <span className="text-root-text text-xs font-bold">
                      {translate("test.targetLocked")} <strong className="text-root-accent">{selectedTarget.name}</strong>
                    </span>
                  </div>
                  <button
                    onClick={handleStartSelectingLocation}
                    className="text-[10px] text-root-accent hover:underline font-bold cursor-pointer"
                  >
                    {translate("test.changePoint")}
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-root-accent/10 bg-root-canvas/60 p-3.5 text-[11px] text-root-subtle leading-relaxed">
                <ShieldAlert className="h-4 w-4 text-amber-400 inline mr-1.5 mb-0.5" />
                {translate("test.selectInstruction")}
              </div>

              {/* ACTION BUTTON: Pilih Tempat ICBM atau Luncurkan jika sudah terpilih */}
              {!selectedTarget ? (
                <button
                  onClick={handleStartSelectingLocation}
                  disabled={totalReadyIcbm <= 0}
                  className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    totalReadyIcbm <= 0
                      ? "bg-root-subtle/20 text-root-subtle cursor-not-allowed border border-root-subtle/30"
                      : "bg-root-accent hover:bg-root-accent/80 text-root-canvas cursor-pointer active:scale-98 shadow-[0_0_15px_rgba(0,255,170,0.2)]"
                  }`}
                >
                  <Crosshair className="h-4 w-4" />
                  {totalReadyIcbm <= 0 ? translate("test.emptyStock") : translate("test.selectPlace")}
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20 cursor-pointer active:scale-98"
                  >
                    <Flame className="h-4 w-4" />
                    {translate("test.launchToTarget", { target: selectedTarget.name })}
                  </button>
                  <button
                    onClick={handleStartSelectingLocation}
                    className="w-full py-2 rounded-xl border border-root-accent/30 bg-root-canvas hover:bg-root-surface text-root-accent font-bold uppercase text-[11px] cursor-pointer transition-all"
                  >
                    {translate("test.chooseOther")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </NotebookModalWrapper>
  );
}