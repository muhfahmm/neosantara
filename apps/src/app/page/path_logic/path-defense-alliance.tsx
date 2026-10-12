'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface DefenseAlliancePathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function DefenseAlliancePath(props: DefenseAlliancePathProps) {
  return <DiplomacyPathAnimation kind="defense-alliance" {...props} />;
}
