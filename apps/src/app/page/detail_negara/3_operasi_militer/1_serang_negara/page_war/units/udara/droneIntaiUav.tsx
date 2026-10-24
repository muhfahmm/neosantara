import type { UnitIconProps } from "../unitIconProps";

export default function DroneIntaiUav({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="m24 7 3 7 13 4v2l-13-1v5l6 4v2l-9-2-9 2v-2l6-4v-5L8 20v-2l13-4z" />
      <path d="M22 11h4v3h-4z" />
      <circle cx="24" cy="23" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 10c4-4 8-4 12 0m16 0c4-4 8-4 12 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </g>
  );
}
