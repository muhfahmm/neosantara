'use client';

import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps } from './diplomacy-path-animation';

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'aid-delivery',
  document: 'Konvoi Bantuan Sekutu',
  accent: '#38BDF8',
};

export default function AidDeliveryPath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} />;
}
