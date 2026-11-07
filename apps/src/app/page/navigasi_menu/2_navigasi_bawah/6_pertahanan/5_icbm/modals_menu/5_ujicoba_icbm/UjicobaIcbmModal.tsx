"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect } from "react";
import { X, Flame, ShieldAlert, CheckCircle2, AlertTriangle, Crosshair, MapPin } from "lucide-react";
import { executeIcbmTestLaunch, getRealisticTargetLocationName, type NeighborImpact } from "./ujicobaIcbmLogic";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";

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
        const rawLoc = data.locationName || `Koordinat (${Math.round(data.x || 0)}, ${Math.round(data.y || 0)})`;
        const { realisticName, isDomestic, isSea } = getRealisticTargetLocationName(rawLoc, userCountryName);

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
  }, [isOpen, userCountryName]);

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
    const rawTarget = selectedTarget?.rawName || selectedTarget?.name || "Wilayah Koordinat Latihan";
    const coords = selectedTarget?.coordinates;

    const result = executeIcbmTestLaunch(
      totalReadyIcbm,
      safeCurrentDate,
      userCountryName,
      rawTarget,
      coords
    );

    if (!result.success) {
      setTestResult({ message: result.message });
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
      neighborSummary = `\n\n📉 PENURUNAN DIPLOMASI:\n${result.affectedNeighbors.map((n) => `• ${n.country}: -${n.penalty} poin hubungan`).join("\n")}`;
    }

    // Buat notifikasi pertahanan resmi
    const testNotif = {
      id: `icbm-test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: `💥 UJI COBA PELUNCURAN ICBM: ${result.targetLocation}`,
      sender: `Pusat Komando Strategis Nuklir Nasional`,
      message: `Presiden dan Panglima Tertinggi! Uji coba peluncuran rudal ICBM strategis ${userCountryName} telah dilaksanakan pada ${safeCurrentDate}. Rudal berhasil meluncur dan tepat menghantam ${result.targetLocation}. Sisa persediaan rudal ICBM: ${result.remainingIcbm} unit.${neighborSummary}`,
      timestamp: safeCurrentDate,
      type: "peringkat",
      value: 0,
      isRead: false,
      tradeType: "icbm_test",
      endDateStr: safeCurrentDate,
      effectText: `Sisa Rudal ICBM: ${result.remainingIcbm} Unit`,
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
      message: result.message,
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
              <span>Mode Pemilihan Tempat Uji Coba ICBM</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </h4>
            <p className="text-[11px] text-root-text font-medium">
              Silakan <span className="text-root-accent font-bold">klik area atau negara di peta</span> untuk menetapkan koordinat target.
            </p>
          </div>
          <button
            onClick={handleCancelSelectingLocation}
            className="ml-2 px-3.5 py-1.5 rounded-xl border border-root-subtle/40 bg-root-surface text-root-text hover:text-white font-bold text-xs uppercase cursor-pointer transition-all"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <NotebookModalWrapper onClose={handleCloseModal} compact zIndexClass="z-[95]">
      <div className="flex flex-col relative font-sans">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-root-accent uppercase tracking-wide">
                Uji Coba Rudal ICBM
              </h3>
              <p className="text-[10px] text-root-subtle font-bold uppercase tracking-wider">
                Protokol Uji Luncur Balistik Strategis
              </p>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={handleCloseModal}
            className="p-1.5 sm:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1"
           appearance="custom">
            <span className="text-[10px] font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 bg-root-surface flex flex-col gap-4 text-xs">
          {testResult ? (
            <div className="rounded-xl border border-root-accent/30 bg-root-canvas p-4 flex flex-col items-center text-center gap-3 max-h-[75vh] overflow-y-auto">
              <CheckCircle2 className="h-10 w-10 text-root-accent shrink-0" />
              <div className="space-y-2 text-left w-full">
                <p className="font-black text-root-accent text-sm uppercase text-center">Laporan Resmi Peluncuran</p>
                <div className="p-3 bg-root-surface rounded-lg border border-root-accent/20 text-root-text text-xs leading-relaxed">
                  {testResult.message}
                </div>

                {/* Dampak Negara Tetangga jika ada */}
                {testResult.affectedNeighbors && testResult.affectedNeighbors.length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1.5">
                    <p className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Penurunan Hubungan Diplomatik Tetangga (-5 s/d -10):
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
                Tutup Laporan
              </SharedModalCloseButton>
            </div>
          ) : isConfirming ? (
            <div className="rounded-xl border border-rose-500/30 bg-root-canvas p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-rose-400 font-black">
                <AlertTriangle className="h-5 w-5" />
                <span>Konfirmasi Luncur Uji Coba?</span>
              </div>
              <div className="p-3 bg-root-surface rounded-lg border border-rose-500/20 text-root-text text-xs space-y-1.5">
                <p>
                  Lokasi Uji Coba: <strong className="text-root-accent">{selectedTarget?.name}</strong>
                </p>
                <p>
                  Konsumsi Amunisi: <strong className="text-rose-400">1 unit rudal ICBM</strong>
                </p>
                {selectedTarget?.isDomestic ? (
                  <p className="text-emerald-400 text-[11px] font-bold">
                    🛡️ Pengujian di poligon militer domestik tidak memengaruhi hubungan diplomatik.
                  </p>
                ) : selectedTarget?.isSea ? (
                  <p className="text-amber-400 text-[11px] leading-relaxed">
                    ⚠️ Pengujian di perairan laut akan menurunkan hubungan dengan negara tetangga dekat (-5 s/d -10).
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-4 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-text font-bold text-xs hover:text-root-accent transition-all cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  onClick={handleLaunchTest}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Flame className="h-4 w-4" />
                  Konfirmasi Luncurkan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Status Info Box */}
              <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-root-accent/10 pb-2">
                  <span className="text-root-subtle font-bold uppercase text-[10px]">Persediaan ICBM Siap Tempur</span>
                  <span className="font-black text-root-accent text-sm">
                    {totalReadyIcbm.toLocaleString("id-ID")} <span className="text-[10px] text-root-subtle font-normal">Unit</span>
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-root-accent/10 pb-2">
                  <span className="text-root-subtle font-bold uppercase text-[10px]">Kebutuhan Uji Coba</span>
                  <span className="font-black text-rose-400 text-sm">1 Unit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-root-subtle font-bold uppercase text-[10px]">Lokasi Sasaran Terpilih</span>
                  <span className="font-bold text-root-text text-xs flex items-center gap-1">
                    <Crosshair className="h-3.5 w-3.5 text-rose-400" />
                    {selectedTarget ? (
                      <span className="text-root-accent font-black">{selectedTarget.name}</span>
                    ) : (
                      <span className="text-root-subtle italic">Belum dipilih (Klik tombol di bawah)</span>
                    )}
                  </span>
                </div>
              </div>

              {selectedTarget && (
                <div className="rounded-xl border border-root-accent/30 bg-root-accent/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-root-accent" />
                    <span className="text-root-text text-xs font-bold">
                      Target Terkunci: <strong className="text-root-accent">{selectedTarget.name}</strong>
                    </span>
                  </div>
                  <button
                    onClick={handleStartSelectingLocation}
                    className="text-[10px] text-root-accent hover:underline font-bold cursor-pointer"
                  >
                    Ganti Titik
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-root-accent/10 bg-root-canvas/60 p-3.5 text-[11px] text-root-subtle leading-relaxed">
                <ShieldAlert className="h-4 w-4 text-amber-400 inline mr-1.5 mb-0.5" />
                Tekan tombol <strong className="text-root-accent">"Pilih Tempat ICBM"</strong> untuk membuka tampilan peta secara penuh, lalu klik koordinat atau negara tujuan untuk menetapkan target latihan.
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
                  {totalReadyIcbm <= 0 ? "Stok ICBM Kosong" : "Pilih Tempat ICBM"}
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20 cursor-pointer active:scale-98"
                  >
                    <Flame className="h-4 w-4" />
                    Luncurkan Uji Coba ke {selectedTarget.name}
                  </button>
                  <button
                    onClick={handleStartSelectingLocation}
                    className="w-full py-2 rounded-xl border border-root-accent/30 bg-root-canvas hover:bg-root-surface text-root-accent font-bold uppercase text-[11px] cursor-pointer transition-all"
                  >
                    Pilih Tempat ICBM Lain
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