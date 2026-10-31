'use client';

import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps } from './diplomacy-path-animation';

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'trade-agreement',
  document: 'Dokumen Perdagangan',
  accent: '#FBBF24',
};

export default function TradeAgreementPath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} />;
}
