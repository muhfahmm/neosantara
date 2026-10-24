import type { UnitIconProps } from "../unitIconProps";

export default function KapalIndukNuklir({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M3 18h42L39 26H10z" />
      <path d="M8 13h32l4 5H5z" opacity=".75" />
      <path d="M13 8h10v5H13zm13 0h9v5h-9z" />
      <circle cx="39" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m39 3 1.4 3h-2.8zm3.5 6-3.2.4 1.3-2.5zm-7 0 1.9-2.6 1 2.7z" />
    </g>
  );
}
