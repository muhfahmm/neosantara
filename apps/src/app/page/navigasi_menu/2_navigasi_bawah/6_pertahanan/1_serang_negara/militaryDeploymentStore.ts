export const MILITARY_DEPLOYMENTS_UPDATED_EVENT = 'military_deployments_updated';

export interface ActiveMilitaryDeployment {
  attackId: string;
  attackerCountry: string;
  targetCountry: string;
  units: Record<string, number>;
  deploymentPercent: Record<string, number>;
}

const normalizeCountryName = (countryName: string) => countryName.trim().toLowerCase();

let activeDeployments: ActiveMilitaryDeployment[] = [];
let isResolutionListenerRegistered = false;

function updateDeployments(deployments: ActiveMilitaryDeployment[]) {
  activeDeployments = deployments;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MILITARY_DEPLOYMENTS_UPDATED_EVENT));
  }
}

function registerResolutionListener() {
  if (typeof window === 'undefined' || isResolutionListenerRegistered) return;

  window.addEventListener('military_operation_resolved', event => {
    const targetCountry = (event as CustomEvent<{ targetCountry?: string }>).detail?.targetCountry;
    if (!targetCountry) return;

    const target = normalizeCountryName(targetCountry);
    const remaining = activeDeployments.filter(
      deployment => normalizeCountryName(deployment.targetCountry) !== target
    );
    if (remaining.length !== activeDeployments.length) updateDeployments(remaining);
  });
  isResolutionListenerRegistered = true;
}

export function getActiveDeployedUnitTotals(attackerCountry: string): Record<string, number> {
  const attacker = normalizeCountryName(attackerCountry);
  return activeDeployments
    .filter(deployment => normalizeCountryName(deployment.attackerCountry) === attacker)
    .reduce<Record<string, number>>((totals, deployment) => {
      Object.entries(deployment.units).forEach(([unitKey, quantity]) => {
        const numericQuantity = Number(quantity);
        if (Number.isFinite(numericQuantity) && numericQuantity > 0) {
          totals[unitKey] = (totals[unitKey] || 0) + numericQuantity;
        }
      });
      return totals;
    }, {});
}

export function getActiveMilitaryDeployment(attackId: string): ActiveMilitaryDeployment | null {
  return activeDeployments.find(deployment => deployment.attackId === attackId) || null;
}

export function getActiveMilitaryDeploymentForCountry(
  attackerCountry: string,
): ActiveMilitaryDeployment | null {
  const attacker = normalizeCountryName(attackerCountry);
  return activeDeployments.find(
    deployment => normalizeCountryName(deployment.attackerCountry) === attacker
  ) || null;
}

export function saveActiveMilitaryDeployment(deployment: ActiveMilitaryDeployment) {
  registerResolutionListener();
  const deployments = activeDeployments.filter(item => item.attackId !== deployment.attackId);
  updateDeployments([...deployments, deployment]);
}

export function returnDeployedTroops(attackId: string) {
  const remaining = activeDeployments.filter(deployment => deployment.attackId !== attackId);
  if (remaining.length !== activeDeployments.length) updateDeployments(remaining);
}
