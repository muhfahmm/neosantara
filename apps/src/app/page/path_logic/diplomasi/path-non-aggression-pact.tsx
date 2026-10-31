'use client';

import React, { useId } from 'react';
import DiplomacyPathAnimation, { 
  type DiplomacyPathMetadata, 
  type DiplomacyPathProps, 
  type DiplomacyPathVehicle 
} from './diplomacy-path-animation';

// PERBAIKAN: Tambahkan parameter { accent } pada komponen ikon
function NonAggressionPactIcon({ accent = '#00E5FF' }: { accent?: string }) {
  return (
    <g>
      {/* Cincin Kiri */}
      <circle cx="-4" cy="0" r="6" fill="none" stroke="#fff" strokeWidth="1.8" />
      {/* Cincin Kanan */}
      <circle cx="4" cy="0" r="6" fill="none" stroke="#fff" strokeWidth="1.8" opacity=".85" />
      {/* Titik tengah (persetujuan) */}
      <circle cx="0" cy="0" r="1.5" fill={accent} />
    </g>
  );
}

const NonAggressionPactVehicle: DiplomacyPathVehicle = ({ accent }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  
  return (
    <g>
      {/* ================= DEFINISI GRADIEN ================= */}
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A1A1A" stopOpacity="1" />
          <stop offset="100%" stopColor="#003B4D" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`roof-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* ================= GLOW & SHADOW ================= */}
      <circle r="28" fill={accent} opacity=".15" className="diplomacy-glyph-glow" />
      <ellipse cx="0" cy="5" rx="27" ry="12" fill="#000" opacity=".5" />

      {/* ================= BAN & PELEK ================= */}
      {/* Ban Depan */}
      <rect x="12" y="-10" width="8" height="4" rx="2" fill="#050505" />
      <rect x="12" y="6" width="8" height="4" rx="2" fill="#050505" />
      <rect x="13.5" y="-9" width="5" height="2" rx="1" fill="#334155" />
      <rect x="13.5" y="7" width="5" height="2" rx="1" fill="#334155" />
      
      {/* Ban Belakang */}
      <rect x="-20" y="-10" width="8" height="4" rx="2" fill="#050505" />
      <rect x="-20" y="6" width="8" height="4" rx="2" fill="#050505" />
      <rect x="-18.5" y="-9" width="5" height="2" rx="1" fill="#334155" />
      <rect x="-18.5" y="7" width="5" height="2" rx="1" fill="#334155" />

      {/* ================= BODI MOBIL UTAMA ================= */}
      {/* Chassis */}
      <path
        d="M-24,-7 L14,-7 C22,-7 26,-4 27,0 C26,4 22,7 14,7 L-24,7 C-26,7 -27,3 -27,0 C-27,-3 -26,-7 -24,-7 Z"
        fill={`url(#body-${uid})`}
        stroke={accent}
        strokeWidth="0.5"
      />
      
      {/* Kap Mesin (Hood) / Gril Depan */}
      <path d="M 18,-7 L 14,-7 C 22,-7 26,-4 27,0 L 18,0 Z" fill="#fff" opacity=".15" />
      <path d="M 25,-2 L 27,0 L 25,2" fill="none" stroke="#fff" strokeWidth="1" opacity=".6" />
      {/* Garis Kap */}
      <path d="M 12,-6 L 12,6" fill="none" stroke="#000" strokeWidth="0.8" opacity=".3" />

      {/* ================= KABIN & KACA ================= */}
      {/* Kaca Depan */}
      <path d="M 10,-6 L 14,-6 C 15,-3 15,3 14,6 L 10,6 Z" fill={`url(#glass-${uid})`} />
      {/* Kaca Belakang */}
      <path d="M -18,-6 L -14,-6 L -14,6 L -18,6 Z" fill={`url(#glass-${uid})`} />
      
      {/* Atap Mobil (Roof) */}
      <path
        d="M-13,-6.5 L 9,-6.5 C 11,-6.5 12,-3 12,0 C 12,3 11,6.5 9,6.5 L-13,6.5 C -15,6.5 -16,3 -16,0 C -16,-3 -15,-6.5 -13,-6.5 Z"
        fill={`url(#roof-${uid})`}
      />
      {/* Highlight Atap 3D */}
      <path d="M-13,-6 L 9,-6 C 10.5,-6 11.5,-3 11.5,0 L-15.5,0 Z" fill="#fff" opacity=".4" />

      {/* Kaca Samping */}
      <path d="M -13,-6.5 L -16,-5 L -16,5 L -13,6.5 Z" fill={`url(#glass-${uid})`} />
      <path d="M 9,-6.5 L 12,-5 L 12,5 L 9,6.5 Z" fill={`url(#glass-${uid})`} />

      {/* Spion (Side Mirrors) */}
      <rect x="8" y="-8.5" width="3" height="1.5" rx="0.5" fill={accent} />
      <rect x="8" y="7" width="3" height="1.5" rx="0.5" fill={accent} />

      {/* ================= EMBLEM DI ATAP ================= */}
      <g transform="scale(.7) translate(0 0)">
        {/* PERBAIKAN: Kirim accent ke komponen Ikon */}
        <NonAggressionPactIcon accent={accent} />
      </g>

      {/* ================= LAMPU & STROBO ================= */}
      {/* Strobo Atap (Diplomatik) */}
      <rect x="-6" y="-2" width="2" height="4" rx="1" fill="#fff" opacity=".9" />
      <circle cx="-5" cy="0" r="3" fill={accent} opacity=".5" className="animate-pulse" />

      {/* Lampu Depan (Headlights) */}
      <path d="M 24,-5 L 26,-3 L 26,-1.5 L 24,-1.5 Z" fill="#fff" />
      <path d="M 24,5 L 26,3 L 26,1.5 L 24,1.5 Z" fill="#fff" />

      {/* Lampu Belakang (Taillights) */}
      <path d="M -26,-5 L -24,-5 L -24,-2 L -26,-2 Z" fill="#FF2D55" />
      <path d="M -26,5 L -24,5 L -24,2 L -26,2 Z" fill="#FF2D55" />
    </g>
  );
};

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'non-aggression-pact',
  document: 'Dokumen Diplomatik',
  accent: '#00E5FF',
  Icon: NonAggressionPactIcon,
  Vehicle: NonAggressionPactVehicle,
};

export default function NonAggressionPactPath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} Vehicle={PATH_METADATA.Vehicle} />;
}