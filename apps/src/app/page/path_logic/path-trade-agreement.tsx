'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface TradeAgreementPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function TradeAgreementPath(props: TradeAgreementPathProps) {
  return <DiplomacyPathAnimation kind="trade-agreement" {...props} />;
}
