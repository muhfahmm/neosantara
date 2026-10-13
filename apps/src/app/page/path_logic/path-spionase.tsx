'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface SpionasePathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function SpionasePath(props: SpionasePathProps) {
  return <DiplomacyPathAnimation kind="spionase" {...props} />;
}
