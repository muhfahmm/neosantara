import type { UnitIconProps } from "../unitIconProps";

export default function ApcIfv({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M4 17l4-8h23l9 7v6H4z" />
      <rect x="19" y="6" width="11" height="5" rx="1.5" />
      <rect x="28" y="7" width="13" height="2" rx="1" />
      {[10, 19, 28, 37].map((cx) => <circle key={cx} cx={cx} cy="22" r="2.5" fill="#071414" />)}
      <path d="M8 12h5v4H6zm9 0h5v4h-5zm9 0h4v4h-4z" fill="#071414" opacity=".65" />
    </g>
  );
}
