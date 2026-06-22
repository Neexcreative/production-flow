"use client";

import { useState } from "react";

import { useProductionTracker } from "@/components/orders/ProductionTrackerProvider";
import type { CatalogOption } from "@/types/catalog";
import type { Client } from "@/types/client";
import type { PriorityOption, StatusOption } from "@/types/order";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200";
const checkboxLabelClass =
  "inline-flex items-center gap-2 text-sm font-medium text-slate-700";

function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        active
          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
          : "border-slate-300 bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function GenericCatalogSection<T extends CatalogOption>({
  title,
  description,
  items,
  itemLabel,
  onSave,
  onToggle,
}: {
  title: string;
  description: string;
  items: T[];
  itemLabel: string;
  onSave: (
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) => Promise<{ error?: string }>;
  onToggle: (id: string, nextActive: boolean) => Promise<void>;
}) {
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");

  function startEdit(item: T) {
    setEditingItem(item);
    setName(item.name);
    setSortOrder(String(item.sortOrder ?? 0));
    setError("");
  }

  function resetForm() {
    setEditingItem(null);
    setName("");
    setSortOrder("0");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await onSave({
      id: editingItem?.id,
      name,
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      active: editingItem?.active ?? true,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    resetForm();
  }

  return (
    <SectionShell title={title} description={description}>
      <form className="grid gap-3 md:grid-cols-[1.6fr_0.6fr_auto_auto]" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          placeholder={`Enter ${itemLabel.toLowerCase()} name`}
        />
        <input
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className={inputClass}
          placeholder="Sort"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {editingItem ? "Save" : `Add ${itemLabel}`}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Clear
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-950">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">Sort order: {item.sortOrder ?? 0}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActiveBadge active={item.active} />
              <button
                type="button"
                onClick={() => startEdit(item)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void onToggle(item.id, !item.active)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function StatusSection({
  items,
  onSave,
  onToggle,
}: {
  items: StatusOption[];
  onSave: (
    input: Partial<StatusOption> & { id?: string; name: string; slug?: string }
  ) => Promise<{ error?: string }>;
  onToggle: (id: string, nextActive: boolean) => Promise<void>;
}) {
  const [editingItem, setEditingItem] = useState<StatusOption | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("#0f172a");
  const [sortOrder, setSortOrder] = useState("0");
  const [isBoardColumn, setIsBoardColumn] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  function startEdit(item: StatusOption) {
    setEditingItem(item);
    setName(item.name);
    setSlug(item.slug ?? "");
    setColor(item.color ?? "#0f172a");
    setSortOrder(String(item.sortOrder));
    setIsBoardColumn(item.isBoardColumn);
    setIsDone(item.isDone);
    setError("");
  }

  function resetForm() {
    setEditingItem(null);
    setName("");
    setSlug("");
    setColor("#0f172a");
    setSortOrder("0");
    setIsBoardColumn(true);
    setIsDone(false);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await onSave({
      id: editingItem?.id,
      name,
      slug,
      color,
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      isBoardColumn,
      isDone,
      active: editingItem?.active ?? true,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    resetForm();
  }

  return (
    <SectionShell
      title="Statuses"
      description="Control board columns, status labels, sort order, and completion behavior."
    >
      <form className="grid gap-3 xl:grid-cols-[1.2fr_1fr_0.8fr_0.6fr_auto]" onSubmit={handleSubmit}>
        <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Status name" />
        <input value={slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="Slug" />
        <input value={color} onChange={(event) => setColor(event.target.value)} className={inputClass} placeholder="#0f172a" />
        <input type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className={inputClass} placeholder="Sort" />
        <button type="submit" className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          {editingItem ? "Save" : "Add Status"}
        </button>
        <label className={checkboxLabelClass}>
          <input type="checkbox" checked={isBoardColumn} onChange={(event) => setIsBoardColumn(event.target.checked)} />
          Board column
        </label>
        <label className={checkboxLabelClass}>
          <input type="checkbox" checked={isDone} onChange={(event) => setIsDone(event.target.checked)} />
          Done status
        </label>
        <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Clear
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-950">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Slug: {item.slug || "-"} | Sort: {item.sortOrder} | Board: {item.isBoardColumn ? "Yes" : "No"} | Done: {item.isDone ? "Yes" : "No"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActiveBadge active={item.active} />
              <button type="button" onClick={() => startEdit(item)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                Edit
              </button>
              <button type="button" onClick={() => void onToggle(item.id, !item.active)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                {item.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function PrioritySection({
  items,
  onSave,
  onToggle,
}: {
  items: PriorityOption[];
  onSave: (
    input: Partial<PriorityOption> & { id?: string; name: string }
  ) => Promise<{ error?: string }>;
  onToggle: (id: string, nextActive: boolean) => Promise<void>;
}) {
  const [editingItem, setEditingItem] = useState<PriorityOption | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#64748b");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");

  function startEdit(item: PriorityOption) {
    setEditingItem(item);
    setName(item.name);
    setColor(item.color ?? "#64748b");
    setSortOrder(String(item.sortOrder));
    setError("");
  }

  function resetForm() {
    setEditingItem(null);
    setName("");
    setColor("#64748b");
    setSortOrder("0");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await onSave({
      id: editingItem?.id,
      name,
      color,
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      active: editingItem?.active ?? true,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    resetForm();
  }

  return (
    <SectionShell
      title="Priorities"
      description="Manage priority labels, colors, and sort order for job urgency."
    >
      <form className="grid gap-3 md:grid-cols-[1.4fr_1fr_0.7fr_auto_auto]" onSubmit={handleSubmit}>
        <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Priority name" />
        <input value={color} onChange={(event) => setColor(event.target.value)} className={inputClass} placeholder="#64748b" />
        <input type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className={inputClass} placeholder="Sort" />
        <button type="submit" className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          {editingItem ? "Save" : "Add Priority"}
        </button>
        <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Clear
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-slate-950">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">Color: {item.color || "-"} | Sort: {item.sortOrder}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActiveBadge active={item.active} />
              <button type="button" onClick={() => startEdit(item)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                Edit
              </button>
              <button type="button" onClick={() => void onToggle(item.id, !item.active)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                {item.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function ClientSection({
  items,
  onSave,
  onToggle,
}: {
  items: Client[];
  onSave: (input: Partial<Client> & { id?: string; name: string }) => Promise<{ error?: string }>;
  onToggle: (id: string, nextActive: boolean) => Promise<void>;
}) {
  const [editingItem, setEditingItem] = useState<Client | null>(null);
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    notes: "",
    sortOrder: "0",
  });
  const [error, setError] = useState("");

  function startEdit(item: Client) {
    setEditingItem(item);
    setForm({
      name: item.name,
      contactName: item.contactName ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      notes: item.notes ?? "",
      sortOrder: String(item.sortOrder ?? 0),
    });
    setError("");
  }

  function resetForm() {
    setEditingItem(null);
    setForm({
      name: "",
      contactName: "",
      email: "",
      phone: "",
      notes: "",
      sortOrder: "0",
    });
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await onSave({
      id: editingItem?.id,
      name: form.name,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      active: editingItem?.active ?? true,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    resetForm();
  }

  return (
    <SectionShell
      title="Clients"
      description="Manage client names and contact details used in the job form and reports."
    >
      <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSubmit}>
        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} placeholder="Client name" />
        <input value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} className={inputClass} placeholder="Contact name" />
        <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={inputClass} placeholder="Email" />
        <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className={inputClass} placeholder="Phone" />
        <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} className={inputClass} placeholder="Sort order" />
        <div className="md:col-span-2 xl:col-span-3">
          <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={inputClass} rows={3} placeholder="Client notes" />
        </div>
        <button type="submit" className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          {editingItem ? "Save Client" : "Add Client"}
        </button>
        <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Clear
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold text-slate-950">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Contact: {item.contactName || "-"} | Email: {item.email || "-"} | Phone: {item.phone || "-"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActiveBadge active={item.active} />
              <button type="button" onClick={() => startEdit(item)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                Edit
              </button>
              <button type="button" onClick={() => void onToggle(item.id, !item.active)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                {item.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function SettingsScreen() {
  const {
    isReady,
    clients,
    statuses,
    priorities,
    jobTypes,
    productionStages,
    materials,
    waitingReasons,
    requestedByOptions,
    saveClientRecord,
    saveStatusRecord,
    savePriorityRecord,
    saveJobTypeRecord,
    saveProductionStageRecord,
    saveMaterialRecord,
    saveWaitingReasonRecord,
    saveRequesterRecord,
    setClientActive,
    setStatusActive,
    setPriorityActive,
    setJobTypeActive,
    setProductionStageActive,
    setMaterialActive,
    setWaitingReasonActive,
    setRequesterActive,
  } = useProductionTracker();

  if (!isReady) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-600 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
        <h1 className="text-xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage Production Flow dropdown data and board configuration without deleting linked records.
        </p>
      </section>

      <ClientSection items={clients} onSave={saveClientRecord} onToggle={setClientActive} />
      <StatusSection items={statuses} onSave={saveStatusRecord} onToggle={setStatusActive} />
      <PrioritySection items={priorities} onSave={savePriorityRecord} onToggle={setPriorityActive} />
      <GenericCatalogSection title="Job Types" description="Manage the job type dropdown used by job records." items={jobTypes} itemLabel="Job Type" onSave={saveJobTypeRecord} onToggle={setJobTypeActive} />
      <GenericCatalogSection title="Production Stages" description="Manage production stages used by job records and reporting." items={productionStages} itemLabel="Production Stage" onSave={saveProductionStageRecord} onToggle={setProductionStageActive} />
      <GenericCatalogSection title="Resources" description="Manage resources and material options available in job records." items={materials} itemLabel="Resource" onSave={saveMaterialRecord} onToggle={setMaterialActive} />
      <GenericCatalogSection title="Waiting Reasons" description="Manage reasons used when jobs are blocked or waiting." items={waitingReasons} itemLabel="Waiting Reason" onSave={saveWaitingReasonRecord} onToggle={setWaitingReasonActive} />
      <GenericCatalogSection title="Requesters" description="Manage the Requested By dropdown for incoming jobs." items={requestedByOptions} itemLabel="Requester" onSave={saveRequesterRecord} onToggle={setRequesterActive} />
    </div>
  );
}
