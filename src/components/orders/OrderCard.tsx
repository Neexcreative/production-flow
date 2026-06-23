import type { JobOrder, OrderStatus, StatusOption } from "@/types/order";
import { generateJobPdf } from "@/utils/generateJobPdf";

function getPriorityBadge(priority: string) {
  if (priority === "High") {
    return "border-red-300 bg-red-100 text-red-800";
  }

  if (priority === "Normal") {
    return "border-blue-300 bg-blue-100 text-blue-800";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
}

function getStageBadge(stage: string) {
  if (stage === "Printing") {
    return "border-amber-300 bg-amber-100 text-amber-800";
  }

  if (stage === "Production") {
    return "border-blue-300 bg-blue-100 text-blue-800";
  }

  if (stage === "Review") {
    return "border-violet-300 bg-violet-100 text-violet-800";
  }

  if (stage === "Approval") {
    return "border-cyan-300 bg-cyan-100 text-cyan-800";
  }

  if (stage === "Installation") {
    return "border-emerald-300 bg-emerald-100 text-emerald-800";
  }

  return "border-slate-300 bg-slate-100 text-slate-700";
}

type OrderCardProps = {
  order: JobOrder;
  statuses: StatusOption[];
  dimmed?: boolean;
  readOnly?: boolean;
  onOpenDetails: (order: JobOrder) => void;
  onEdit?: (order: JobOrder) => void;
  onMove?: (orderId: string, nextStatus: OrderStatus) => void;
};

export function OrderCard({
  order,
  statuses,
  dimmed = false,
  readOnly = false,
  onOpenDetails,
  onEdit,
  onMove,
}: OrderCardProps) {
  async function handlePdfDownload(event: React.SyntheticEvent) {
    event.stopPropagation();

    try {
      await generateJobPdf(order);
    } catch {
      window.alert("Could not generate PDF. Please try again.");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetails(order);
    }
  }

  function stopCardClick(event: React.SyntheticEvent) {
    event.stopPropagation();
  }

  const isWaiting = order.status === "Waiting";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(order)}
      onKeyDown={handleKeyDown}
      className={[
        "cursor-pointer rounded-xl border bg-white p-4 shadow-[0_14px_28px_-20px_rgba(15,23,42,0.45)] transition",
        "hover:border-slate-300 hover:shadow-[0_18px_34px_-20px_rgba(15,23,42,0.55)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
        isWaiting ? "border-red-300 bg-red-50/35" : "border-slate-200",
        dimmed ? "opacity-75" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-slate-600">
            {order.id}
          </p>
          <h3 className="mt-2 text-[15px] font-bold leading-snug text-slate-950">
            {order.title}
          </h3>
        </div>
        <span
          className={`rounded border px-2 py-0.5 text-[11px] font-bold ${getPriorityBadge(order.priority)}`}
        >
          {order.priority}
        </span>
      </div>

      <div className="mt-3 grid gap-1.5 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-500">Client:</span> {order.client}
        </p>
        {order.itemProjectAsset ? (
          <p>
            <span className="font-semibold text-slate-500">Item / Project / Asset:</span>{" "}
            {order.itemProjectAsset}
          </p>
        ) : null}
        <p>
          <span className="font-semibold text-slate-500">Due:</span> {order.due}
        </p>
        {order.resource ? (
          <p>
            <span className="font-semibold text-slate-500">Resource:</span>{" "}
            {order.resource}
          </p>
        ) : null}
        {order.quantity ? (
          <p>
            <span className="font-semibold text-slate-500">Quantity:</span>{" "}
            {order.quantity}
          </p>
        ) : null}
        {isWaiting && order.waitingReason ? (
          <p className="rounded-md border border-red-200 bg-red-100 px-2 py-1 text-sm font-semibold text-red-800">
            Blocked: {order.waitingReason}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {order.jobType}
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${getStageBadge(order.productionStage)}`}
        >
          {order.productionStage}
        </span>
        {order.referenceAttachmentUrl || order.referenceUrl ? (
          <span className="rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            Reference attached
          </span>
        ) : null}
      </div>

      {!readOnly ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  stopCardClick(event);
                  onOpenDetails(order);
                }}
                className="inline-flex h-8 items-center whitespace-nowrap rounded-md border border-slate-900 bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-slate-800"
              >
                View Details
              </button>
              <button
                type="button"
                onClick={(event) => {
                  stopCardClick(event);
                  onEdit?.(order);
                }}
                className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handlePdfDownload}
                className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                PDF
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-600">
                Status:
              </span>
              <select
                value={order.status}
                onClick={stopCardClick}
                onFocus={stopCardClick}
                onChange={(event) => {
                  stopCardClick(event);
                  onMove?.(order.id, event.target.value as OrderStatus);
                }}
                className="h-8 min-w-[120px] cursor-pointer rounded-md border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 sm:min-w-[140px]"
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
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
