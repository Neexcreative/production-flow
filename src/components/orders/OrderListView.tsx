"use client";

import { formatDateTime } from "@/lib/productionTracker";
import type { JobOrder, OrderStatus, StatusOption } from "@/types/order";
import { generateJobPdf } from "@/utils/generateJobPdf";

type OrderListViewProps = {
  orders: JobOrder[];
  statuses: StatusOption[];
  onOpenDetails: (order: JobOrder) => void;
  onEdit: (order: JobOrder) => void;
  onMove: (orderId: string, nextStatus: OrderStatus) => void;
  onArchive: (orderId: string) => void;
};

export function OrderListView({
  orders,
  statuses,
  onOpenDetails,
  onEdit,
  onMove,
  onArchive,
}: OrderListViewProps) {
  async function handlePdfDownload(order: JobOrder) {
    try {
      await generateJobPdf(order);
    } catch {
      window.alert("Could not generate PDF. Please try again.");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-bold text-slate-950">List View</h2>
        <p className="mt-1 text-sm text-slate-600">
          Same filtered jobs as the board, shown in a quick-scan table layout.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1220px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
              <th className="px-4 py-3 font-semibold">Job ID</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Job Type</th>
              <th className="px-4 py-3 font-semibold">Production Stage</th>
              <th className="px-4 py-3 font-semibold">Due Date / Due Text</th>
              <th className="px-4 py-3 font-semibold">Updated At</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  No jobs match the current filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-950">{order.title}</div>
                    {order.itemProjectAsset ? (
                      <div className="mt-1 text-xs text-slate-500">
                        Item / Project / Asset: {order.itemProjectAsset}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.client}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        onMove(order.id, event.target.value as OrderStatus)
                      }
                      className="h-9 min-w-[140px] rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    >
                      {statuses
                        .filter((status) => status.active)
                        .sort((left, right) => left.sortOrder - right.sortOrder)
                        .map((status) => (
                        <option key={status.id} value={status.name}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    {order.status === "Waiting" && order.waitingReason ? (
                      <p className="mt-2 text-xs font-medium text-red-700">
                        {order.waitingReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.priority}</td>
                  <td className="px-4 py-3 text-slate-700">{order.jobType}</td>
                  <td className="px-4 py-3 text-slate-700">{order.productionStage}</td>
                  <td className="px-4 py-3 text-slate-700">{order.due}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDateTime(order.updatedAt) || "Not available"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[250px] flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(order)}
                        className="rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(order)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handlePdfDownload(order)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive(order.id)}
                        disabled={order.status === "Done"}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
