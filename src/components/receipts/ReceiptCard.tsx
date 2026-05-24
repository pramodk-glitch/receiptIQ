import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ReceiptCardProps {
  id: string;
  storeName: string;
  receiptDate: string;
  totalAmount: number;
  currency: string;
  source: string;
  itemCount: number;
  imageUrl?: string | null;
  needsReview?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  upload: "Upload",
  amazon_csv: "Amazon",
  lambda_ocr: "AI Scan",
};

const SOURCE_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  manual: "secondary",
  upload: "default",
  amazon_csv: "outline",
  lambda_ocr: "default",
};

export function ReceiptCard({
  id,
  storeName,
  receiptDate,
  totalAmount,
  currency,
  source,
  itemCount,
  imageUrl,
  needsReview,
}: ReceiptCardProps) {
  return (
    <Link href={`/receipts/${id}`}>
      <Card className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {imageUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={storeName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-indigo-400"
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
              )}

              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{storeName}</p>
                <p className="text-sm text-slate-400 mt-0.5">{formatDate(receiptDate)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className="text-lg font-bold text-slate-900">
                {formatCurrency(totalAmount, currency)}
              </p>
              <div className="flex gap-1 flex-wrap justify-end">
                <Badge variant={SOURCE_COLORS[source] ?? "secondary"}>
                  {SOURCE_LABELS[source] ?? source}
                </Badge>
                {needsReview && (
                  <Badge variant="destructive">Review</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
