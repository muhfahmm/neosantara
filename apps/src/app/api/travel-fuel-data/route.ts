import { NextResponse } from "next/server";
import { queryDb } from "@/lib/db";

interface TravelFuelRow {
  country_slug: string;
  target_country_slug: string;
  konsumsi_minyak: number | string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin")?.trim().toLowerCase();
  const target = searchParams.get("target")?.trim().toLowerCase();

  if (!origin || !target || origin === target) {
    return NextResponse.json({ error: "Valid origin and target are required" }, { status: 400 });
  }

  try {
    const rows = await queryDb<TravelFuelRow[]>(
      `SELECT country_slug, target_country_slug, konsumsi_minyak
       FROM database_perjalanan_antar_negara
       WHERE country_slug = $1 AND target_country_slug = $2
       LIMIT 1`,
      [origin, target],
    );
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Travel fuel rate not found" }, { status: 404 });
    }

    const consumption = Number(row.konsumsi_minyak);
    if (!Number.isFinite(consumption) || consumption < 0) {
      throw new Error("Invalid konsumsi_minyak in database_perjalanan_antar_negara");
    }

    return NextResponse.json({
      country_slug: row.country_slug,
      target_country_slug: row.target_country_slug,
      konsumsi_minyak: consumption,
    });
  } catch (error) {
    console.error("Error querying database_perjalanan_antar_negara:", error);
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
