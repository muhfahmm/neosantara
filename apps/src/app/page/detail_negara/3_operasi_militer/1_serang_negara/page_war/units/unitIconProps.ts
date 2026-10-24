export interface UnitIconProps {
  color: string;
}

export type UnitKind =
  | "infanteri"
  | "tank"
  | "apcIfv"
  | "artileriBerat"
  | "peluncurRoket"
  | "pertahananUdaraMobile"
  | "kendaraanTaktis"
  | "kapalInduk"
  | "kapalIndukNuklir"
  | "destroyer"
  | "korvet"
  | "kapalSelamNuklir"
  | "kapalSelamReguler"
  | "kapalRanjau"
  | "kapalLogistik"
  | "jetTempurSiluman"
  | "jetTempurInterceptor"
  | "pesawatPengebom"
  | "helikopterSerang"
  | "pesawatPengintai"
  | "droneIntaiUav"
  | "droneKamikaze"
  | "pesawatAngkut";
