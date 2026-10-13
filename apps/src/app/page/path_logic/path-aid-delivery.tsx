'use client';

import DiplomacyPathAnimation from './diplomacy-path-animation';

interface AidDeliveryPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function AidDeliveryPath(props: AidDeliveryPathProps) {
  return <DiplomacyPathAnimation kind="aid-delivery" {...props} />;
}
