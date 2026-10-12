'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface NonAggressionPactPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function NonAggressionPactPath(props: NonAggressionPactPathProps) {
  return <DiplomacyPathAnimation kind="non-aggression-pact" {...props} />;
}
