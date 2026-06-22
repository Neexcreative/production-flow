"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardStats } from "@/components/orders/DashboardStats";
import { OrderListView } from "@/components/orders/OrderListView";
import { OrderColumn } from "@/components/orders/OrderColumn";
import { OrderFiltersBar } from "@/components/orders/OrderFiltersBar";
import { OrderHistoryPanel } from "@/components/orders/OrderHistoryPanel";
import { ViewModeToggle } from "@/components/orders/ViewModeToggle";
import { useProductionTracker } from "@/components/orders/ProductionTrackerProvider";
import {
  DEFAULT_FILTERS,
  filterOrders,
  readStoredViewMode,
  VIEW_MODE_STORAGE_KEY,
  type ViewMode,
} from "@/lib/productionTracker";

export function BoardScreen() {
  const {
    orders,
    clients,
    statuses,
    priorities,
    jobTypes,
    productionStages,
    materials,
    latestActivity,
    openDetailsModal,
    openEditModal,
    requestStatusChange,
    archiveOrder,
    isReady,
  } = useProductionTracker();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [isMounted, setIsMounted] = useState(false);

  const filteredOrders = useMemo(
    () => filterOrders(orders, filters),
    [filters, orders]
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedViewMode = readStoredViewMode();
      setViewMode(savedViewMode);
      setIsMounted(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [isMounted, viewMode]);

  if (!isMounted || !isReady) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
            Loading Production Flow...
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStats orders={orders} />

      <OrderFiltersBar
        filters={filters}
        clients={clients}
        priorities={priorities}
        jobTypes={jobTypes}
        productionStages={productionStages}
        materials={materials}
        onChange={setFilters}
      />

      <ViewModeToggle value={viewMode} onChange={setViewMode} />

      {viewMode === "board" ? (
        <div className="flex gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-x-visible">
          {statuses
            .filter((status) => status.active && status.isBoardColumn)
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((status) => (
            <div key={status.id} className="w-[min(88vw,360px)] shrink-0 lg:w-auto">
              <OrderColumn
                title={status.name}
                statuses={statuses}
                orders={filteredOrders.filter((order) => order.status === status.name)}
                onOpenDetails={openDetailsModal}
                onEdit={openEditModal}
                onMove={(orderId, nextStatus) => void requestStatusChange(orderId, nextStatus)}
              />
            </div>
          ))}
        </div>
      ) : (
        <OrderListView
          orders={filteredOrders}
          statuses={statuses}
          onOpenDetails={openDetailsModal}
          onEdit={openEditModal}
          onMove={(orderId, nextStatus) => void requestStatusChange(orderId, nextStatus)}
          onArchive={(orderId) => void archiveOrder(orderId)}
        />
      )}

      <OrderHistoryPanel history={latestActivity} />
    </div>
  );
}
