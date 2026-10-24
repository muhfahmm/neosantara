import type { UnitIconProps } from "../unitIconProps";

export default function JetTempurSiluman({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M24 2 28 12 44 21 43 24 28 20 27 27 34 30 34 32 24 30 14 32 14 30 21 27 20 20 5 24 4 21 20 12z" />
      <path d="M22 12h4v7h-4z" fill="#071414" opacity=".35" />
    </g>
  );
}
