"use client";

import type { CatalogOption } from "@/types/catalog";
import type { Client } from "@/types/client";
import type { JobTypeOption } from "@/types/jobType";
import {
  DEFAULT_FILTERS,
} from "@/lib/productionTracker";
import type { OrderFilters, PriorityOption } from "@/types/order";

type OrderFiltersBarProps = {
  filters: OrderFilters;
  clients: Client[];
  priorities: PriorityOption[];
  jobTypes: JobTypeOption[];
  productionStages: CatalogOption[];
  materials: CatalogOption[];
  onChange: (filters: OrderFilters) => void;
};

const selectClass =
  "h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200";

export function OrderFiltersBar({
  filters,
  clients,
  priorities,
  jobTypes,
  productionStages,
  materials,
  onChange,
}: OrderFiltersBarProps) {
  function update<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
      <div className="grid gap-3 xl:grid-cols-[1.6fr_repeat(5,minmax(0,1fr))_auto]">
        <input
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          placeholder="Search ID, title, client, job type, status, resource..."
        />

        <select
          value={filters.client}
          onChange={(event) => update("client", event.target.value)}
          className={selectClass}
        >
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>

        <select
          value={filters.jobType}
          onChange={(event) => update("jobType", event.target.value)}
          className={selectClass}
        >
          <option value="">All job types</option>
          {jobTypes.map((jobType) => (
            <option key={jobType.id} value={jobType.name}>
              {jobType.name}
            </option>
          ))}
        </select>

        <select
          value={filters.productionStage}
          onChange={(event) => update("productionStage", event.target.value)}
          className={selectClass}
        >
          <option value="">All stages</option>
          {productionStages.map((stage) => (
            <option key={stage.id} value={stage.name}>
              {stage.name}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) => update("priority", event.target.value)}
          className={selectClass}
        >
          <option value="">All priorities</option>
          {priorities.map((priority) => (
            <option key={priority.id} value={priority.name}>
              {priority.name}
            </option>
          ))}
        </select>

        <select
          value={filters.material}
          onChange={(event) => update("material", event.target.value)}
          className={selectClass}
        >
          <option value="">All resources</option>
          {materials.map((material) => (
            <option key={material.id} value={material.name}>
              {material.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="h-10 rounded-md border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}
