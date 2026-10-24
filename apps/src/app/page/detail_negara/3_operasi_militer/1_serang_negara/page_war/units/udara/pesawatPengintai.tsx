import type { UnitIconProps } from "../unitIconProps";

export default function PesawatPengintai({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M23 3h3l2 9 14 6v2l-14-1v7l6 4v2l-9-2-9 2v-2l6-4v-7L8 20l-5-2v-2l17-4z" />
      <circle cx="24.5" cy="17" r="2" fill="#071414" />
      <path d="M13 10h5m12 0h5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </g>
  );
}
