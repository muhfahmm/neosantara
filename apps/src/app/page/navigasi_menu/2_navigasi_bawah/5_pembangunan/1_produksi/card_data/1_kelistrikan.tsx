"use client"
import { Zap } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

const KEYS = [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin",
  "pembangkit_listrik_tenaga_panas_bumi",
  "pembangkit_listrik_tenaga_hidrogen",
  "pembangkit_listrik_tenaga_gelombang_laut",
  "pembangkit_listrik_tenaga_fusi_nuklir",
];

export default function KelistrikanTab(props: any) {
  const { t } = useLanguage();
  return <BaseProduksiGrid {...props} keys={KEYS} title={t("navigasi_menu.pembangunan_menu.produksi.tabs.kelistrikan")} Icon={Zap} isElectricityTab={true} />;
}
