"use client";
import React from "react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface InfoBangunanModalProps {
  label: string;
  perCount: number;
  konsumsiUnit: number;
  biaya: number;
  waktu?: number;
  pendapatanUnit?: number;
  produksiUnit?: number;
  satuan?: string;
  onClose: () => void;
}

export default function InfoBangunanModal({
  label,
  perCount,
  konsumsiUnit,
  biaya,
  waktu,
  pendapatanUnit,
  produksiUnit,
  satuan,
  onClose,
}: InfoBangunanModalProps) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_construction_public_places.info.${key}`, params);
  const hasRevenue = (pendapatanUnit !== undefined && pendapatanUnit > 0) || (satuan === 'NEO' && produksiUnit !== undefined && produksiUnit > 0);
  const revenueVal = pendapatanUnit || (satuan === 'NEO' ? produksiUnit : 0) || 0;
  const totalRevenue = revenueVal * perCount;

  const hasProduction = !hasRevenue && produksiUnit !== undefined && produksiUnit > 0;
  const prodVal = produksiUnit || 0;
  const totalProd = prodVal * perCount;

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-b74379da23">
        <RootInfoModalHeader title={tr("title", { building: label })} onClose={onClose} size="standard" />

        <div className={`root-info-modal-content p-4 sm:p-5 relative z-10 flex-1 overflow-y-auto space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
          <div className={`root-info-modal-summary flex flex-col gap-1 border border-root-accent/20 bg-root-canvas p-3 sm:p-4 ${rootBorderRadius.card}`}>
            {hasRevenue && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-root-muted">{tr("dailyRevenue", { unit: satuan || "NEO" })}</span>
                  <span className="font-black text-xs text-emerald-400">
                    {totalRevenue.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {satuan || 'NEO'}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-4 text-root-muted">
                  <span>{tr("revenuePerUnit")}</span>
                  <span className="text-root-text font-bold">{revenueVal.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {hasProduction && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-root-muted">{tr("dailyProduction", { unit: satuan || "Unit" })}</span>
                  <span className="font-black text-xs text-emerald-400">
                    {totalProd.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {satuan || 'Unit'}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-4 text-root-muted">
                  <span>{tr("productionPerUnit")}</span>
                  <span className="text-root-text font-bold">{prodVal.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-root-muted">{tr("electricityTotal")}</span>
              <span className="text-xs font-black text-rose-400">{(konsumsiUnit * perCount).toLocaleString('id-ID', { maximumFractionDigits: 2 })} MW</span>
            </div>
            <div className="flex justify-between items-center pl-4">
              <span className="text-root-muted">{tr("electricityUnit")}</span>
              <span className="text-rose-400 font-bold">{konsumsiUnit.toLocaleString('id-ID', { maximumFractionDigits: 4 })} MW</span>
            </div>
            <div className="flex justify-between items-center border-t border-root-accent/10 pt-1 mt-1">
              <span className="text-root-muted">{tr("cost")}</span>
              <span className="text-xs font-black text-root-accent">{biaya.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </div>
            {waktu !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-root-muted">{tr("buildTime")}</span>
                <span className="text-xs font-bold text-root-text">{waktu} {tr(waktu === 1 ? "day" : "days")}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-root-muted">{tr("buildingCount")}</span>
              <span className="text-xs font-black text-root-accent">{perCount} unit</span>
            </div>
          </div>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}