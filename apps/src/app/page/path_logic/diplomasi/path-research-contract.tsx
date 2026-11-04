'use client';

import React, { useId } from 'react';
import DiplomacyPathAnimation, { 
  type DiplomacyPathMetadata, 
  type DiplomacyPathProps, 
  type DiplomacyPathVehicle 
} from './diplomacy-path-animation';

// --- IKON ATOM (Untuk di Atap Mobil) ---
function ResearchContractIcon({ accent = '#FB7185' }: { accent?: string }) {
  return (
    <g>
      {/* Inti Atom */}
      <circle cx="0" cy="0" r="1.8" fill="#fff" />
      <circle cx="0" cy="0" r="3.5" fill={accent} opacity=".4" />
      {/* Orbit Elektron */}
      <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".9" />
      <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.2" transform="rotate(60)" opacity=".9" />
      <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.2" transform="rotate(-60)" opacity=".9" />
    </g>
  );
}

// --- DESAIN MOBIL PENELITIAN FUTURISTIK ---
const ResearchContractVehicle: DiplomacyPathVehicle = ({ accent }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  
  return (
    <g>
      {/* ================= DEFINISI GRADIEN & FILTER ================= */}
      <defs>


        {/* Gradien Bodi (Putih Mutiara / Silver Tech) */}
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Gradien Kaca (Biru Sian / High-Tech Glass) */}
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#0f172a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </linearGradient>

        {/* Gradien Ban */}
        <radialGradient id={`tire-${uid}`} cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#111827" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
      </defs>

      {/* ================= BAYANGAN TANAH ================= */}
      <ellipse 
        cx="1" cy="5" rx="30" ry="12" 
        fill="#000" opacity=".45" 
      />

      {/* ================= RODA & PELEK (Futuristik) ================= */}
      <g>
        {/* Depan */}
        <rect x="13" y="-10" width="8" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="14.5" y="-9" width="5" height="2" rx="0.5" fill="#cbd5e1" opacity=".8" />
        <rect x="13" y="6" width="8" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="14.5" y="7" width="5" height="2" rx="0.5" fill="#cbd5e1" opacity=".8" />
        
        {/* Belakang */}
        <rect x="-23" y="-10" width="8" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="-21.5" y="-9" width="5" height="2" rx="0.5" fill="#cbd5e1" opacity=".8" />
        <rect x="-23" y="6" width="8" height="4" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="-21.5" y="7" width="5" height="2" rx="0.5" fill="#cbd5e1" opacity=".8" />
      </g>

      {/* ================= BODI MOBIL (CHASSIS) ================= */}
      {/* Bodi Utama (Aerodinamis) */}
      <path
        d="M-28,-7 L16,-7 C24,-7 29,-4 30,0 C29,4 24,7 16,7 L-28,7 C-31,7 -32,3 -32,0 C-32,-3 -31,-7 -28,-7 Z"
        fill={`url(#body-${uid})`}
        stroke="#64748b"
        strokeWidth="0.8"
      />
      
      {/* Sorotan Tepi Bodi (Rim Light Warna Aksen) */}
      <path 
        d="M-31,0 C-31,-3 -29,-6 -28,-7 L16,-7 C24,-7 29,-4 30,0" 
        fill="none" stroke={accent} strokeWidth="0.8" opacity=".9" 
      />

      {/* Garis Panel Pintu */}
      <path d="M -2,-7 L -2,7" stroke="#64748b" strokeWidth="0.8" opacity=".5" />
      <path d="M 10,-7 L 10,7" stroke="#64748b" strokeWidth="0.8" opacity=".5" />

      {/* Sensor / Panel Teknologi di Kap */}
      <path d="M 20,-5 L 26,-5 L 26,5 L 20,5 Z" fill="#1e293b" opacity=".2" rx="1" />
      <line x1="22" y1="-4" x2="24" y2="-4" stroke={accent} strokeWidth="1" />
      <line x1="22" y1="0" x2="25" y2="0" stroke={accent} strokeWidth="1" />
      <line x1="22" y1="4" x2="24" y2="4" stroke={accent} strokeWidth="1" />

      {/* ================= KABIN & KACA ================= */}
      {/* Kaca Depan (Sloped / Futuristik) */}
      <path 
        d="M 12,-6.5 L 17,-6.5 C 18.5,-3 18.5,3 17,6.5 L 12,6.5 Z" 
        fill={`url(#glass-${uid})`} 
        stroke="#64748b"
        strokeWidth="0.5"
      />
      {/* Kaca Belakang */}
      <path 
        d="M -21,-6.5 L -15,-6.5 L -15,6.5 L -21,6.5 Z" 
        fill={`url(#glass-${uid})`} 
        stroke="#64748b"
        strokeWidth="0.5"
      />
      
      {/* Atap Mobil (Putih Mutiara) */}
      <path
        d="M-15,-7 L 11,-7 C 13,-7 14,-3 14,0 C 14,3 13,7 11,7 L-15,7 C -17,7 -18,3 -18,0 C -18,-3 -17,-7 -15,-7 Z"
        fill={`url(#body-${uid})`}
        stroke="#94a3b8"
        strokeWidth="0.8"
      />
      {/* Highlight Atap */}
      <path d="M-14,-6 L 10,-6 C 12,-6 13,-3 13,0 L-16,0 Z" fill="#fff" opacity=".6" />

      {/* Kaca Samping */}
      <path d="M -15,-7 L -18,-6 L -18,6 L -15,7 Z" fill={`url(#glass-${uid})`} />
      <path d="M 11,-7 L 14,-6 L 14,6 L 11,7 Z" fill={`url(#glass-${uid})`} />

      {/* Pantulan Kaca */}
      <path d="M 13,-5 L 16,-5 L 16,-2 L 13,-2 Z" fill="#fff" opacity=".3" />
      <path d="M -20,-5 L -16,-5 L -16,-2 L -20,-2 Z" fill="#fff" opacity=".2" />

      {/* ================= DETAIL EKSTERIOR ================= */}
      {/* Spion */}
      <path d="M 10,-9 L 12,-8 L 12,-7 L 10,-7 Z" fill="#1e293b" stroke="#64748b" strokeWidth="0.4" />
      <path d="M 10,9 L 12,8 L 12,7 L 10,7 Z" fill="#1e293b" stroke="#64748b" strokeWidth="0.4" />

      {/* Lampu Depan (Laser/LED Putih) */}
      <path d="M 27,-6.5 L 29.5,-5 L 29.5,-3.5 L 27,-3 Z" fill="#fff" opacity=".95" />
      <path d="M 27,6.5 L 29.5,5 L 29.5,3.5 L 27,3 Z" fill="#fff" opacity=".95" />
      {/* Efek Glow Lampu Depan */}
      <path d="M 29.5,-5 L 32,-4 L 32,-2 L 29.5,-3 Z" fill={accent} opacity=".5" />
      <path d="M 29.5,5 L 32,4 L 32,2 L 29.5,3 Z" fill={accent} opacity=".5" />

      {/* Lampu Belakang */}
      <path d="M -31,-6 L -29,-6 L -29,-3 L -31,-3 Z" fill="#ef4444" />
      <path d="M -31,6 L -29,6 L -29,3 L -31,3 Z" fill="#ef4444" />

      {/* ================= ATAP: LAMBANG & RADAR ================= */}
      
      {/* Panel Atap */}
      <rect x="-8" y="-5" width="12" height="10" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
      
      {/* Lambang Atom Penelitian */}
      <g transform="scale(.85) translate(-2 0)">
        <ResearchContractIcon accent={accent} />
      </g>

      {/* Parabola Radar / Satelit Komunikasi (Belakang Atap) */}
      <path d="M -12,-4 Q -15,-8 -12,-11 Q -9,-8 -12,-4 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
      <line x1="-12" y1="-4" x2="-12" y2="0" stroke="#64748b" strokeWidth="1" />
      <circle cx="-12" cy="-8" r="2" fill={accent} opacity=".8" className="animate-pulse" />

      {/* Senter Sorot / Sensor Pemindai (Depan Atap) */}
      <rect x="6" y="-2" width="2" height="4" rx="0.5" fill="#1e293b" />
      <circle cx="7" cy="0" r="2" fill={accent} opacity=".9" className="animate-ping" />
    </g>
  );
};

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