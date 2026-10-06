import {
  loadActiveSecurityCouncilItems,
  saveActiveSecurityCouncilItems
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { forgetReportedInvasionViolation } from '../../pbbWarSanctions';
import {
  loadActiveResolutions,
  saveActiveResolutions,
  isPassedResolutionActive,
  normalizePbbCountryName
} from './resolusiPBBUILogic';

function normalizeInvasionCountryName(countryName: string): string {
  const normalized = normalizePbbCountryName(countryName);
  return normalized === 'afghanistan' ? 'afganistan' : normalized;
}

function getApprovedInvasionMandates() {
  const assemblyMandates = loadActiveResolutions()
    .filter(item => item.type === 'military_invasion')
    .map(item => ({
      proposerName: item.proposer.name,
      targetName: item.target.name,
      status: item.status,
      daysRemaining: item.daysRemaining,
      violationId: undefined
    }));
  const securityCouncilMandates = loadActiveSecurityCouncilItems()
    .filter(item => item.type === 'military')
    .map(item => ({
      proposerName: item.proposer.name,
      targetName: item.target.name,
      status: item.status,
      daysRemaining: item.daysRemaining,
      violationId: item.violationId
    }));

  return [...assemblyMandates, ...securityCouncilMandates];
}

function clearUnwarrantedSanctions(attacker: string, target: string): void {
  const isMatchingViolation = (violationId?: string): boolean => {
    if (!violationId) return false;
    const [ , recordedAttacker, recordedTarget, reason ] = violationId.split('|');
    return Boolean(recordedAttacker && recordedTarget) &&
      reason === 'missing_military_resolution' &&
      normalizeInvasionCountryName(recordedAttacker) === attacker &&
      normalizeInvasionCountryName(recordedTarget) === target;
  };

  const resolutions = loadActiveResolutions();
  const filteredResolutions = resolutions.filter(item => !isMatchingViolation(item.violationId));
  if (filteredResolutions.length !== resolutions.length) {
    saveActiveResolutions(filteredResolutions);
  }

  const securityItems = loadActiveSecurityCouncilItems();
  const filteredSecurityItems = securityItems.filter(item => !isMatchingViolation(item.violationId));
  if (filteredSecurityItems.length !== securityItems.length) {
    saveActiveSecurityCouncilItems(filteredSecurityItems);
  }

  forgetReportedInvasionViolation(attacker, target, 'missing_military_resolution');

  if (filteredResolutions.length !== resolutions.length || filteredSecurityItems.length !== securityItems.length) {
    window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
  }
}

export function hasActiveApprovedInvasionResolutionForDifferentTarget(
  attackerCountry: string,
  targetCountry: string
): boolean {
  const attacker = normalizeInvasionCountryName(attackerCountry);
  const target = normalizeInvasionCountryName(targetCountry);
  if (!attacker || !target) return false;

  return getApprovedInvasionMandates().some(item =>
    normalizeInvasionCountryName(item.proposerName) === attacker &&
    normalizeInvasionCountryName(item.targetName) !== target &&
    isPassedResolutionActive(item)
  );
}

export function hasActiveApprovedInvasionResolution(
  attackerCountry: string,
  targetCountry: string
): boolean {
  const attacker = normalizeInvasionCountryName(attackerCountry);
  const target = normalizeInvasionCountryName(targetCountry);
  if (!attacker || !target) return false;

  const hasMandate = getApprovedInvasionMandates().some(item =>
    normalizeInvasionCountryName(item.proposerName) === attacker &&
    normalizeInvasionCountryName(item.targetName) === target &&
    isPassedResolutionActive(item)
  );

  if (hasMandate) {
    clearUnwarrantedSanctions(attacker, target);
  }

  return hasMandate;
}
