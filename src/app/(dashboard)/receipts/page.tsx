import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ReceiptStoreTree } from "@/components/receipts/ReceiptStoreTree";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const receipts = await prisma.receipt.findMany({
    where: { userId: session.user.id },
    orderBy: { receiptDate: "desc" },
    take: 500,
    include: { _count: { select: { items: true } } },
  });

  const summaries = receipts.map(r => ({
    id: r.id,
    storeName: r.storeName || "Unknown Store",
    receiptDate: r.receiptDate.toISOString().slice(0, 10),
    totalAmount: r.totalAmount,
    currency: r.currency,
    itemCount: r._count.items,
    source: r.source,
    needsReview: r.needsReview ?? false,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
          <p className="text-slate-500 mt-1">
            {receipts.length} receipt{receipts.length !== 1 ? "s" : ""} across{" "}
            {new Set(summaries.map(r => r.storeName)).size} store{new Set(summaries.map(r => r.storeName)).size !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/receipts/upload">
            <Button>Upload Receipt</Button>
          </Link>
          <Link href="/manual-entry">
            <Button variant="outline">Manual Entry</Button>
          </Link>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No receipts yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Upload your first receipt or import Amazon order history
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/receipts/upload"><Button>Upload Receipt</Button></Link>
            <Link href="/import"><Button variant="outline">Import Amazon Orders</Button></Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-lg font-semibold text-slate-800">By Store</h2>
          </div>
          <ReceiptStoreTree receipts={summaries} />
        </div>
      )}
    </div>
  );
}
