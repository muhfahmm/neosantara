import type { UnitIconProps } from "../unitIconProps";

export default function Destroyer({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M4 19h40l-7 7H12z" />
      <path d="M12 14h23l5 5H8z" opacity=".8" />
      <rect x="18" y="9" width="10" height="5" />
      <path d="M22 4h2v5h-2zm6 2h7v1.5h-7zM11 16l7-2 3 2z" />
      <path d="M14 21h18" stroke="#071414" strokeWidth="1.3" />
    </g>
  );
}
