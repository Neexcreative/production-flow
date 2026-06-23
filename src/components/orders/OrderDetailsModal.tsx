/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";

import {
  formatDateTime,
  formatHistoryEvent,
} from "@/lib/productionTracker";
import type {
  JobOrder,
  OrderHistoryItem,
  OrderStatus,
  StatusOption,
} from "@/types/order";
import { generateJobPdf } from "@/utils/generateJobPdf";
import { formatDateForDisplay } from "@/utils/date";

function getPriorityBadge(priority: string) {
  if (priority === "High") {
    return "border-red-300 bg-red-100 text-red-800";
  }

  if (priority === "Normal") {
    return "border-blue-300 bg-blue-100 text-blue-800";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
}

type OrderDetailsModalProps = {
  order: JobOrder;
  history: OrderHistoryItem[];
  onClose: () => void;
  onEdit: (order: JobOrder) => void;
  onMove: (orderId: string, nextStatus: OrderStatus) => void;
  availableStatuses: StatusOption[];
  readOnly?: boolean;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function LinkValue({ value }: { value?: string }) {
  if (!value) {
    return <span className="text-slate-500">Not set</span>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="break-all text-blue-700 underline decoration-blue-200 underline-offset-2"
    >
      {value}
    </a>
  );
}

export function OrderDetailsModal({
  order,
  history,
  onClose,
  onEdit,
  onMove,
  availableStatuses,
  readOnly = false,
}: OrderDetailsModalProps) {
  const dueDisplay = formatDateForDisplay(order.dueDate) || "Select due date";

  async function handleDownloadPdf() {
    try {
      await generateJobPdf(order);
    } catch {
      window.alert("Could not generate PDF. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-300 bg-slate-50 p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
              Job Details
            </p>
            <h2 className="mt-1.5 text-2xl font-bold text-slate-950">
              {order.title}
            </h2>
            <p className="mt-1 font-mono text-sm text-slate-600">{order.id}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!readOnly ? (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-md border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Download PDF
              </button>
            ) : null}
            {!readOnly ? (
              <button
                type="button"
                onClick={() => onEdit(order)}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Edit
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-amber-300 bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition hover:brightness-105"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <section className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <DetailRow label="Job ID" value={order.id} />
              <DetailRow label="Title" value={order.title} />
              <DetailRow label="Client" value={order.client} />
              <DetailRow
                label="Item / Project / Asset"
                value={order.itemProjectAsset || <span className="text-slate-500">Not set</span>}
              />
              <DetailRow label="Job Type" value={order.jobType} />
              <DetailRow label="Production Stage" value={order.productionStage} />
              <DetailRow label="Board Status" value={order.status} />
              <DetailRow
                label="Priority"
                value={
                  <span
                    className={`inline-flex rounded border px-2.5 py-0.5 text-xs font-semibold ${getPriorityBadge(order.priority)}`}
                  >
                    {order.priority}
                  </span>
                }
              />
              <DetailRow label="Due" value={dueDisplay} />
              <DetailRow
                label="Resource"
                value={order.resource || <span className="text-slate-500">Not set</span>}
              />
              <DetailRow
                label="Quantity"
                value={order.quantity || <span className="text-slate-500">Not set</span>}
              />
              <DetailRow
                label="Print Quantity"
                value={
                  order.outputQuantity || <span className="text-slate-500">Not set</span>
                }
              />
              <DetailRow
                label="Cut Quantity"
                value={order.cutQuantity || <span className="text-slate-500">Not set</span>}
              />
              <DetailRow
                label="Lamination Quantity"
                value={
                  order.laminationFinishingQuantity || (
                    <span className="text-slate-500">Not set</span>
                  )
                }
              />
              <DetailRow
                label="Requested By"
                value={order.requestedBy || <span className="text-slate-500">Not set</span>}
              />
              <DetailRow
                label="Waiting Reason"
                value={
                  order.waitingReason || <span className="text-slate-500">Not waiting</span>
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <DetailRow label="File Link" value={<LinkValue value={order.mainFileLink} />} />
              <DetailRow
                label="Artwork Link"
                value={<LinkValue value={order.artworkDesignLink} />}
              />
              <DetailRow
                label="Production File Link"
                value={<LinkValue value={order.finalProductionLink} />}
              />
              <DetailRow
                label="Created At"
                value={formatDateTime(order.createdAt) || "Not available"}
              />
              <DetailRow
                label="Updated At"
                value={formatDateTime(order.updatedAt) || "Not available"}
              />
              <DetailRow
                label="Completed At"
                value={formatDateTime(order.completedAt) || "Not completed"}
              />
            </div>

            <DetailRow
              label="Notes"
              value={
                order.internalNotes ? (
                  <p className="whitespace-pre-wrap">{order.internalNotes}</p>
                ) : (
                  <span className="text-slate-500">No notes added</span>
                )
              }
            />

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Job-Specific History
              </p>
              <div className="mt-4 space-y-2.5">
                {history.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No history recorded for this job yet.
                  </p>
                ) : (
                  history.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {formatHistoryEvent(item)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </section>

          <section className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Reference / Attachment
              </p>
              <div className="mt-4 flex min-h-72 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
                {order.referenceAttachmentUrl || order.referenceUrl ? (
                  <img
                    src={order.referenceAttachmentUrl ?? order.referenceUrl}
                    alt={`${order.title} reference`}
                    className="max-h-[420px] w-full rounded object-contain"
                  />
                ) : (
                  <p className="text-sm text-slate-500">No attachment added</p>
                )}
              </div>
              {order.referenceAttachmentUrl ? (
                <p className="mt-3 text-sm text-slate-600">
                  File:{" "}
                  <span className="font-semibold text-slate-900">Reference attachment</span>
                </p>
              ) : null}
            </section>

            {!readOnly ? (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Quick Status Move
                </p>
                <div className="mt-4 grid gap-2">
                  {availableStatuses
                    .filter((status) => status.active && status.name !== order.status)
                    .sort((left, right) => left.sortOrder - right.sortOrder)
                    .map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => onMove(order.id, status.name)}
                        className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Move to {status.name}
                      </button>
                    ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
