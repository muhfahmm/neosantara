export type TutorialPlacement = 'top' | 'right' | 'bottom' | 'left' | 'center';

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
  targetSelector?: string;
  placement?: TutorialPlacement;
  completeWhen?: () => boolean;
}
