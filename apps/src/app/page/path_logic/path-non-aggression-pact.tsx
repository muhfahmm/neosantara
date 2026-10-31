'use client';

import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps } from './diplomacy-path-animation';

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'non-aggression-pact',
  document: 'Dokumen Diplomatik',
  accent: '#00E5FF',
};

export default function NonAggressionPactPath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} />;
}
