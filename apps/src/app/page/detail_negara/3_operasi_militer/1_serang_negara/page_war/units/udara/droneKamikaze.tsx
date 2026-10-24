import type { UnitIconProps } from "../unitIconProps";

export default function DroneKamikaze({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M24 3 29 17 44 21 43 24 28 22 27 28 34 31v2l-10-2-10 2v-2l7-3-1-6-15 2-1-3 15-4z" />
      <path d="M22 11h4v7h-4z" fill="#071414" opacity=".4" />
      <path d="m7 8 3 3-3 3-3-3z" />
    </g>
  );
}
