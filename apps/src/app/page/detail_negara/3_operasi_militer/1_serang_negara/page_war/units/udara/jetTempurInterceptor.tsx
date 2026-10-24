import type { UnitIconProps } from "../unitIconProps";

export default function JetTempurInterceptor({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M24 2 27 11 45 19 45 22 27 19 27 26 35 30 35 32 24 30 13 32 13 30 21 26 21 19 3 22 3 19 21 11z" />
      <path d="M21 12h6v2h-6z" fill="#071414" opacity=".4" />
      <path d="M7 25h5m24 0h5" stroke="currentColor" strokeWidth="1.5" />
    </g>
  );
}
