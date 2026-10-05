import { loadActiveSecurityCouncilItems } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { isPassedResolutionActive, normalizePbbCountryName } from './resolusiPBBUILogic';

export function hasActiveApprovedInvasionResolutionForDifferentTarget(
  attackerCountry: string,
  targetCountry: string
): boolean {
  const attacker = normalizePbbCountryName(attackerCountry);
  const target = normalizePbbCountryName(targetCountry);
  if (!attacker || !target) return false;

  return loadActiveSecurityCouncilItems().some(item =>
    item.type === 'military' &&
    normalizePbbCountryName(item.proposer.name) === attacker &&
    normalizePbbCountryName(item.target.name) !== target &&
    isPassedResolutionActive(item)
  );
}

export function hasActiveApprovedInvasionResolution(
  attackerCountry: string,
  targetCountry: string
): boolean {
  const attacker = normalizePbbCountryName(attackerCountry);
  const target = normalizePbbCountryName(targetCountry);
  if (!attacker || !target) return false;

  return loadActiveSecurityCouncilItems().some(item =>
    item.type === 'military' &&
    normalizePbbCountryName(item.proposer.name) === attacker &&
    normalizePbbCountryName(item.target.name) === target &&
    isPassedResolutionActive(item)
  );
}
