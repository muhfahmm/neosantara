import assert from "node:assert/strict";
import test from "node:test";
import { getAnnexedTerritories } from "./annexedTerritoriesLogic.ts";

const countries = [
  { country: "Negara Pemain", iso: "np" },
  { country: "Negara Penuh", iso: "nf" },
  { country: "Negara Sebagian", iso: "ns" },
];

test("lists fully annexed countries and groups captured cities by their original country", () => {
  const territories = getAnnexedTerritories(
    "Negara Pemain",
    {
      "Negara Penuh": { attackerCountry: "Negara Pemain" },
      iso_nf: { attackerCountry: "Negara Pemain" },
    },
    {
      "ns:kota-a": {
        cityId: "ns:kota-a",
        cityName: "Kota A",
        countryIso: "ns",
        ownerCountry: "Negara Pemain",
      },
      "region:ns-kawasan": {
        cityId: "region:ns-kawasan",
        cityName: "Kawasan",
        countryIso: "ns",
        ownerCountry: "Negara Pemain",
      },
      "ns:kota-b": {
        cityId: "ns:kota-b",
        cityName: "Kota B",
        countryIso: "ns",
        ownerCountry: "Negara Pemain",
      },
      "np:kota-sendiri": {
        cityId: "np:kota-sendiri",
        cityName: "Kota Sendiri",
        countryIso: "np",
        ownerCountry: "Negara Pemain",
      },
      "nf:kota-terduplikasi": {
        cityId: "nf:kota-terduplikasi",
        cityName: "Kota Terduplikasi",
        countryIso: "nf",
        ownerCountry: "Negara Pemain",
      },
    },
    countries,
  );

  assert.deepEqual(territories, [
    {
      name: "Negara Penuh",
      iso: "nf",
      fullyAnnexed: true,
      cities: [],
    },
    {
      name: "Negara Sebagian",
      iso: "ns",
      fullyAnnexed: false,
      cities: ["Kota A", "Kota B"],
    },
  ]);
});

test("matches country names without case or diacritic differences", () => {
  const territories = getAnnexedTerritories(
    "CÔTE DU PAYS",
    {
      "Nombre Cible": { attackerCountry: "Côte du Pays" },
    },
    {},
    [
      { country: "Côte du Pays", iso: "cp" },
      { country: "Nombre Cible", iso: "nc" },
    ],
  );

  assert.equal(territories[0]?.fullyAnnexed, true);
  assert.equal(territories[0]?.name, "Nombre Cible");
});
