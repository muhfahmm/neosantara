import type { LucideIcon } from 'lucide-react';

export interface ProvinceAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  onConfirm?: (context: ProvinceActionContext) => string | ProvinceActionResult;
}

export interface ProvinceActionResult {
  message: string;
  succeeded: boolean;
  successChance?: number;
}

export interface ProvinceActionContext {
  targetCountry: string;
  occupyingCountry: string;
  playerReligion?: string;
  updateTargetReligion?: (religion: string) => void;
  playerIdeology?: string;
  updateTargetIdeology?: (ideology: string) => void;
  targetIdeology?: string;
  provinceBudget?: number;
  provinceNetBalance?: number;
  playerCountryDetail?: Record<string, unknown> | null;
  taxedProvinces?: string[];
  updatePlayerCountryDetail?: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  adjustPlayerNetBalance?: (delta: number) => void;
  provinceTension?: number;
  adjustProvinceTension?: (delta: number) => void;
}

export interface ProvinceActionEventDetail {
  actionId: string;
  actionLabel: string;
  targetCountry: string;
  occupyingCountry: string;
  actionSucceeded?: boolean;
  actionMessage?: string;
  successChance?: number;
}

export const PROVINCE_ACTION_EVENT = 'province_action_confirmed';
