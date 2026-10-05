"use client"
import { Factory } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[1].products];

export default function ManufakturTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Manufaktur" Icon={Factory} isElectricityTab={false} />;
}
