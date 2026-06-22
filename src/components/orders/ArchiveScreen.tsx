"use client";

import { useMemo, useState } from "react";

import { ArchiveList } from "@/components/orders/ArchiveList";
import { OrderFiltersBar } from "@/components/orders/OrderFiltersBar";
import { useProductionTracker } from "@/components/orders/ProductionTrackerProvider";
import { DEFAULT_FILTERS, filterOrders } from "@/lib/productionTracker";

export function ArchiveScreen() {
  const {
    archivedOrders,
    clients,
    priorities,
    jobTypes,
    productionStages,
    materials,
    openDetailsModal,
    restoreOrder,
  } =
    useProductionTracker();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const filteredOrders = useMemo(
    () => filterOrders(archivedOrders, filters),
    [archivedOrders, filters]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        <h1 className="text-xl font-bold text-slate-950">Completed Job Archive</h1>
        <p className="mt-1 text-sm text-slate-600">
          Searchable history of finished work. Jobs stay here for reference and traceability.
        </p>
      </section>

      <OrderFiltersBar
        filters={filters}
        clients={clients}
        priorities={priorities}
        jobTypes={jobTypes}
        productionStages={productionStages}
        materials={materials}
        onChange={setFilters}
      />

      <ArchiveList
        orders={filteredOrders}
        onOpenDetails={openDetailsModal}
        onRestore={(orderId) => void restoreOrder(orderId)}
      />
    </div>
  );
}
