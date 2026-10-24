import type { UnitIconProps } from "../unitIconProps";

export default function PesawatPengebom({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M23 3h3l3 9 14 6v3l-14-2v6l7 4v2l-9-2-9 2v-2l7-4v-6L11 21l-8-2v-2l17-5z" />
      <circle cx="15" cy="22" r="1.3" /><circle cx="33" cy="22" r="1.3" />
    </g>
  );
}
