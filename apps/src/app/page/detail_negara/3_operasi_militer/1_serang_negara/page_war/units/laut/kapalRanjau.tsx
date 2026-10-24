import type { UnitIconProps } from "../unitIconProps";

export default function KapalRanjau({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M7 18h34l-7 7H14z" />
      <path d="M16 13h15l4 5H12z" opacity=".8" />
      <rect x="21" y="9" width="7" height="4" />
      <path d="M24 5h1.5v4H24zM5 27c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="42" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </g>
  );
}
