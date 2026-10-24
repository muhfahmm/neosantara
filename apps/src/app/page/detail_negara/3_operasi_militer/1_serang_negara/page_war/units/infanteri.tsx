import React from 'react';

interface InfantryArtefactProps {
  color?: string; // Warna utama unit (misal: #00FFAA atau #f43f5e)
  label?: string; // Label teks di bawah unit (misal: "INFANTRY DIV")
  size?: number;  // Ukuran unit (dalam pixel)
  className?: string;
  onClick?: () => void;
}

export default function InfantryArtefact({
  color = '#00FFAA',
  label = 'INFANTRY',
  size = 48,
  className = '',
  onClick,
}: InfantryArtefactProps) {
  // ID unik untuk filter glow agar tidak bentrok jika ada banyak unit
  const glowId = `glow-inf-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-110 ${className}`}
      style={{ width: size, height: size + 20 }} // +20 untuk ruang label
      onClick={onClick}
    >
      {/* SVG Unit Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Bingkai Luar (Hexagon/Radar Style) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeDasharray="10 5"
          className="animate-[spin_10s_linear_infinite] origin-center"
        />

        {/* Base Unit (Kotak Transparan) */}
        <rect
          x="15"
          y="15"
          width="70"
          height="70"
          rx="8"
          fill="#050B0B"
          fillOpacity="0.8"
          stroke={color}
          strokeWidth="3"
          filter={`url(#${glowId})`}
          className="transition-all duration-300 group-hover:fill-opacity-100"
        />

        {/* Simbol NATO Infanteri (Dua Garis Menyilang) */}
        <line
          x1="25"
          y1="25"
          x2="75"
          y2="75"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="75"
          y1="25"
          x2="25"
          y2="75"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Titik Pusat / Radar Ping */}
        <circle cx="50" cy="50" r="6" fill={color} className="animate-ping" />
        <circle cx="50" cy="50" r="4" fill="#ffffff" />
      </svg>

      {/* Label Teks di Bawah Unit */}
      <div 
        className="absolute -bottom-1 whitespace-nowrap px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase transition-colors duration-300"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          color: color,
          border: `1px solid ${color}50`,
          textShadow: `0 0 5px ${color}`
        }}
      >
        {label}
      </div>
    </div>
  );
}