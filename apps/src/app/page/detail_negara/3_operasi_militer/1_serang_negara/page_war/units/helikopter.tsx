interface HelikopterProps {
  color: string;
}

export default function Helikopter({ color }: HelikopterProps) {
  return (
    <g color={color}>
      <g className="nw-a nw-rotor">
        <ellipse cx="22" cy="6" rx="21" ry="1.5" fill="currentColor" opacity="0.8" />
      </g>
      <rect x="21" y="6" width="2" height="4" fill="currentColor" />
      <ellipse cx="22" cy="16" rx="12" ry="6" fill="currentColor" />
      <path d="M30 14 L46 11 V14.5 L32 19 Z" fill="currentColor" />
      <circle cx="46" cy="12.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M12 25 H30 M16 22 V25 M26 22 V25" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M11 14 Q13 11 17 11 V16 H11 Z" fill="#050b14" opacity="0.55" />
    </g>
  );
}
