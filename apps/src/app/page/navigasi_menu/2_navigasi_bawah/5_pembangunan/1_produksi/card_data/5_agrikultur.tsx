"use client"
import { Sprout } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[3].products];

export default function AgrikulturTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Agrikultur" Icon={Sprout} isElectricityTab={false} />;
}
