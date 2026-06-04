interface Anomaly {
  itemNameNormalized: string;
  storeChain: string;
  latestPrice: number;
  historicalAvg: number;
  percentChange: number;
  capturedAt: string;
}

interface Props {
  anomalies: Anomaly[];
}

export function PriceAlertCard({ anomalies }: Props) {
  if (anomalies.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No price spikes detected. All your recent purchases are in line with historical prices.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.map((a) => {
        const date = new Date(a.capturedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const severity = a.percentChange >= 50 ? "high" : a.percentChange >= 30 ? "medium" : "low";
        const colors = {
          high: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", icon: "text-red-500" },
          medium: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700", icon: "text-orange-500" },
          low: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: "text-yellow-600" },
        }[severity];

        return (
          <div
            key={`${a.itemNameNormalized}-${a.capturedAt}`}
            className={`flex items-start gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}
          >
            <div className={`mt-0.5 shrink-0 ${colors.icon}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-slate-800 capitalize truncate">
                  {a.itemNameNormalized}
                </p>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                  +{a.percentChange.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {a.storeChain || "Unknown store"} · {date} ·{" "}
                <span className="font-medium">${a.latestPrice.toFixed(2)}</span>{" "}
                vs avg <span className="font-medium">${a.historicalAvg.toFixed(2)}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
