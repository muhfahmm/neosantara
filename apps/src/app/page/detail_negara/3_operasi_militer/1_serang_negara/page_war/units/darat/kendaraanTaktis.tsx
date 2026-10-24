import type { UnitIconProps } from "../unitIconProps";

export default function KendaraanTaktis({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="m5 18 5-8h22l9 7v6H5z" />
      <path d="M13 12h8v5H9zm11 0h6l5 5H24z" fill="#071414" opacity=".7" />
      <rect x="25" y="6" width="2" height="5" />
      <rect x="23" y="5" width="6" height="2" rx="1" />
      <circle cx="13" cy="23" r="3" /><circle cx="34" cy="23" r="3" />
    </g>
  );
}
