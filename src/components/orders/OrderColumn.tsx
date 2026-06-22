import { OrderCard } from "@/components/orders/OrderCard";
import type { JobOrder, OrderStatus, StatusOption } from "@/types/order";

type ColumnConfig = {
  headerClass: string;
  borderClass: string;
  dimCards?: boolean;
};

function getColumnConfig(title: string): ColumnConfig {
  if (title === "In Progress") {
    return {
      headerClass: "bg-amber-500 text-slate-950",
      borderClass: "border-amber-300",
    };
  }

  if (title === "Waiting") {
    return {
      headerClass: "bg-red-600 text-white",
      borderClass: "border-red-300",
    };
  }

  if (title === "Done") {
    return {
      headerClass: "bg-emerald-600 text-white",
      borderClass: "border-emerald-300",
      dimCards: true,
    };
  }

  return {
    headerClass: "bg-slate-800 text-white",
    borderClass: "border-slate-300",
  };
}

type OrderColumnProps = {
  title: string;
  orders: JobOrder[];
  statuses?: StatusOption[];
  readOnly?: boolean;
  onOpenDetails: (order: JobOrder) => void;
  onEdit?: (order: JobOrder) => void;
  onMove?: (orderId: string, nextStatus: OrderStatus) => void;
};

export function OrderColumn({
  title,
  orders,
  statuses = [],
  readOnly = false,
  onOpenDetails,
  onEdit,
  onMove,
}: OrderColumnProps) {
  const config = getColumnConfig(title);

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-slate-100 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)] ${config.borderClass}`}
    >
      <div className={`flex items-center justify-between px-4 py-3 ${config.headerClass}`}>
        <h2 className="text-sm font-bold tracking-[0.08em]">{title}</h2>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums">
          {orders.length}
        </span>
      </div>

      <div className="space-y-3 p-3">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No jobs in this status.
          </p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              statuses={statuses}
              dimmed={config.dimCards}
              readOnly={readOnly}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </section>
  );
}
