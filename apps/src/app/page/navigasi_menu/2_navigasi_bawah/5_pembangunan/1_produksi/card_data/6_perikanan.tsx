"use client"
import { Fish } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[4].products];

export default function PerikananTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Perikanan" Icon={Fish} isElectricityTab={false} />;
}
