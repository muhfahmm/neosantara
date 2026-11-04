'use client';

import React, { useId } from 'react';
import DiplomacyPathAnimation, { 
  type DiplomacyPathMetadata, 
  type DiplomacyPathProps, 
  type DiplomacyPathVehicle 
} from './diplomacy-path-animation';

// --- IKON LAMBANG PERISAI (Defense Alliance) ---
function DefenseAllianceIcon({ accent = '#A78BFA' }: { accent?: string }) {
  return (
    <g>
      <path 
        d="M0,-7 L6,-4 L6,2 Q6,7 0,8 Q-6,7 -6,2 L-6,-4 Z" 
        fill="none" 
        stroke="#fff" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
        opacity=".9"
      />
      <path d="M-3,-1 L0,-4 L3,-1" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-3,3 L0,0 L3,3" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
    </g>
  );
}

// --- DESAIN KENDARAAN TAKTIS (Armored Command Vehicle) ---
const DefenseAllianceVehicle: DiplomacyPathVehicle = ({ accent }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  
  return (
    <g>
      {/* ================= DEFINISI GRADIEN & FILTER ================= */}
      <defs>


        {/* Gradien Bodi (Baja Militer Gelap) */}
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="40%" stopColor="#0f172a" />
          <stop offset="80%" stopColor="#020617" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Gradien Kaca Anti-Peluru */}
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.6" />
          <stop offset="30%" stopColor="#1e293b" stopOpacity="0.9" />
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
        cx="1" cy="5" rx="29" ry="12" 
        fill="#000" opacity=".55" 
      />

      {/* ================= RODA & PELEK (Heavy Duty) ================= */}
      {/* Roda Depan */}
      <g>
        <rect x="12" y="-10.5" width="9" height="4.5" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="13.5" y="-9.5" width="6" height="2.5" rx="0.5" fill="#64748b" opacity=".6" />
        <rect x="12" y="6" width="9" height="4.5" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="13.5" y="7" width="6" height="2.5" rx="0.5" fill="#64748b" opacity=".6" />
      </g>

      {/* Roda Belakang */}
      <g>
        <rect x="-24" y="-10.5" width="9" height="4.5" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="-22.5" y="-9.5" width="6" height="2.5" rx="0.5" fill="#64748b" opacity=".6" />
        <rect x="-24" y="6" width="9" height="4.5" rx="1.5" fill={`url(#tire-${uid})`} />
        <rect x="-22.5" y="7" width="6" height="2.5" rx="0.5" fill="#64748b" opacity=".6" />
      </g>

      {/* ================= BODI MOBIL (CHASSIS TAKTIS) ================= */}
      {/* Bodi Utama (Bentuk Kotak Tajam) */}
      <path
        d="M-28,-7 L16,-7 C24,-7 29,-4 30,0 C29,4 24,7 16,7 L-28,7 C-31,7 -32,3 -32,0 C-32,-3 -31,-7 -28,-7 Z"
        fill={`url(#body-${uid})`}
        stroke="#020617"
        strokeWidth="0.8"
      />
      
      {/* Aksen Garis Bodi (Warna Aliansi) */}
      <path 
        d="M-31,0 C-31,-3 -29,-6 -28,-7 L16,-7 C24,-7 29,-4 30,0" 
        fill="none" stroke={accent} strokeWidth="0.8" opacity=".9" 
      />
      <path 
        d="M-31,0 C-31,3 -29,6 -28,7 L16,7 C24,7 29,4 30,0" 
        fill="none" stroke={accent} strokeWidth="0.4" opacity=".5" 
      />

      {/* Panel Bodi (Door Lines & Armor Plates) */}
      <path d="M -4,-7 L -4,7" stroke="#000" strokeWidth="1" opacity=".6" />
      <path d="M 8,-7 L 8,7" stroke="#000" strokeWidth="1" opacity=".6" />
      <path d="M -20,-7 L -20,7" stroke="#000" strokeWidth="0.8" opacity=".4" />

      {/* ================= KABIN & KACA ================= */}
      {/* Kaca Depan (Miring / Sloped Armor) */}
      <path 
        d="M 10,-6.5 L 16,-6.5 C 17.5,-3 17.5,3 16,6.5 L 10,6.5 Z" 
        fill={`url(#glass-${uid})`} 
        stroke="#1e293b"
        strokeWidth="0.5"
      />
      {/* Kaca Belakang */}
      <path 
        d="M -22,-6.5 L -16,-6.5 L -16,6.5 L -22,6.5 Z" 
        fill={`url(#glass-${uid})`} 
        stroke="#1e293b"
        strokeWidth="0.5"
      />
      
      {/* Atap Taktis (Datar) */}
      <path
        d="M-16,-7 L 9,-7 C 11,-7 12,-3 12,0 C 12,3 11,7 9,7 L-16,7 C -18,7 -19,3 -19,0 C -19,-3 -18,-7 -16,-7 Z"
        fill="#0f172a"
        stroke="#1e293b"
        strokeWidth="0.8"
      />
      {/* Highlight Atap */}
      <path d="M-15,-6 L 8,-6 C 10,-6 11,-3 11,0 L-17,0 Z" fill="#fff" opacity=".05" />

      {/* Kaca Samping */}
      <path d="M -16,-7 L -19,-6 L -19,6 L -16,7 Z" fill={`url(#glass-${uid})`} />
      <path d="M 9,-7 L 12,-6 L 12,6 L 9,7 Z" fill={`url(#glass-${uid})`} />

      {/* Pantulan Kaca */}
      <path d="M 11,-5 L 15,-5 L 15,-2 L 11,-2 Z" fill="#fff" opacity=".15" />
      <path d="M -21,-5 L -17,-5 L -17,-2 L -21,-2 Z" fill="#fff" opacity=".1" />

      {/* ================= DETAIL EKSTERIOR ================= */}
      {/* Spion Taktis */}
      <path d="M 8,-9 L 10,-8 L 10,-7 L 8,-7 Z" fill="#020617" stroke="#475569" strokeWidth="0.4" />
      <path d="M 8,9 L 10,8 L 10,7 L 8,7 Z" fill="#020617" stroke="#475569" strokeWidth="0.4" />

      {/* Gril Depan (Bullbar) */}
      <path d="M 26,-4 L 29,-1 L 29,1 L 26,4" fill="none" stroke="#475569" strokeWidth="1.5" />
      <line x1="27" y1="-3" x2="29" y2="0" stroke="#64748b" strokeWidth="1" />
      <line x1="27" y1="3" x2="29" y2="0" stroke="#64748b" strokeWidth="1" />

      {/* Lampu Depan (LED Taktis) */}
      <path d="M 27,-6.5 L 29.5,-5 L 29.5,-3.5 L 27,-3 Z" fill="#f8fafc" opacity=".95" />
      <path d="M 27,6.5 L 29.5,5 L 29.5,3.5 L 27,3 Z" fill="#f8fafc" opacity=".95" />
      {/* Efek Glow */}
      <path d="M 29.5,-5 L 32,-4 L 32,-2 L 29.5,-3 Z" fill={accent} opacity=".4" />
      <path d="M 29.5,5 L 32,4 L 32,2 L 29.5,3 Z" fill={accent} opacity=".4" />

      {/* Lampu Belakang */}
      <path d="M -31,-6 L -29,-6 L -29,-3 L -31,-3 Z" fill="#ef4444" />
      <path d="M -31,6 L -29,6 L -29,3 L -31,3 Z" fill="#ef4444" />

      {/* ================= ATAP: LAMBANG, ANTENA & RADAR ================= */}
      
      {/* Panel Atap Taktis */}
      <rect x="-8" y="-5" width="12" height="10" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
      
      {/* Lambang Perisai Aliansi */}
      <g transform="scale(.85) translate(-2 0)">
        <DefenseAllianceIcon accent={accent} />
      </g>

      {/* Antena Komunikasi Satelit (Belakang Atap) */}
      <line x1="-12" y1="-5" x2="-15" y2="-12" stroke="#94a3b8" strokeWidth="0.8" />
      <circle cx="-15" cy="-12" r="1.5" fill={accent} />
      {/* Efek Sinyal Radar Berkedip */}
      <circle cx="-15" cy="-12" r="4" fill={accent} opacity=".4" className="animate-ping" />

      {/* Sirine / Rotator Militer (Depan Atap) */}
      <rect x="4" y="-2.5" width="3" height="5" rx="1" fill="#ef4444" opacity=".9" />
      <path d="M 5.5,-2.5 L 5.5,2.5" stroke="#fff" strokeWidth="0.5" opacity=".5" />
      <circle cx="5.5" cy="0" r="6" fill="#ef4444" opacity=".2" />
    </g>
  );
};

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'defense-alliance',
  document: 'Perjanjian Pertahanan',
  accent: '#A78BFA',
  Icon: DefenseAllianceIcon,
  Vehicle: DefenseAllianceVehicle,
};

export default function DefenseAlliancePath(props: DiplomacyPathProps) {
  return <DiplomacyPathAnimation {...props} kind={PATH_METADATA.kind} accent={PATH_METADATA.accent} Vehicle={PATH_METADATA.Vehicle} />;
}