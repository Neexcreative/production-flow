import { formatDateTime } from "@/lib/productionTracker";
import type { JobOrder } from "@/types/order";
import { formatDateForDisplay } from "@/utils/date";
import { generateJobPdf } from "@/utils/generateJobPdf";

type ArchiveListProps = {
  orders: JobOrder[];
  onOpenDetails: (order: JobOrder) => void;
  onRestore: (orderId: string) => void;
};

export function ArchiveList({ orders, onOpenDetails, onRestore }: ArchiveListProps) {
  async function handlePdfDownload(
    event: React.SyntheticEvent,
    order: JobOrder
  ) {
    event.stopPropagation();

    try {
      await generateJobPdf(order);
    } catch {
      window.alert("Could not generate PDF. Please try again.");
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        No completed jobs match the current search and filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-[1.05fr_1fr_0.95fr_0.9fr_0.8fr_1fr_0.9fr_0.8fr_1fr] gap-3 border-b border-slate-200 bg-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
            <span>Job</span>
            <span>Client</span>
            <span>Job Type</span>
            <span>Stage</span>
            <span>Priority</span>
            <span>Resource</span>
            <span>Due Date</span>
            <span>Completed</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <article
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenDetails(order)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenDetails(order);
                  }
                }}
                className="grid w-full grid-cols-[1.05fr_1fr_0.95fr_0.9fr_0.8fr_1fr_0.9fr_0.8fr_1fr] gap-3 px-5 py-4 text-left text-sm text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
              >
                <span>
                  <span className="block font-mono text-[11px] text-slate-500">
                    {order.id}
                  </span>
                  <span className="block font-semibold">{order.title}</span>
                </span>
                <span>{order.client}</span>
                <span>{order.jobType}</span>
                <span>{order.productionStage}</span>
                <span>{order.priority}</span>
                <span>{order.resource || "-"}</span>
                <span>{formatDateForDisplay(order.dueDate) || "Select due date"}</span>
                <span>{formatDateTime(order.completedAt) || "-"}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={(event) => void handlePdfDownload(event, order)}
                    className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRestore(order.id);
                    }}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Restore
                  </button>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
