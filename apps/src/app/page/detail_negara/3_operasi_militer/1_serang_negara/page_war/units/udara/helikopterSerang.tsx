import type { UnitIconProps } from "../unitIconProps";

export default function HelikopterSerang({ color }: UnitIconProps) {
  return (
    <g color={color}>
      <g className="nw-a nw-rotor">
        <ellipse cx="22" cy="5" rx="21" ry="1.4" fill="currentColor" opacity=".8" />
      </g>
      <rect x="21" y="5" width="2" height="5" fill="currentColor" />
      <path d="M11 15c1-4 5-6 12-6 5 0 9 2 11 5l-4 5H15z" fill="currentColor" />
      <path d="m31 13 14-3 1 3-13 5z" fill="currentColor" />
      <circle cx="45" cy="11" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 25h22m-17-3v5m12-5v5M5 20l7 2m-7 2 7-2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 13h6v4h-7z" fill="#071414" opacity=".55" />
    </g>
  );
}
