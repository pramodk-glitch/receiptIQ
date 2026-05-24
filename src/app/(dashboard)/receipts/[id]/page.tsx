import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineItemsTable } from "@/components/receipts/LineItemsTable";
import { DeleteReceiptButton } from "@/components/receipts/DeleteReceiptButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual Entry",
  upload: "Image Upload",
  amazon_csv: "Amazon CSV Import",
  lambda_ocr: "AI OCR",
};

export default async function ReceiptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const receipt = await prisma.receipt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!receipt) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/receipts"
          className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Receipts
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{receipt.storeName}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-slate-400 text-sm">{formatDate(receipt.receiptDate)}</span>
            <Badge variant="outline">
              {SOURCE_LABELS[receipt.source] ?? receipt.source}
            </Badge>
            {receipt.needsReview && (
              <Badge variant="destructive">Needs Review</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">
            {formatCurrency(receipt.totalAmount, receipt.currency)}
          </p>
          <p className="text-sm text-slate-400 mt-1">{receipt.currency}</p>
        </div>
      </div>

      {receipt.imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receipt Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={receipt.imageUrl}
              alt={`Receipt from ${receipt.storeName}`}
              className="w-full max-h-96 object-contain rounded-lg border border-slate-200"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receipt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-400">Store</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{receipt.storeName}</dd>
            </div>
            {receipt.storeChain && (
              <div>
                <dt className="text-slate-400">Chain</dt>
                <dd className="font-medium text-slate-900 mt-0.5">{receipt.storeChain}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-400">Date</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{formatDate(receipt.receiptDate)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Total</dt>
              <dd className="font-bold text-slate-900 mt-0.5">
                {formatCurrency(receipt.totalAmount, receipt.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Source</dt>
              <dd className="font-medium text-slate-900 mt-0.5">
                {SOURCE_LABELS[receipt.source] ?? receipt.source}
              </dd>
            </div>
            <div>
              <dt className="text-slate-400">Items</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{receipt.items.length}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Added</dt>
              <dd className="font-medium text-slate-900 mt-0.5">{formatDate(receipt.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Line Items ({receipt.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={receipt.items} currency={receipt.currency} />
        </CardContent>
      </Card>

      {receipt.rawOcrText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Raw OCR Text</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
              {receipt.rawOcrText}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <DeleteReceiptButton receiptId={receipt.id} />
      </div>
    </div>
  );
}
