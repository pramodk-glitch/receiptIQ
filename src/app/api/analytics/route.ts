import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();

  // Also support internal calls from dashboard server component
  const internalUserId = request.headers.get("x-internal-user-id");

  const userId = session?.user?.id ?? internalUserId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If using internal header, still validate against provided userId
  if (internalUserId && session?.user?.id && internalUserId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlyRaw, categoryRaw, recentRaw, totalThisMonthRaw, receiptCount] =
    await Promise.all([
      // Monthly totals: last 12 months
      prisma.$queryRaw<Array<{ month: string; total: number }>>`
        SELECT
          to_char(DATE_TRUNC('month', "receiptDate"), 'YYYY-MM') AS month,
          CAST(SUM("totalAmount") AS float) AS total
        FROM "Receipt"
        WHERE "userId" = ${userId}
          AND "receiptDate" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "receiptDate")
        ORDER BY DATE_TRUNC('month', "receiptDate") ASC
      `,

      // Category breakdown: all time
      prisma.$queryRaw<Array<{ category: string; total: number }>>`
        SELECT
          ri.category,
          CAST(SUM(ri."lineTotal") AS float) AS total
        FROM "ReceiptItem" ri
        WHERE ri."userId" = ${userId}
        GROUP BY ri.category
        ORDER BY total DESC
      `,

      // Recent receipts with item count
      prisma.receipt.findMany({
        where: { userId },
        orderBy: { receiptDate: "desc" },
        take: 10,
        include: {
          _count: { select: { items: true } },
        },
      }),

      // Total this month
      prisma.receipt.aggregate({
        where: {
          userId,
          receiptDate: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),

      // Total receipts
      prisma.receipt.count({ where: { userId } }),
    ]);

  const totalThisMonth = totalThisMonthRaw._sum.totalAmount ?? 0;

  const topCategory =
    categoryRaw.length > 0 ? categoryRaw[0].category : "N/A";

  const recentReceipts = recentRaw.map((r) => ({
    id: r.id,
    storeName: r.storeName,
    receiptDate: r.receiptDate.toISOString(),
    totalAmount: r.totalAmount,
    currency: r.currency,
    source: r.source,
    itemCount: r._count.items,
  }));

  return NextResponse.json({
    monthlyTotals: monthlyRaw.map((r) => ({
      month: r.month,
      total: Number(r.total),
    })),
    categoryBreakdown: categoryRaw.map((r) => ({
      category: r.category,
      total: Number(r.total),
    })),
    recentReceipts,
    totalThisMonth: Number(totalThisMonth),
    topCategory,
    receiptCount,
  });
}
