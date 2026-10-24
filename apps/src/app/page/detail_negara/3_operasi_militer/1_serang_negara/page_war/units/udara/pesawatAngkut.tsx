import type { UnitIconProps } from "../unitIconProps";

export default function PesawatAngkut({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M22 2h4l4 10 14 5v3l-14-1v7l7 4v2l-11-2-11 2v-2l7-4v-7L8 20l-5-3v-2l17-3z" />
      <rect x="21" y="13" width="6" height="7" fill="#071414" opacity=".35" />
      <path d="M9 21h30" stroke="currentColor" strokeWidth="1.2" />
    </g>
  );
}
