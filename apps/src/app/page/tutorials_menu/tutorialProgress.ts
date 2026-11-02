export type TutorialStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface TutorialProgress {
  stepIndex: number;
  status: TutorialStatus;
}

const STORAGE_KEY = 'neosantara_tutorial_progress';
const CHANGE_EVENT = 'neosantara_tutorial_changed';
const START_EVENT = 'neosantara_tutorial_start';
const INITIAL_PROGRESS: TutorialProgress = { stepIndex: 0, status: 'not_started' };
let cachedRaw: string | null | undefined;
let cachedProgress = INITIAL_PROGRESS;

function isTutorialProgress(value: unknown): value is TutorialProgress {
  if (!value || typeof value !== 'object') return false;
  const progress = value as Partial<TutorialProgress>;
  return typeof progress.stepIndex === 'number'
    && Number.isInteger(progress.stepIndex)
    && progress.stepIndex >= 0
    && progress.stepIndex < 7
    && ['not_started', 'in_progress', 'completed', 'skipped'].includes(String(progress.status));
}

function notifyProgressChanged(progress: TutorialProgress): void {
  window.dispatchEvent(new CustomEvent<TutorialProgress>(CHANGE_EVENT, { detail: progress }));
}

export function getTutorialProgressSnapshot(): TutorialProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === cachedRaw) return cachedProgress;
    cachedRaw = stored;
    if (!stored) {
      cachedProgress = INITIAL_PROGRESS;
      return cachedProgress;
    }
    const parsed: unknown = JSON.parse(stored);
    if (!isTutorialProgress(parsed)) {
      console.error('Tutorial progress has an invalid format.');
      cachedProgress = INITIAL_PROGRESS;
      return cachedProgress;
    }
    cachedProgress = parsed;
    return cachedProgress;
  } catch (error) {
    console.error('Failed to read tutorial progress:', error);
    return cachedProgress;
  }
}

export const getTutorialProgress = getTutorialProgressSnapshot;

export function subscribeTutorialProgress(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function setTutorialProgress(progress: TutorialProgress): void {
  if (typeof window === 'undefined') return;

  try {
    const serialized = JSON.stringify(progress);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedProgress = progress;
    notifyProgressChanged(progress);
  } catch (error) {
    console.error('Failed to save tutorial progress:', error);
  }
}

export function startTutorial(): void {
  const progress = getTutorialProgress();
  const stepIndex = progress.status === 'in_progress' ? progress.stepIndex : 0;
  setTutorialProgress({ stepIndex, status: 'in_progress' });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(START_EVENT));
  }
}

export function resetTutorial(): void {
  setTutorialProgress(INITIAL_PROGRESS);
}

export { START_EVENT as TUTORIAL_START_EVENT };
