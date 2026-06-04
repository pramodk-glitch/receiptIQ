import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const rows = await prisma.$queryRaw<
    Array<{
      itemNameNormalized: string;
      storeChain: string;
      latestPrice: number;
      historicalAvg: number;
      percentChange: number;
      capturedAt: string;
    }>
  >`
    WITH recent AS (
      SELECT DISTINCT ON ("itemNameNormalized")
        "itemNameNormalized",
        "storeChain",
        "unitPrice" AS "latestPrice",
        "capturedAt"
      FROM "PriceHistory"
      WHERE "userId" = ${userId}
        AND "unitPrice" > 0
      ORDER BY "itemNameNormalized", "capturedAt" DESC
    ),
    historical AS (
      SELECT
        "itemNameNormalized",
        AVG("unitPrice") AS "historicalAvg"
      FROM "PriceHistory"
      WHERE "userId" = ${userId}
        AND "capturedAt" < NOW() - INTERVAL '1 month'
        AND "unitPrice" > 0
      GROUP BY "itemNameNormalized"
      HAVING COUNT(*) >= 3
    )
    SELECT
      r."itemNameNormalized",
      r."storeChain",
      CAST(r."latestPrice" AS float) AS "latestPrice",
      CAST(h."historicalAvg" AS float) AS "historicalAvg",
      CAST(((r."latestPrice" - h."historicalAvg") / NULLIF(h."historicalAvg", 0)) * 100 AS float) AS "percentChange",
      to_char(r."capturedAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "capturedAt"
    FROM recent r
    JOIN historical h USING ("itemNameNormalized")
    WHERE r."latestPrice" > h."historicalAvg" * 1.2
    ORDER BY "percentChange" DESC
    LIMIT 20
  `;

  return NextResponse.json(
    rows.map((r) => ({
      itemNameNormalized: r.itemNameNormalized,
      storeChain: r.storeChain,
      latestPrice: Number(r.latestPrice),
      historicalAvg: Number(r.historicalAvg),
      percentChange: Number(r.percentChange),
      capturedAt: r.capturedAt,
    }))
  );
}
