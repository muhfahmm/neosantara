// Shared types for all confirmation modals

interface MaterialRequirement {
  resourceKey: string;
  label: string;
  group: string;
  amount?: number;
}

export interface KonfirmasiPembangunanModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingLabel: string;
  buildingDescription?: string;
  cost: number;
  waktuPembangunan?: number;
  dampakKepuasan?: number;
  produksiPerHari?: number;
  produksiLabel?: string;
  konsumsiListrik?: number;
  requirements: MaterialRequirement[];
  materialStocks: Record<string, number>;
  anggaran: number;
  missingMaterials: MaterialRequirement[];
  onConfirm: (quantity?: number) => void;
  onMaterialClick: (resourceKey: string, label: string) => void;
  loadingMetadata: boolean;
  isDisabled?: boolean;
  
  // Capacity props - shared across all modals
  currentCapacity?: number;
  maxCapacity?: number;
  currentBarakCount?: number;
  capacityType?: "infanteri" | "hangar_tank" | "gudang_senjata" | "pangkalan_laut" | "pangkalan_udara";
  
  // Hangar Tank
  currentTankCount?: number;
  currentApcCount?: number;
  currentHangarCount?: number;
  
  // Gudang Senjata
  currentArtileriCount?: number;
  currentRoketCount?: number;
  currentPertahanUdaraCount?: number;
  currentKendaraanTaktisCount?: number;
  currentGudangCount?: number;
  
  // Pangkalan Laut
  kapalIndukCount?: number;
  kapalIndukNuklirCount?: number;
  kapalDestroyerCount?: number;
  kapalKorvetCount?: number;
  kapalSelamNuklirCount?: number;
  kapalSelamRegulerCount?: number;
  kapalRanjauCount?: number;
  kapalLogistikCount?: number;
  currentPangkalanLautCount?: number;
  
  // Pangkalan Udara
  jetTemturSilamanCount?: number;
  jetTemturInterceptorCount?: number;
  pesawatPengebomCount?: number;
  helikopterSerangCount?: number;
  pesawatPengintaiCount?: number;
  droneIntaiUavCount?: number;
  droneKamikazeCount?: number;
  pesawatAngkutCount?: number;
  currentPangkalanUdaraCount?: number;
  
  onNavigateToInfra?: (infraKey: string) => void;
  infraKeyToHighlight?: string | null;
  countryDetail?: any;
  selectedBuildingKey?: string;
}
