'use client';

import React, { useId } from 'react';
import DiplomacyPathAnimation, { 
  type DiplomacyPathMetadata, 
  type DiplomacyPathProps, 
  type DiplomacyPathVehicle 
} from './diplomacy-path-animation';

// --- IKON LAMBANG (Untuk di Atap Mobil) ---
function NonAggressionPactIcon({ accent = '#00E5FF' }: { accent?: string }) {
  return (
    <g>
      <circle cx="-4" cy="0" r="5" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".9" />
      <circle cx="4" cy="0" r="5" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".7" />
      <circle cx="0" cy="0" r="1.5" fill={accent} />
    </g>
  );
}

// --- DESAIN MOBIL KEPRESIDENAN REALISTIS ---
const NonAggressionPactVehicle: DiplomacyPathVehicle = ({ accent }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  
  return (
    <g>
      {/* ================= DEFINISI GRADIEN & FILTER ================= */}
      <defs>
        {/* Bayangan mobil yang halus */}


        {/* Gradien Bodi Baja (Armored Steel) */}
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="40%" stopColor="#0f172a" />
          <stop offset="80%" stopColor="#020617" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Gradien Kaca Film (Armored Glass) */}
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.6" />
          <stop offset="30%" stopColor="#1e293b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </linearGradient>

        {/* Gradien Ban (Tire) */}
        <radialGradient id={`tire-${uid}`} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#111827" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>

      {/* ================= BAYANGAN DI TANAH ================= */}
      <ellipse 
        cx="2" cy="5" rx="30" ry="13" 
        fill="#000" opacity=".5" 
      />

      {/* ================= RODA & KAKI-KAKI ================= */}
      {/* Roda Depan Kiri & Kanan */}
      <g>
        <rect x="13" y="-10" width="9" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="14.5" y="-9" width="6" height="2" rx="0.5" fill="#64748b" opacity=".5" />
        <rect x="13" y="6" width="9" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="14.5" y="7" width="6" height="2" rx="0.5" fill="#64748b" opacity=".5" />
      </g>

      {/* Roda Belakang Kiri & Kanan */}
      <g>
        <rect x="-23" y="-10" width="9" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="-21.5" y="-9" width="6" height="2" rx="0.5" fill="#64748b" opacity=".5" />
        <rect x="-23" y="6" width="9" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="-21.5" y="7" width="6" height="2" rx="0.5" fill="#64748b" opacity=".5" />
      </g>

      {/* ================= BODI MOBIL (CHASSIS) ================= */}
      {/* Bodi Utama */}
      <path
        d="M-27,-7 L16,-7 C24,-7 30,-4 31,0 C30,4 24,7 16,7 L-27,7 C-30,7 -32,3 -32,0 C-32,-3 -30,-7 -27,-7 Z"
        fill={`url(#body-${uid})`}
        stroke="#020617"
        strokeWidth="0.8"
      />
      
      {/* Sorotan Tepi Bodi (Rim Light) */}
      <path 
        d="M-31,0 C-31,-3 -29,-6 -27,-7 L16,-7 C24,-7 30,-4 31,0" 
        fill="none" stroke={accent} strokeWidth="0.6" opacity=".8" 
      />

      {/* Lekuk Kap Mesin & Bagasi */}
      <path d="M 20,-6 L 14,-6 L 14,6 L 20,6 Z" fill="#fff" opacity=".05" />
      <path d="M -26,-6 L -20,-6 L -20,6 L -26,6 Z" fill="#000" opacity=".3" />
      
      {/* Garis Pintu Samping */}
      <path d="M -2,-7 L -2,7" stroke="#000" strokeWidth="0.8" opacity=".5" />
      <path d="M 10,-7 L 10,7" stroke="#000" strokeWidth="0.8" opacity=".5" />

      {/* ================= KABIN & KACA ================= */}
      {/* Kaca Depan (Windshield) */}
      <path 
        d="M 12,-6.5 L 17,-6.5 C 18.5,-3 18.5,3 17,6.5 L 12,6.5 Z" 
        fill={`url(#glass-${uid})`} 
      />
      {/* Kaca Belakang (Rear Window) */}
      <path 
        d="M -21,-6.5 L -15,-6.5 L -15,6.5 L -21,6.5 Z" 
        fill={`url(#glass-${uid})`} 
      />
      
      {/* Atap Mobil (Roof) */}
      <path
        d="M-15,-7 L 11,-7 C 13,-7 14,-3 14,0 C 14,3 13,7 11,7 L-15,7 C -17,7 -18,3 -18,0 C -18,-3 -17,-7 -15,-7 Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="0.8"
      />
      {/* Highlight Permukaan Atap */}
      <path d="M-14,-6 L 10,-6 C 12,-6 13,-3 13,0 L-16,0 Z" fill="#fff" opacity=".06" />

      {/* Kaca Samping (Side Windows) */}
      <path d="M -15,-7 L -18,-6 L -18,6 L -15,7 Z" fill={`url(#glass-${uid})`} />
      <path d="M 11,-7 L 14,-6 L 14,6 L 11,7 Z" fill={`url(#glass-${uid})`} />

      {/* Pantulan Kaca (Glare Reflection) */}
      <path d="M 13,-5 L 16,-5 L 16,-1 L 13,-1 Z" fill="#fff" opacity=".15" />
      <path d="M -20,-5 L -16,-5 L -16,-1 L -20,-1 Z" fill="#fff" opacity=".1" />

      {/* ================= DETAIL EKSTERIOR ================= */}
      {/* Spion Kanan Kiri */}
      <path d="M 10,-9 L 12,-8 L 12,-7 L 10,-7 Z" fill="#020617" stroke="#475569" strokeWidth="0.4" />
      <path d="M 10,9 L 12,8 L 12,7 L 10,7 Z" fill="#020617" stroke="#475569" strokeWidth="0.4" />

      {/* Gril Depan (Chrome Bar) */}
      <path d="M 27,-4 L 30,-1 L 30,1 L 27,4" fill="none" stroke="#64748b" strokeWidth="1.2" />
      <path d="M 28,-3 L 29,0 L 28,3" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />

      {/* Lampu Depan (Xenon) */}
      <path d="M 28,-6.5 L 30.5,-5 L 30.5,-3.5 L 28,-3 Z" fill="#f8fafc" opacity=".95" />
      <path d="M 28,6.5 L 30.5,5 L 30.5,3.5 L 28,3 Z" fill="#f8fafc" opacity=".95" />
      {/* Efek Glow Lampu Depan */}
      <path d="M 30.5,-5 L 33,-4 L 33,-2 L 30.5,-3 Z" fill={accent} opacity=".3" />
      <path d="M 30.5,5 L 33,4 L 33,2 L 30.5,3 Z" fill={accent} opacity=".3" />

      {/* Lampu Belakang (Rem) */}
      <path d="M -31,-6 L -29,-6 L -29,-3 L -31,-3 Z" fill="#ef4444" />
      <path d="M -31,6 L -29,6 L -29,3 L -31,3 Z" fill="#ef4444" />

      {/* ================= BENDERA PRESIDEN ================= */}
      <g>
        {/* Tiang Kiri & Bayangan Tiang */}
        <line x1="19" y1="-7" x2="19" y2="-15" stroke="#94a3b8" strokeWidth="0.8" />
        <path d="M 19,-15 L 25,-13.5 L 19,-11 Z" fill={accent} />
        <path d="M 19,-15 L 25,-13.5 L 19,-12 Z" fill="#fff" opacity=".4" /> {/* Lipatan kain */}
        
        {/* Tiang Kanan & Bayangan Tiang */}
        <line x1="19" y1="7" x2="19" y2="15" stroke="#94a3b8" strokeWidth="0.8" />
        <path d="M 19,15 L 25,13.5 L 19,11 Z" fill={accent} />
        <path d="M 19,15 L 25,13.5 L 19,12 Z" fill="#fff" opacity=".4" />
      </g>

      {/* ================= ATAP: LAMBANG & STROBO ================= */}
      {/* Panel Atap Khusus */}
      <rect x="-8" y="-5" width="12" height="10" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
      
      {/* Lambang Pakta Non-Agresi */}
      <g transform="scale(.8) translate(-2 0)">
        <NonAggressionPactIcon accent={accent} />
      </g>

      {/* Lampu Strobo / Sirine (Menyala) */}
      <circle cx="6" cy="0" r="2.5" fill="#ef4444" opacity=".9" className="animate-pulse" />
      <circle cx="6" cy="0" r="1.5" fill="#fff" opacity=".8" />
      
      {/* Efek Pendaran Strobo */}
      <circle cx="6" cy="0" r="6" fill="#ef4444" opacity=".2" className="animate-ping" />
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