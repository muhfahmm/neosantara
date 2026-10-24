export type Choice = 'HARD_POWER' | 'SOFT_POWER' | 'CONCESSION';

export interface NPCState {
  anger_level: number;
  trust_level: number;
  patience: number;
  memory: Record<string, number | string>;
}

export interface PlayerState {
  budget: number;
}

export interface ChoiceOption {
  choice: Choice;
  text: string;
}

export interface NegotiationResponse {
  status: 'ongoing' | 'success' | 'riot' | 'walkout';
  npc_state: NPCState;
  player_state: PlayerState;
  npc_response: string;
  choices: ChoiceOption[] | null;
  events: string[];
}

export type ConfirmedPolicyType = 'tax' | 'price' | 'subsidy';

const API_URL = process.env.NEXT_PUBLIC_DIALOG_API_URL ?? '';

export async function negotiateChoice(
  choice: Choice,
  npcState: NPCState,
  playerState: PlayerState,
  signal?: AbortSignal,
): Promise<NegotiationResponse> {
  const response = await fetch(`${API_URL}/api/negotiate-choice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice, npc_state: npcState, player_state: playerState }),
    signal,
  });
  const body = await response.text();
  let data: NegotiationResponse | { detail?: string } | undefined;
  try {
    data = JSON.parse(body) as NegotiationResponse | { detail?: string };
  } catch {
    throw new Error(`Engine negosiasi tidak tersedia (${response.status}).`);
  }
  if (!response.ok) throw new Error('detail' in data ? data.detail ?? 'Negosiasi gagal.' : 'Negosiasi gagal.');
  return data as NegotiationResponse;
}

export async function confirmPolicyWithNpc(
  policyType: ConfirmedPolicyType,
  demandText: string,
  policyChanges: string[],
  npcState: NPCState,
  playerState: PlayerState,
  signal?: AbortSignal,
): Promise<NegotiationResponse> {
  const response = await fetch(`${API_URL}/api/negotiate-choice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      choice: 'CONCESSION',
      policy_type: policyType,
      demand_text: demandText,
      policy_changes: policyChanges,
      npc_state: npcState,
      player_state: playerState,
    }),
    signal,
  });
  const body = await response.text();
  let data: NegotiationResponse | { detail?: string } | undefined;
  try {
    data = JSON.parse(body) as NegotiationResponse | { detail?: string };
  } catch {
    throw new Error(`Engine negosiasi tidak tersedia (${response.status}).`);
  }
  if (!response.ok) {
    throw new Error('detail' in data ? data.detail ?? 'Konfirmasi kebijakan gagal.' : 'Konfirmasi kebijakan gagal.');
  }
  return data as NegotiationResponse;
}
