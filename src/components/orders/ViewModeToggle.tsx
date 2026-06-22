"use client";

import type { ViewMode } from "@/lib/productionTracker";

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

const buttonClass =
  "rounded-md border px-3 py-2 text-sm font-semibold transition";

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_30px_-26px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            View Mode
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Switch between the board layout and a compact operational list.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onChange("board")}
            className={[
              buttonClass,
              value === "board"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-transparent bg-transparent text-slate-700 hover:bg-white",
            ].join(" ")}
          >
            Board View
          </button>
          <button
            type="button"
            onClick={() => onChange("list")}
            className={[
              buttonClass,
              value === "list"
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-transparent bg-transparent text-slate-700 hover:bg-white",
            ].join(" ")}
          >
            List View
          </button>
        </div>
      </div>
    </section>
  );
}
