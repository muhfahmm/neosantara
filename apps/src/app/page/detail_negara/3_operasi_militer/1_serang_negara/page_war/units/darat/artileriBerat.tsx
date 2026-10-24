import type { UnitIconProps } from "../unitIconProps";

export default function ArtileriBerat({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M7 17h22l5 4H8z" />
      <rect x="11" y="12" width="17" height="6" rx="2" />
      <path d="M22 13 36 5l2 2-13 9z" />
      <circle cx="12" cy="23" r="3" /><circle cx="29" cy="23" r="3" />
      <path d="M6 26h31" fill="none" stroke="currentColor" strokeWidth="2" />
    </g>
  );
}
