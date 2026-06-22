"use client";

import { useMemo, useState } from "react";

import { useProductionTracker } from "@/components/orders/ProductionTrackerProvider";
import {
  buildReportRows,
  buildReportSummary,
  DEFAULT_REPORT_FILTERS,
  filterOrdersForReport,
  getActiveReportFilters,
  type ReportFilters,
} from "@/lib/reports";
import { exportJobsCsv } from "@/utils/exportJobsCsv";
import { exportJobsExcel } from "@/utils/exportJobsExcel";
import { generateJobsReportPdf } from "@/utils/generateJobsReportPdf";

const selectClass =
  "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

const statConfig = [
  {
    key: "totalJobs",
    label: "Total jobs",
    accent: "border-t-slate-900 text-slate-950",
  },
  { key: "newJobs", label: "New jobs", accent: "border-t-blue-500 text-blue-700" },
  {
    key: "inProgressJobs",
    label: "In progress jobs",
    accent: "border-t-amber-500 text-amber-700",
  },
  {
    key: "waitingJobs",
    label: "Waiting jobs",
    accent: "border-t-red-500 text-red-700",
  },
  {
    key: "completedJobs",
    label: "Completed jobs",
    accent: "border-t-emerald-600 text-emerald-700",
  },
  {
    key: "overdueJobs",
    label: "Overdue jobs",
    accent: "border-t-rose-600 text-rose-700",
  },
] as const;

export function ReportsScreen() {
  const { allOrders, clients, statuses, priorities, jobTypes, productionStages } =
    useProductionTracker();
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS);

  const filteredOrders = useMemo(
    () => filterOrdersForReport(allOrders, filters),
    [allOrders, filters]
  );
  const summary = useMemo(() => buildReportSummary(filteredOrders), [filteredOrders]);
  const rows = useMemo(() => buildReportRows(filteredOrders), [filteredOrders]);
  const activeFilters = useMemo(() => getActiveReportFilters(filters), [filters]);

  const stageOptions = useMemo(() => productionStages, [productionStages]);

  function updateFilter<K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handlePdfExport() {
    try {
      await generateJobsReportPdf({
        activeFilters,
        summary,
        rows,
      });
    } catch {
      window.alert("Could not generate the PDF report. Please try again.");
    }
  }

  function handleCsvExport() {
    try {
      exportJobsCsv(rows);
    } catch {
      window.alert("Could not export CSV. Please try again.");
    }
  }

  function handleExcelExport() {
    try {
      exportJobsExcel({
        activeFilters,
        summary,
        rows,
      });
    } catch {
      window.alert("Could not export Excel. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Reports
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Jobs Report</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review filtered production activity and export clean job reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePdfExport}
              className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Export PDF Report
            </button>
            <button
              type="button"
              onClick={handleCsvExport}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleExcelExport}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Export Excel
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        <div className="grid gap-3 xl:grid-cols-[repeat(7,minmax(0,1fr))_auto]">
          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Date from</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              className={selectClass}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Date to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              className={selectClass}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Client</span>
            <select
              value={filters.client}
              onChange={(event) => updateFilter("client", event.target.value)}
              className={selectClass}
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Status</span>
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className={selectClass}
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Job type</span>
            <select
              value={filters.jobType}
              onChange={(event) => updateFilter("jobType", event.target.value)}
              className={selectClass}
            >
              <option value="">All job types</option>
              {jobTypes.map((jobType) => (
                <option key={jobType.id} value={jobType.name}>
                  {jobType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">Priority</span>
            <select
              value={filters.priority}
              onChange={(event) => updateFilter("priority", event.target.value)}
              className={selectClass}
            >
              <option value="">All priorities</option>
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.name}>
                  {priority.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold text-slate-600">
              Production stage
            </span>
            <select
              value={filters.productionStage}
              onChange={(event) => updateFilter("productionStage", event.target.value)}
              className={selectClass}
            >
              <option value="">All stages</option>
              {stageOptions.map((stage) => (
                <option key={stage.id} value={stage.name}>
                  {stage.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setFilters(DEFAULT_REPORT_FILTERS)}
            className="h-10 self-end rounded-md border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Clear Filters
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.length === 0 ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              No filters applied
            </span>
          ) : (
            activeFilters.map((filter) => (
              <span
                key={`${filter.label}-${filter.value}`}
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {filter.label}: {filter.value}
              </span>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.35)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {statConfig.map((stat) => (
            <div
              key={stat.key}
              className={`rounded-xl border border-slate-200 border-t-[3px] bg-slate-50/70 px-3 py-2.5 shadow-[0_8px_18px_-20px_rgba(15,23,42,0.35)] ${stat.accent}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                {summary[stat.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Filtered jobs</h2>
            <p className="text-sm text-slate-600">
              {rows.length} job{rows.length === 1 ? "" : "s"} in this report
            </p>
          </div>
          <p className="text-xs text-slate-500">Live data preview</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Job ID</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Job Type</th>
                <th className="px-4 py-3 font-semibold">Production Stage</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold">Completed Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    No jobs match the selected report filters.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={`${row.jobId}-${index}`}
                    className="border-t border-slate-200 text-slate-800"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">
                      {row.jobId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-950">{row.title}</td>
                    <td className="px-4 py-3">{row.client}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{row.priority}</td>
                    <td className="px-4 py-3">{row.jobType}</td>
                    <td className="px-4 py-3">{row.productionStage}</td>
                    <td className="px-4 py-3">{row.dueDate}</td>
                    <td className="px-4 py-3">{row.completedDate || "Not completed"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
