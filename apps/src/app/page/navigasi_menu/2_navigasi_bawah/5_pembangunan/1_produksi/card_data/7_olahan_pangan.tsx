"use client"
import { Utensils } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[5].products];

export default function OlahanPanganTab(props: any) {
  const { t } = useLanguage();
  return <BaseProduksiGrid {...props} keys={KEYS} title={t("navigasi_menu.pembangunan_menu.produksi.tabs.olahanPangan")} Icon={Utensils} isElectricityTab={false} />;
}
