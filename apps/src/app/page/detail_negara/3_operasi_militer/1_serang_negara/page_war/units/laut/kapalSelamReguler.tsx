import type { UnitIconProps } from "../unitIconProps";

export default function KapalSelamReguler({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M4 19c4-8 35-8 40 0-5 9-36 9-40 0z" />
      <path d="M20 12V8h9v5h-2v-3h-5v3z" />
      <circle cx="13" cy="19" r="1" fill="#071414" />
      <path d="M7 26h34m-29 3h24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
      <path d="M44 19h3m-3-3 3-2m-3 8 3 2" stroke="currentColor" strokeWidth="1.4" />
    </g>
  );
}
