import Tank from "./tank";
import Helikopter from "./helikopter";

interface UnitMarkerProps {
  x: number;
  y: number;
  kind: "tank" | "heli";
  hostile?: boolean;
  color: string;
  label?: string;
  echelon?: string;
}

export default function UnitMarker({
  x,
  y,
  kind,
  hostile = false,
  color,
  label,
  echelon,
}: UnitMarkerProps) {
  return (
    <g>
      {kind === "heli" && (
        <ellipse
          cx={x + 8}
          cy={y + (hostile ? 36 : 30)}
          rx="13"
          ry="4"
          fill="#000"
          opacity="0.35"
          filter="url(#nw-soft)"
        />
      )}
      {hostile ? (
        <polygon
          points={`${x},${y - 24} ${x + 28},${y} ${x},${y + 24} ${x - 28},${y}`}
          fill="#12060a"
          fillOpacity="0.75"
          stroke={color}
          strokeWidth="1.6"
        />
      ) : (
        <rect
          x={x - 24}
          y={y - 16}
          width="48"
          height="32"
          rx="3"
          fill="#050b14"
          fillOpacity="0.75"
          stroke={color}
          strokeWidth="1.6"
        />
      )}
      <svg
        x={hostile ? x - 14 : x - 17}
        y={hostile ? y - 9 : y - 11}
        width={hostile ? 28 : 34}
        height={hostile ? 18 : 22}
        viewBox={kind === "tank" ? "0 0 48 28" : "0 0 48 30"}
        color={color}
      >
        {kind === "tank" ? <Tank color={color} /> : <Helikopter color={color} />}
      </svg>
      {echelon && (
        <text
          x={x}
          y={hostile ? y - 29 : y - 21}
          textAnchor="middle"
          fontSize="10"
          fontWeight="800"
          fill={color}
          fontFamily="monospace"
        >
          {echelon}
        </text>
      )}
      {label && (
        <text
          x={x}
          y={y + (hostile ? 40 : 30)}
          textAnchor="middle"
          fontSize="10"
          fontWeight="800"
          letterSpacing="1.5"
          fill={color}
          stroke="#000"
          strokeWidth="3"
          paintOrder="stroke"
          fontFamily="monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
}
