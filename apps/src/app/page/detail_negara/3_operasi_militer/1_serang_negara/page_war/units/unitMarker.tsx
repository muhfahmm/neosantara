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

  return (
    <g>
      <title>
        {[label, quantity !== undefined ? `Jumlah: ${quantity.toLocaleString("id-ID")}` : null]
          .filter(Boolean)
          .join(" | ")}
      </title>
      {!disableEffects && AIR_UNIT_KINDS.includes(kind) && (
        <ellipse
          cx={x}
          cy={y + 15}
          rx="15"
          ry="3"
          fill="#000"
          opacity="0.3"
          filter="url(#nw-soft)"
        />
      )}
      <svg
        x={x - 22}
        y={y - 16}
        width="44"
        height="30"
        viewBox="0 0 48 32"
        color={color}
        style={disableEffects ? undefined : { filter: `drop-shadow(0 0 4px ${color}99)` }}
      >
        <UnitIcon color={color} />
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
