// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\tab_menu\1_semua_sektor\SemuaSektorTab.tsx
"use client";

import React from "react";
import { SubsidyItem } from "../../logic/logikaSubsidi";
import SubsidyCardGrid from "../common/SubsidyCardGrid";

interface Props {
  items: SubsidyItem[];
  toggleSubsidy: (id: string) => void;
  onOpenDetail?: (item: SubsidyItem) => void;
}

export default function SemuaSektorTab({ items, toggleSubsidy, onOpenDetail }: Props) {
  return <SubsidyCardGrid items={items} toggleSubsidy={toggleSubsidy} onOpenDetail={onOpenDetail} />;
}
