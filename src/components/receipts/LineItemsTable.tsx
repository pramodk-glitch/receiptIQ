import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LineItem {
  id: string;
  itemName: string;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  lineTotal: number;
  category: string;
  brand?: string | null;
  asin?: string | null;
}

interface LineItemsTableProps {
  items: LineItem[];
  currency?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "bg-green-100 text-green-700",
  Electronics: "bg-blue-100 text-blue-700",
  Dining: "bg-orange-100 text-orange-700",
  Medicine: "bg-red-100 text-red-700",
  Household: "bg-yellow-100 text-yellow-700",
  "Personal Care": "bg-pink-100 text-pink-700",
  Travel: "bg-purple-100 text-purple-700",
  Entertainment: "bg-indigo-100 text-indigo-700",
  General: "bg-slate-100 text-slate-700",
};

export function LineItemsTable({ items, currency = "USD" }: LineItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        No line items found for this receipt.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-2 font-medium text-slate-500">Item</th>
            <th className="text-center py-3 px-2 font-medium text-slate-500">Qty</th>
            <th className="text-right py-3 px-2 font-medium text-slate-500">Unit Price</th>
            <th className="text-right py-3 px-2 font-medium text-slate-500">Total</th>
            <th className="text-center py-3 px-2 font-medium text-slate-500">Category</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-2">
                <div>
                  <p className="font-medium text-slate-900">{item.itemName}</p>
                  {item.brand && (
                    <p className="text-xs text-slate-400">{item.brand}</p>
                  )}
                  {item.asin && (
                    <p className="text-xs text-slate-400">ASIN: {item.asin}</p>
                  )}
                </div>
              </td>
              <td className="py-3 px-2 text-center text-slate-600">
                {item.quantity}
                {item.unit && <span className="text-slate-400 ml-0.5">{item.unit}</span>}
              </td>
              <td className="py-3 px-2 text-right text-slate-600">
                {formatCurrency(item.unitPrice, currency)}
              </td>
              <td className="py-3 px-2 text-right font-medium text-slate-900">
                {formatCurrency(item.lineTotal, currency)}
              </td>
              <td className="py-3 px-2 text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS["General"]
                  }`}
                >
                  {item.category}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200">
            <td colSpan={3} className="py-3 px-2 text-right font-semibold text-slate-700">
              Total
            </td>
            <td className="py-3 px-2 text-right font-bold text-slate-900">
              {formatCurrency(
                items.reduce((sum, item) => sum + item.lineTotal, 0),
                currency
              )}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
