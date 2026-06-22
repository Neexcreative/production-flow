"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { useProductionTracker } from "@/components/orders/ProductionTrackerProvider";

const navItems = [
  { href: "/", label: "Board" },
  { href: "/reports", label: "Reports" },
  { href: "/archive", label: "Archive" },
  { href: "/settings", label: "Settings" },
  { href: "/tv", label: "TV Mode" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isTvMode = pathname === "/tv";
  const {
    clients,
    statuses,
    priorities,
    jobTypes,
    productionStages,
    materials,
    waitingReasons,
    requestedByOptions,
    selectedOrder,
    selectedOrderHistory,
    isFormOpen,
    formMode,
    formInitialValues,
    editingOrderId,
    formMessage,
    openCreateModal,
    closeFormModal,
    closeDetailsModal,
    submitOrder,
    addClient,
    addJobType,
    addMaterial,
    addRequestedBy,
    openEditModal,
    requestStatusChange,
    dataError,
    exportBackup,
  } = useProductionTracker();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_24%,#eef2f7_100%)]">
      <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-8">
            <div className="flex items-center gap-4">
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-950">Production Flow</p>
                <p className="text-xs text-slate-500">
                  Internal job and production control system
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-md border px-3 py-2 text-sm font-semibold transition",
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {!isTvMode ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportBackup}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Export Backup
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-md border border-amber-300 bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition hover:brightness-105"
              >
                + New Job
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {dataError ? (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {dataError}
          </div>
        ) : null}
        {children}
      </div>

      {isFormOpen ? (
        <OrderFormModal
          clients={clients}
          statuses={statuses}
          priorities={priorities}
          jobTypes={jobTypes}
          productionStages={productionStages}
          materials={materials}
          waitingReasons={waitingReasons}
          requestedByOptions={requestedByOptions}
          mode={formMode}
          initialValues={formInitialValues}
          onClose={closeFormModal}
          onAddClient={addClient}
          onAddJobType={addJobType}
          onAddMaterial={addMaterial}
          onAddRequestedBy={addRequestedBy}
          onSubmit={(values) => void submitOrder(values)}
          editingOrderId={editingOrderId}
          message={formMessage}
        />
      ) : null}

      {selectedOrder ? (
        <OrderDetailsModal
          order={selectedOrder}
          history={selectedOrderHistory}
          onClose={closeDetailsModal}
          onEdit={openEditModal}
          onMove={(orderId, nextStatus) => void requestStatusChange(orderId, nextStatus)}
          availableStatuses={statuses}
          readOnly={isTvMode}
        />
      ) : null}
    </main>
  );
}
