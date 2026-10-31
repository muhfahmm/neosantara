'use client';

import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps, type DiplomacyPathVehicle } from './diplomacy-path-animation';

function ResearchContractIcon() {
  return (
    <>
      <circle cx="0" cy="0" r="1.8" fill="#fff" />
      <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.5" />
      <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.5" transform="rotate(60)" />
      <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.5" transform="rotate(-60)" />
    </>
  );
}

const ResearchContractVehicle: DiplomacyPathVehicle = ({ accent }) => (
  <g>
    <circle r="28" fill={accent} opacity=".14" className="diplomacy-glyph-glow" /><ellipse cx="0" cy="4" rx="26" ry="11" fill="#000" opacity=".45" />
    <rect x="-16" y="-9.5" width="7.5" height="3.5" rx="1.5" fill="#111" /><rect x="-16" y="6" width="7.5" height="3.5" rx="1.5" fill="#111" />
    <rect x="10" y="-9.5" width="7.5" height="3.5" rx="1.5" fill="#111" /><rect x="10" y="6" width="7.5" height="3.5" rx="1.5" fill="#111" />
    <path d="M-22,-6 L16,-6 C22,-6 25,-3 25,0 C25,3 22,6 16,6 L-22,6 C-25,6 -26,3 -26,0 C-26,-3 -25,-6 -22,-6 Z" fill={accent} />
    <path d="M-22,-6 L16,-6 C22,-6 25,-3 25,0 L-26,0 Z" fill="#fff" opacity=".22" /><path d="M-22,6 L16,6 C22,6 25,3 25,0 L-26,0 Z" fill="#000" opacity=".25" />
    <path d="M-10,-5 L9,-5 C12,-5 14,-2 14,0 C14,2 12,5 9,5 L-10,5 C-13,5 -14,2 -14,0 C-14,-2 -13,-5 -10,-5 Z" fill={accent} /><path d="M-10,-5 L9,-5 C12,-5 14,-2 14,0 L-14,0 Z" fill="#fff" opacity=".35" />
    <path d="M10,-4 L12.5,-1 L12.5,1 L10,4 Z M-11,-4 L-13.5,-1 L-13.5,1 L-11,4 Z" fill="#0A1A1A" opacity=".85" />
    <g transform="scale(.55)"><ResearchContractIcon /></g>
    <path d="M23,-4 L25.5,-2 L25.5,-1 L23,0 Z M23,4 L25.5,2 L25.5,1 L23,0 Z" fill="#fff" opacity=".95" /><path d="M-26,-4 L-24,-2 L-24,-1 L-26,0 Z M-26,4 L-24,2 L-24,1 L-26,0 Z" fill="#FF2D55" opacity=".9" />
  </g>
);

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'research-contract',
  document: 'Protokol Penelitian Bersama',
  accent: '#FB7185',
  Icon: ResearchContractIcon,
  Vehicle: ResearchContractVehicle,
};

export default function ResearchContractPath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} Vehicle={PATH_METADATA.Vehicle} />;
}
