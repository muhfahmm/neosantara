import type { LucideIcon } from 'lucide-react';

export interface ProvinceAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface ProvinceActionEventDetail {
  actionId: string;
  actionLabel: string;
  targetCountry: string;
  occupyingCountry: string;
}

export const PROVINCE_ACTION_EVENT = 'province_action_confirmed';
