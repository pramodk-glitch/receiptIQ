import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ReceiptCard } from "@/components/receipts/ReceiptCard";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const receipts = await prisma.receipt.findMany({
    where: { userId: session.user.id },
    orderBy: { receiptDate: "desc" },
    take: 50,
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
          <p className="text-slate-500 mt-1">{receipts.length} receipt{receipts.length !== 1 ? "s" : ""} found</p>
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
            <svg
              className="w-8 h-8 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No receipts yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Upload your first receipt or import Amazon order history
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/receipts/upload">
              <Button>Upload Receipt</Button>
            </Link>
            <Link href="/import">
              <Button variant="outline">Import Amazon Orders</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              id={receipt.id}
              storeName={receipt.storeName}
              receiptDate={receipt.receiptDate.toISOString()}
              totalAmount={receipt.totalAmount}
              currency={receipt.currency}
              source={receipt.source}
              itemCount={receipt._count.items}
              imageUrl={receipt.imageUrl}
              needsReview={receipt.needsReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
