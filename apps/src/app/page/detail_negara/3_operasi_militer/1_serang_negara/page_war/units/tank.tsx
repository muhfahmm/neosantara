interface TankProps {
  color: string;
}

export default function Tank({ color }: TankProps) {
  return (
    <g color={color}>
      <rect x="4" y="18" width="36" height="7" rx="3.5" fill="currentColor" opacity="0.55" />
      {[9, 16, 23, 30, 37].map((cx) => (
        <circle key={cx} cx={cx} cy="21.5" r="2.2" fill="currentColor" />
      ))}
      <path d="M8 18 L11 11 H35 L39 18 Z" fill="currentColor" />
      <path d="M16 11 L18.5 5 H29 L31.5 11 Z" fill="currentColor" />
      <rect x="30" y="6.6" width="17" height="2.4" rx="1" fill="currentColor" />
    </g>
  );
}
