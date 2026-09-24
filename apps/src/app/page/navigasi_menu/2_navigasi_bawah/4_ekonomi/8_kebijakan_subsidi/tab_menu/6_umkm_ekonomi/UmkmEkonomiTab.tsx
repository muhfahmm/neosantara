// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\tab_menu\6_umkm_ekonomi\UmkmEkonomiTab.tsx
"use client";

import React from "react";
import { SubsidyItem } from "../../logic/logikaSubsidi";
import SubsidyCardGrid from "../common/SubsidyCardGrid";

interface Props {
  items: SubsidyItem[];
  toggleSubsidy: (id: string) => void;
}

export default function UmkmEkonomiTab({ items, toggleSubsidy }: Props) {
  const filtered = items.filter((i) => i.category === "UMKM & Ekonomi");
  return <SubsidyCardGrid items={filtered} toggleSubsidy={toggleSubsidy} />;
}
