'use client';

import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps } from './diplomacy-path-animation';

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'sabotase',
  document: 'Operasi Sabotase',
  accent: '#F43F5E',
};

export default function SabotasePath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} />;
}
