import type { UnitIconProps } from "../unitIconProps";

export default function KapalInduk({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M3 18h42L39 26H10z" />
      <path d="M9 13h30l3 5H6z" opacity=".75" />
      <path d="M15 8h8v5h-8zm11 1h7v4h-7z" />
      <path d="M18 7h8M29 7h7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m11 20 4 2m7-2 4 2m7-2 4 2" stroke="#071414" strokeWidth="1.2" />
    </g>
  );
}
