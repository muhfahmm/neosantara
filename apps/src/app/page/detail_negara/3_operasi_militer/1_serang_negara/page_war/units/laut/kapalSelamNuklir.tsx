import type { UnitIconProps } from "../unitIconProps";

export default function KapalSelamNuklir({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M4 19c4-8 35-8 40 0-5 9-36 9-40 0z" />
      <path d="M20 12V8h9v5h-2v-3h-5v3z" />
      <circle cx="13" cy="19" r="1" fill="#071414" />
      <path d="M5 28h38" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx="35" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="m35 5 1 2h-2zm2.5 4-2 .3.8-1.7zm-5 0 1.2-1.7.7 1.8z" />
    </g>
  );
}
