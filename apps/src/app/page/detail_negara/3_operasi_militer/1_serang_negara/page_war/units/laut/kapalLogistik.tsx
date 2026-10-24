import type { UnitIconProps } from "../unitIconProps";

export default function KapalLogistik({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M3 19h43l-7 7H10z" />
      <path d="M9 12h8v7H7zm10 0h8v7h-8zm10 0h8v7h-8z" opacity=".85" />
      <path d="M13 7h8v5h-8zm10 0h9v5h-9z" />
      <path d="M5 28c3-2 5-2 8 0s5 2 8 0 5-2 8 0 5 2 8 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </g>
  );
}
