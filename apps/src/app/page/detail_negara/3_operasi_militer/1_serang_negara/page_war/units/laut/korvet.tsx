import type { UnitIconProps } from "../unitIconProps";

export default function Korvet({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M6 19h36l-7 7H13z" />
      <path d="M14 14h20l5 5H10z" opacity=".8" />
      <rect x="20" y="9" width="8" height="5" />
      <path d="M23 5h1.5v4H23zm4 2h6v1.5h-6zM11 16h7v2h-7z" />
      <path d="M17 21h14" stroke="#071414" strokeWidth="1.3" />
    </g>
  );
}
