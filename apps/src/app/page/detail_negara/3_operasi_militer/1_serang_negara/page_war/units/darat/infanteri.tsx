import type { UnitIconProps } from "../unitIconProps";

export default function Infanteri({ color }: UnitIconProps) {
  return (
    <g fill="currentColor" color={color}>
      <circle cx="15" cy="8" r="3.5" />
      <circle cx="26" cy="6.5" r="3.5" />
      <circle cx="36" cy="9" r="3.5" />
      <path d="M10 13h10l3 8-3 1-1-4-1 9h-3l-1-7-2 7h-3l2-11-3 3-2-2z" />
      <path d="M21 12h10l3 9-3 1-2-5-1 13h-3l-1-9-2 9h-3l2-14-3 3-2-2z" />
      <path d="M32 14h9l3 7-3 1-2-4-1 11h-3l-1-8-2 8h-3l2-12-3 2-2-2z" />
      <path d="M5 16l12-5 1 2-12 5z" opacity=".75" />
    </g>
  );
}
