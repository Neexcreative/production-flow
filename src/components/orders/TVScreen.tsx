"use client";

import { useProductionTracker } from "@/components/orders/ProductionTrackerProvider";
import { OrderColumn } from "@/components/orders/OrderColumn";

export function TVScreen() {
  const { orders, statuses, openDetailsModal } = useProductionTracker();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        <h1 className="text-3xl font-bold text-slate-950">Production Flow TV Mode</h1>
        <p className="mt-2 text-lg text-slate-600">
          Read-only board for team display. Key production status only.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-4 [&_article]:text-base [&_article_h3]:text-lg">
        {statuses
          .filter((status) => status.active && status.isBoardColumn)
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((status) => (
          <OrderColumn
            key={status.id}
            title={status.name}
            statuses={statuses}
            orders={orders.filter((order) => order.status === status.name)}
            readOnly
            onOpenDetails={openDetailsModal}
          />
        ))}
      </div>
    </div>
  );
}
