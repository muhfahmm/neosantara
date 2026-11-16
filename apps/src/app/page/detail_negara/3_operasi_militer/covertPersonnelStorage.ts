export interface CovertPersonnelState {
  mataMata: number;
  penyabot: number;
}

const STORAGE_KEY = 'neosantara_covert_personnel';
export const COVERT_PERSONNEL_UPDATED_EVENT = 'neosantara_covert_personnel_updated';
export const RECRUIT_COST_PER_PERSON = 1000; // 1000 EM

export function getCovertPersonnel(): CovertPersonnelState {
  if (typeof window === 'undefined') {
    return { mataMata: 0, penyabot: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mataMata: 0, penyabot: 0 };
    const parsed = JSON.parse(raw);
    return {
      mataMata: Math.max(0, Number(parsed.mataMata) || 0),
      penyabot: Math.max(0, Number(parsed.penyabot) || 0),
    };
  } catch {
    return { mataMata: 0, penyabot: 0 };
  }
}

export function recruitPersonnel(type: 'mataMata' | 'penyabot', count: number): CovertPersonnelState {
  const current = getCovertPersonnel();
  const next: CovertPersonnelState = {
    ...current,
    [type]: current[type] + Math.max(0, count),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(COVERT_PERSONNEL_UPDATED_EVENT, { detail: next }));
    } catch (e) {
      console.error('Failed to save covert personnel:', e);
    }
  }

  return next;
}

export function consumePersonnel(type: 'mataMata' | 'penyabot', count: number = 1): boolean {
  const current = getCovertPersonnel();
  if (current[type] < count) return false;
  const next: CovertPersonnelState = {
    ...current,
    [type]: current[type] - count,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(COVERT_PERSONNEL_UPDATED_EVENT, { detail: next }));
    } catch (e) {
      console.error('Failed to update covert personnel:', e);
    }
  }

  return true;
}
