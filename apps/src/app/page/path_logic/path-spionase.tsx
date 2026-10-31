'use client';

import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps } from './diplomacy-path-animation';

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'spionase',
  document: 'Operasi Spionase',
  accent: '#F97316',
};

export default function SpionasePath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} />;
}
