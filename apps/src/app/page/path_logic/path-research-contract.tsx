'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface ResearchContractPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function ResearchContractPath(props: ResearchContractPathProps) {
  return <DiplomacyPathAnimation kind="research-contract" {...props} />;
}
