import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { CategoryPie } from "@/components/dashboard/CategoryPie";
import { RecentReceipts } from "@/components/dashboard/RecentReceipts";
import { formatCurrency } from "@/lib/utils";

async function getAnalytics(userId: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/analytics?userId=${userId}`, {
    cache: "no-store",
    headers: {
      "x-internal-user-id": userId,
    },
  });

  if (!res.ok) {
    return {
      monthlyTotals: [],
      categoryBreakdown: [],
      recentReceipts: [],
      totalThisMonth: 0,
      topCategory: "N/A",
      receiptCount: 0,
    };
  }

  return res.json();
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
