import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const item = request.nextUrl.searchParams.get("item");
  if (!item) {
    return NextResponse.json({ error: "item parameter required" }, { status: 400 });
  }

  const itemNorm = item.toLowerCase().trim();

  const rows = await prisma.$queryRaw<
    Array<{
      week: string;
      storeChain: string;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      dataPoints: number;
    }>
  >`
    SELECT
      to_char(time_bucket('1 week', "capturedAt"), 'YYYY-MM-DD') AS week,
      "storeChain",
      CAST(AVG("unitPrice") AS float) AS "avgPrice",
      CAST(MIN("unitPrice") AS float) AS "minPrice",
      CAST(MAX("unitPrice") AS float) AS "maxPrice",
      COUNT(*)::int AS "dataPoints"
    FROM "PriceHistory"
    WHERE "userId" = ${userId}
      AND "itemNameNormalized" = ${itemNorm}
      AND "capturedAt" >= NOW() - INTERVAL '12 months'
    GROUP BY time_bucket('1 week', "capturedAt"), "storeChain"
    ORDER BY time_bucket('1 week', "capturedAt") ASC
  `;

  return NextResponse.json(
    rows.map((r) => ({
      week: r.week,
      storeChain: r.storeChain,
      avgPrice: Number(r.avgPrice),
      minPrice: Number(r.minPrice),
      maxPrice: Number(r.maxPrice),
      dataPoints: Number(r.dataPoints),
    }))
  );
}
