import type { UnitIconProps } from "../unitIconProps";

export default function PeluncurRoket({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M5 17h38v6H5z" />
      <path d="M12 8h25v9H12z" opacity=".75" />
      {[15, 21, 27, 33].map((cx) => <path key={cx} d={`M${cx} 9v7`} stroke="#071414" strokeWidth="1.8" />)}
      <circle cx="13" cy="24" r="3" /><circle cx="34" cy="24" r="3" />
      <path d="m37 5 5 3-5 3z" />
    </g>
  );
}
