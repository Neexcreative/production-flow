import type { JobOrder } from "@/types/order";

type DashboardStatsProps = {
  orders: JobOrder[];
};

const statConfig = [
  {
    key: "active" as const,
    label: "Active Jobs",
    borderClass: "border-t-slate-800",
    numberClass: "text-slate-900",
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    borderClass: "border-t-amber-500",
    numberClass: "text-amber-700",
  },
  {
    key: "waiting" as const,
    label: "Waiting",
    borderClass: "border-t-red-500",
    numberClass: "text-red-700",
  },
  {
    key: "done" as const,
    label: "Done",
    borderClass: "border-t-emerald-600",
    numberClass: "text-emerald-700",
  },
] as const;

export function DashboardStats({ orders }: DashboardStatsProps) {
  const values = {
    active: orders.filter((order) => order.status !== "Done").length,
    inProgress: orders.filter((order) => order.status === "In Progress").length,
    waiting: orders.filter((order) => order.status === "Waiting").length,
    done: orders.filter((order) => order.status === "Done").length,
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.35)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((stat) => (
          <div
            key={stat.key}
            className={`rounded-xl border border-slate-200 border-t-[3px] bg-slate-50/70 px-3 py-2.5 shadow-[0_8px_18px_-20px_rgba(15,23,42,0.35)] ${stat.borderClass}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {stat.label}
            </p>
            <p
              className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${stat.numberClass}`}
            >
              {values[stat.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
