import type { ComponentType } from "react";
import ApcIfv from "./darat/apcIfv";
import ArtileriBerat from "./darat/artileriBerat";
import Infanteri from "./darat/infanteri";
import KendaraanTaktis from "./darat/kendaraanTaktis";
import PeluncurRoket from "./darat/peluncurRoket";
import PertahananUdaraMobile from "./darat/pertahananUdaraMobile";
import Tank from "./darat/tank";
import Destroyer from "./laut/destroyer";
import KapalInduk from "./laut/kapalInduk";
import KapalIndukNuklir from "./laut/kapalIndukNuklir";
import KapalLogistik from "./laut/kapalLogistik";
import KapalRanjau from "./laut/kapalRanjau";
import KapalSelamNuklir from "./laut/kapalSelamNuklir";
import KapalSelamReguler from "./laut/kapalSelamReguler";
import Korvet from "./laut/korvet";
import DroneIntaiUav from "./udara/droneIntaiUav";
import DroneKamikaze from "./udara/droneKamikaze";
import HelikopterSerang from "./udara/helikopterSerang";
import JetTempurInterceptor from "./udara/jetTempurInterceptor";
import JetTempurSiluman from "./udara/jetTempurSiluman";
import PesawatAngkut from "./udara/pesawatAngkut";
import PesawatPengebom from "./udara/pesawatPengebom";
import PesawatPengintai from "./udara/pesawatPengintai";
import type { UnitIconProps, UnitKind } from "./unitIconProps";

const UNIT_ICONS: Record<UnitKind, ComponentType<UnitIconProps>> = {
  infanteri: Infanteri,
  tank: Tank,
  apcIfv: ApcIfv,
  artileriBerat: ArtileriBerat,
  peluncurRoket: PeluncurRoket,
  pertahananUdaraMobile: PertahananUdaraMobile,
  kendaraanTaktis: KendaraanTaktis,
  kapalInduk: KapalInduk,
  kapalIndukNuklir: KapalIndukNuklir,
  destroyer: Destroyer,
  korvet: Korvet,
  kapalSelamNuklir: KapalSelamNuklir,
  kapalSelamReguler: KapalSelamReguler,
  kapalRanjau: KapalRanjau,
  kapalLogistik: KapalLogistik,
  jetTempurSiluman: JetTempurSiluman,
  jetTempurInterceptor: JetTempurInterceptor,
  pesawatPengebom: PesawatPengebom,
  helikopterSerang: HelikopterSerang,
  pesawatPengintai: PesawatPengintai,
  droneIntaiUav: DroneIntaiUav,
  droneKamikaze: DroneKamikaze,
  pesawatAngkut: PesawatAngkut,
};

const AIR_UNIT_KINDS: UnitKind[] = [
  "jetTempurSiluman",
  "jetTempurInterceptor",
  "pesawatPengebom",
  "helikopterSerang",
  "pesawatPengintai",
  "droneIntaiUav",
  "droneKamikaze",
  "pesawatAngkut",
];

const NAVAL_UNIT_KINDS: UnitKind[] = [
  "kapalInduk",
  "kapalIndukNuklir",
  "destroyer",
  "korvet",
  "kapalSelamNuklir",
  "kapalSelamReguler",
  "kapalRanjau",
  "kapalLogistik",
];

interface UnitMarkerProps {
  x: number;
  y: number;
  kind: UnitKind;
  color: string;
  label?: string;
  quantity?: number;
  echelon?: string;
  disableEffects?: boolean;
}

export default function UnitMarker({
  x,
  y,
  kind,
  color,
  label,
  quantity,
  echelon,
  disableEffects = false,
}: UnitMarkerProps) {
  const UnitIcon = UNIT_ICONS[kind];
  const isAirUnit = AIR_UNIT_KINDS.includes(kind);
  const isNavalUnit = NAVAL_UNIT_KINDS.includes(kind);
  const depthColor = `color-mix(in srgb, ${color} 48%, #06111b)`;
  const motionDelay = [...kind].reduce((delay, character) => delay + character.charCodeAt(0), 0) % 19;

  return (
    <g
      className={`unit-marker${isAirUnit ? " unit-marker-air" : isNavalUnit ? " unit-marker-naval" : " unit-marker-ground"}`}
      style={{ animationDelay: `${motionDelay * -0.17}s` }}
    >
      <title>
        {[label, quantity !== undefined ? `Jumlah: ${quantity.toLocaleString("id-ID")}` : null]
          .filter(Boolean)
          .join(" | ")}
      </title>
      <ellipse
        cx={x}
        cy={y + (isAirUnit ? 15 : 13)}
        rx={isAirUnit ? 15 : isNavalUnit ? 19 : 17}
        ry={isAirUnit ? 3 : 3.5}
        fill="#000"
        opacity={isAirUnit ? "0.28" : "0.38"}
        filter={disableEffects ? undefined : "url(#nw-soft)"}
      />
      <svg
        x={x - 22}
        y={y - 16}
        width="72"
        height="48"
        viewBox="0 0 48 32"
        overflow="visible"
      >
        <g transform="translate(0 2.2)" color={depthColor} opacity="0.95">
          <UnitIcon color={depthColor} />
        </g>
        <g
          color={color}
          style={{
            filter: disableEffects
              ? "drop-shadow(0 1px 1px rgba(2, 6, 23, .65))"
              : `drop-shadow(0 1px 1px rgba(2, 6, 23, .7)) drop-shadow(0 0 2px ${color}70)`,
          }}
        >
          <UnitIcon color={color} />
        </g>
        <g stroke="#f8fafc" strokeOpacity="0.2" strokeWidth="0.45" strokeLinejoin="round" strokeLinecap="round">
          <UnitIcon color={color} />
        </g>
      </svg>
      {echelon && (
        <text
          x={x}
          y={y - 20}
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
          y={y + 29}
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
