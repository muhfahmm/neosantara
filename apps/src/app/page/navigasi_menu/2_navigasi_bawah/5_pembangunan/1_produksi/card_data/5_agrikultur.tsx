"use client"
import { Sprout } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[3].products];

export default function AgrikulturTab(props: any) {
  const { t } = useLanguage();
  return <BaseProduksiGrid {...props} keys={KEYS} title={t("navigasi_menu.pembangunan_menu.produksi.tabs.agrikultur")} Icon={Sprout} isElectricityTab={false} />;
}
