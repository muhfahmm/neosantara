import {
  loadActiveResolutions
} from './resolusiPBBUILogic';
import { isPassedResolutionActive, normalizePbbCountryName } from './resolusiPBBUILogic';
import { submitInvasionViolationSanctions } from '../../pbbWarSanctions';
import type { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';

function isGlobalTarget(targetName: string): boolean {
  const target = normalizePbbCountryName(targetName);
  return target.includes('global') || target.includes('dunia');
}

export function hasActiveGlobalWarBan(): boolean {
  return loadActiveResolutions().some(item =>
    item.type === 'war_ban' &&
    isGlobalTarget(item.target.name) &&
    isPassedResolutionActive(item)
  );
}

export function submitWarBanViolationSanctions(
  attackerCountry: string,
  targetCountry: string,
  dateStr: string
): NotificationMessage[] {
  return submitInvasionViolationSanctions(attackerCountry, targetCountry, dateStr, 'war_ban');
}
