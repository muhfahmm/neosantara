import { areSameWarCountry } from '../1_serang_negara/warCountryIdentity';

export interface RequestedInvasionOutcomeInput {
  attackerPower: number;
  targetPower: number;
  roll: number;
}

export interface RequestedInvasionOutcome {
  attackerWins: boolean;
  winChance: number;
  message: string;
}

export type RequestedAttackStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type RequestedAttackOutcome = Extract<RequestedAttackStatus, 'completed' | 'failed' | 'cancelled'>;

export interface RequestedAttackRecord {
  id: string;
  requesterCountry: string;
  attackerCountry: string;
  targetCountry: string;
  requestedAt: string;
  arrivalDate?: string;
  status: RequestedAttackStatus;
  outcome?: RequestedAttackOutcome;
}

export const REQUESTED_ATTACK_REQUESTS_CHANGED_EVENT = 'requested_attack_requests_changed';
const REQUESTED_ATTACK_REQUESTS_STORAGE_KEY = 'neosantara_requested_attack_requests';
const isDevelopment = process.env.NODE_ENV !== 'production';

function publishRequestedAttackRequestsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REQUESTED_ATTACK_REQUESTS_CHANGED_EVENT));
  }
}

function readStoredRequests(): RequestedAttackRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(REQUESTED_ATTACK_REQUESTS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.error('[RequestedInvasion] Stored request list is invalid.');
      return [];
    }
    return parsed.filter((record): record is RequestedAttackRecord =>
      record !== null &&
      typeof record === 'object' &&
      typeof record.id === 'string' &&
      typeof record.requesterCountry === 'string' &&
      typeof record.attackerCountry === 'string' &&
      typeof record.targetCountry === 'string' &&
      typeof record.requestedAt === 'string' &&
      ['pending', 'in_progress', 'completed', 'failed', 'cancelled'].includes(record.status)
    );
  } catch (error) {
    console.error('[RequestedInvasion] Unable to read stored requests.', error);
    return [];
  }
}

function writeStoredRequests(requests: RequestedAttackRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REQUESTED_ATTACK_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    publishRequestedAttackRequestsChanged();
  } catch (error) {
    console.error('[RequestedInvasion] Unable to persist request status.', error);
  }
}

export function createRequestedAttackRequest(
  request: Omit<RequestedAttackRecord, 'status' | 'outcome'>
): RequestedAttackRecord {
  const requests = readStoredRequests();
  const existing = requests.find(record => record.id === request.id);
  if (existing) return existing;

  const created: RequestedAttackRecord = { ...request, status: 'pending' };
  requests.push(created);
  writeStoredRequests(requests);
  if (isDevelopment) console.debug(`[RequestedInvasion] ${created.id}: pending`);
  return created;
}

export function getRequestedAttackRequests(): RequestedAttackRecord[] {
  return readStoredRequests();
}

export function getActiveRequestedAttackRequests(
  attackerCountry: string,
  requesterCountry?: string
): RequestedAttackRecord[] {
  return readStoredRequests()
    .filter(record =>
      areSameWarCountry(record.attackerCountry, attackerCountry) &&
      (!requesterCountry || !record.requesterCountry ||
        areSameWarCountry(record.requesterCountry, requesterCountry)) &&
      (record.status === 'pending' || record.status === 'in_progress')
    )
    .sort((left, right) => left.requestedAt.localeCompare(right.requestedAt));
}

export function setRequestedAttackArrivalDate(requestId: string, arrivalDate: string): void {
  const requests = readStoredRequests();
  const index = requests.findIndex(record => record.id === requestId);
  if (index < 0 || requests[index].status === 'completed' ||
      requests[index].status === 'failed' || requests[index].status === 'cancelled') return;
  requests[index] = { ...requests[index], arrivalDate };
  writeStoredRequests(requests);
}

export function setRequestedAttackInProgress(requestId: string): void {
  const requests = readStoredRequests();
  const index = requests.findIndex(record => record.id === requestId);
  if (index < 0 || requests[index].status !== 'pending') return;
  requests[index] = { ...requests[index], status: 'in_progress' };
  writeStoredRequests(requests);
  if (isDevelopment) console.debug(`[RequestedInvasion] ${requestId}: in_progress`);
}

export function resolveAttackRequest(
  matcher: {
    requestId?: string;
    attackerCountry?: string;
    targetCountry?: string;
  },
  outcome: RequestedAttackOutcome,
  actionType?: string
): RequestedAttackRecord | null {
  const requests = readStoredRequests();
  const activeRequests = requests.filter(record =>
    record.status === 'pending' || record.status === 'in_progress'
  );
  const match = matcher.requestId
    ? activeRequests.find(record => record.id === matcher.requestId)
    : activeRequests.find(record =>
      Boolean(matcher.attackerCountry && matcher.targetCountry) &&
      areSameWarCountry(record.attackerCountry, matcher.attackerCountry) &&
      areSameWarCountry(record.targetCountry, matcher.targetCountry)
    );
  if (!match) return null;

  const resolved: RequestedAttackRecord = { ...match, status: outcome, outcome };
  writeStoredRequests(requests.map(record => record.id === match.id ? resolved : record));
  if (isDevelopment) console.debug(`[RequestedInvasion] ${resolved.id}: ${outcome}`);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('requested_invasion_resolved', {
      detail: {
        requestId: resolved.id,
        attackerCountry: resolved.attackerCountry,
        targetCountry: resolved.targetCountry,
        actionType: actionType ?? outcome,
        outcome,
      },
    }));
  }
  return resolved;
}

export function cancelOrphanedRequestedAttackRequests(): void {
  const requests = readStoredRequests();
  let changed = false;
  const reconciled = requests.map(record => {
    if (record.status !== 'pending' && record.status !== 'in_progress') return record;
    changed = true;
    if (isDevelopment) console.debug(`[RequestedInvasion] ${record.id}: cancelled (simulation reloaded)`);
    return { ...record, status: 'cancelled' as const, outcome: 'cancelled' as const };
  });
  if (changed) writeStoredRequests(reconciled);
}

export function resolveRequestedInvasionOutcome({
  attackerPower,
  targetPower,
  roll,
}: RequestedInvasionOutcomeInput): RequestedInvasionOutcome {
  const winChance = attackerPower > targetPower
    ? 0.6
    : attackerPower < targetPower
      ? 0.4
      : 0.5;
  const normalizedRoll = Math.min(1, Math.max(0, roll));

  return {
    attackerWins: normalizedRoll < winChance,
    winChance,
    message: `Peluang kemenangan operasi berbayar: ${Math.round(winChance * 100)}%.`,
  };
}
