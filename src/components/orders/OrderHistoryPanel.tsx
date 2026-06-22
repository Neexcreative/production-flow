import { formatActivityEvent, formatCompactTimestamp } from "@/lib/productionTracker";
import type { OrderHistoryItem } from "@/types/order";

type OrderHistoryPanelProps = {
  history: OrderHistoryItem[];
};

export function OrderHistoryPanel({ history }: OrderHistoryPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
          Latest Activity
        </h2>
      </div>

      {history.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">No activity yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-6 px-5 py-3"
            >
              <p className="text-sm text-slate-700">{formatActivityEvent(item)}</p>
              <time
                dateTime={item.createdAt}
                className="shrink-0 font-mono text-[11px] tabular-nums text-slate-500"
              >
                {formatCompactTimestamp(item.createdAt)}
              </time>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
