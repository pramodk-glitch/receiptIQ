import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Receipt {
  id: string;
  storeName: string;
  receiptDate: string;
  totalAmount: number;
  currency: string;
  source: string;
  itemCount: number;
}

interface RecentReceiptsProps {
  receipts: Receipt[];
}

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  upload: "Upload",
  amazon_csv: "Amazon",
  lambda_ocr: "AI Scan",
};

const SOURCE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  manual: "secondary",
  upload: "default",
  amazon_csv: "outline",
  lambda_ocr: "default",
};

export function RecentReceipts({ receipts }: RecentReceiptsProps) {
  if (receipts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">No receipts yet.</p>
        <p className="text-xs mt-1">Upload a receipt or import Amazon orders to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {receipts.map((receipt) => (
        <Link
          key={receipt.id}
          href={`/receipts/${receipt.id}`}
          className="flex items-center justify-between py-4 px-1 hover:bg-slate-50 rounded-lg transition-colors -mx-1 px-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-indigo-600"
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
            <div>
              <p className="text-sm font-medium text-slate-900">{receipt.storeName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatDate(receipt.receiptDate)} · {receipt.itemCount} item{receipt.itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={SOURCE_COLORS[receipt.source] ?? "secondary"}>
              {SOURCE_LABELS[receipt.source] ?? receipt.source}
            </Badge>
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(receipt.totalAmount, receipt.currency)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
