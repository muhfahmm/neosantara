import type { UnitIconProps } from "../unitIconProps";

export default function PertahananUdaraMobile({ color }: UnitIconProps) {
  return (
    <g color={color} fill="currentColor">
      <path d="M5 18h37v5H5z" />
      <rect x="12" y="12" width="18" height="6" rx="2" />
      <path d="m19 12 7-9 2 1-5 10zm7 1 10-7 1 2-8 7z" />
      <path d="m29 5 2-3 2 4zm8 1 3-2v4z" />
      <circle cx="13" cy="24" r="3" /><circle cx="35" cy="24" r="3" />
    </g>
  );
}
