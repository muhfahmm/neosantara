'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface SabotasePathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function SabotasePath(props: SabotasePathProps) {
  return <DiplomacyPathAnimation kind="sabotase" {...props} />;
}
