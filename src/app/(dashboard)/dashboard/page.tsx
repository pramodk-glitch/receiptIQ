import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryPie } from "@/components/dashboard/CategoryPie";
import { RecentReceipts } from "@/components/dashboard/RecentReceipts";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/db";

async function getAnalytics(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthlyRaw, categoryRaw, recentRaw, totalThisMonthRaw, receiptCount] =
    await Promise.all([
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
      prisma.$queryRaw<Array<{ category: string; total: number }>>`
        SELECT
          ri.category,
          CAST(SUM(ri."lineTotal") AS float) AS total
        FROM "ReceiptItem" ri
        WHERE ri."userId" = ${userId}
        GROUP BY ri.category
        ORDER BY total DESC
      `,
      prisma.receipt.findMany({
        where: { userId },
        orderBy: { receiptDate: "desc" },
        take: 10,
        include: { _count: { select: { items: true } } },
      }),
      prisma.receipt.aggregate({
        where: { userId, receiptDate: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      prisma.receipt.count({ where: { userId } }),
    ]);

  return {
    monthlyTotals: monthlyRaw.map((r) => ({ month: r.month, total: Number(r.total) })),
    categoryBreakdown: categoryRaw.map((r) => ({ category: r.category, total: Number(r.total) })),
    recentReceipts: recentRaw.map((r) => ({
      id: r.id,
      storeName: r.storeName,
      receiptDate: r.receiptDate.toISOString(),
      totalAmount: r.totalAmount,
      currency: r.currency,
      source: r.source,
      itemCount: r._count.items,
    })),
    totalThisMonth: Number(totalThisMonthRaw._sum.totalAmount ?? 0),
    topCategory: categoryRaw.length > 0 ? categoryRaw[0].category : "N/A",
    receiptCount,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const analytics = await getAnalytics(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Your expense overview at a glance</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(analytics.totalThisMonth)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{analytics.receiptCount}</p>
            <p className="text-xs text-slate-400 mt-1">Total tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{analytics.topCategory}</p>
            <p className="text-xs text-slate-400 mt-1">Highest spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart data={analytics.monthlyTotals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={analytics.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Recent receipts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Recent Receipts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentReceipts receipts={analytics.recentReceipts} />
        </CardContent>
      </Card>
    </div>
  );
}
