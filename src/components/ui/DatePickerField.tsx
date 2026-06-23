"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  addDaysISO,
  formatDueDisplay,
  getTodayISO,
  parseISODate,
  toISODate,
} from "@/utils/date";

type DatePickerFieldProps = {
  value: string | null;
  dueText: string | null;
  onChange: (value: { dueDate: string | null; dueText: string | null }) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
};

const buttonClass =
  "flex h-11 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200";
const navButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100";

function getDisplayMonth(date: Date) {
  return date.toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  });
}

function isSameDate(left: Date, right: Date) {
  return toISODate(left) === toISODate(right);
}

function buildCalendarDays(visibleMonth: Date) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const firstVisibleDay = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay);
    date.setDate(firstVisibleDay.getDate() + index);
    return date;
  });
}

function getSelectionMode(value: string | null, dueText: string | null) {
  if (dueText === "Pending") {
    return "Pending";
  }

  if (dueText === "Done") {
    return "Done";
  }

  if (dueText === "Today") {
    return "Today";
  }

  if (value) {
    return "Exact date";
  }

  return "Exact date";
}

export function DatePickerField({
  value,
  dueText,
  onChange,
  label = "Due Date",
  placeholder = "Select due date",
  disabled = false,
  error,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = useMemo(() => parseISODate(value), [value]);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDate ?? new Date()
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => new Date(), []);
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth]
  );
  const selectionMode = getSelectionMode(value, dueText);
  const displayValue = formatDueDisplay(value, dueText) || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function setDueValue(nextValue: { dueDate: string | null; dueText: string | null }) {
    onChange(nextValue);
  }

  function handleModeChange(nextMode: string) {
    if (nextMode === "Today") {
      setDueValue({ dueDate: getTodayISO(), dueText: "Today" });
      return;
    }

    if (nextMode === "Pending") {
      setDueValue({ dueDate: null, dueText: "Pending" });
      return;
    }

    if (nextMode === "Done") {
      setDueValue({ dueDate: null, dueText: "Done" });
      return;
    }

    setDueValue({ dueDate: value, dueText: null });
  }

  function handleDateSelect(date: Date) {
    setDueValue({ dueDate: toISODate(date), dueText: null });
    setIsOpen(false);
  }

  function applyQuickOption(option: "today" | "tomorrow" | "nextWeek" | "pending" | "done" | "clear") {
    if (option === "today") {
      setDueValue({ dueDate: getTodayISO(), dueText: "Today" });
      setVisibleMonth(new Date());
      setIsOpen(false);
      return;
    }

    if (option === "tomorrow") {
      const isoDate = addDaysISO(1);
      setDueValue({ dueDate: isoDate, dueText: null });
      setVisibleMonth(parseISODate(isoDate) ?? new Date());
      setIsOpen(false);
      return;
    }

    if (option === "nextWeek") {
      const isoDate = addDaysISO(7);
      setDueValue({ dueDate: isoDate, dueText: null });
      setVisibleMonth(parseISODate(isoDate) ?? new Date());
      setIsOpen(false);
      return;
    }

    if (option === "pending") {
      setDueValue({ dueDate: null, dueText: "Pending" });
      setIsOpen(false);
      return;
    }

    if (option === "done") {
      setDueValue({ dueDate: null, dueText: "Done" });
      setIsOpen(false);
      return;
    }

    setDueValue({ dueDate: null, dueText: null });
    setIsOpen(false);
  }

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </span>
      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
        <select
          value={selectionMode}
          onChange={(event) => handleModeChange(event.target.value)}
          disabled={disabled}
          className={[
            "h-11 rounded-md border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200",
            error ? "border-red-400 ring-2 ring-red-100" : "",
          ].join(" ")}
        >
          <option>Exact date</option>
          <option>Today</option>
          <option>Pending</option>
          <option>Done</option>
        </select>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (disabled) {
                return;
              }

              setVisibleMonth(selectedDate ?? new Date());
              setIsOpen((current) => !current);
            }}
            disabled={disabled}
            aria-label="Open due date picker"
            className={[
              buttonClass,
              displayValue === placeholder ? "text-slate-400" : "",
              error ? "border-red-400 ring-2 ring-red-100" : "",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            <span>{displayValue}</span>
            <span className="text-xs font-semibold text-slate-500">
              {selectionMode === "Exact date" ? "Calendar" : selectionMode}
            </span>
          </button>

          {isOpen ? (
            <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_40px_-24px_rgba(15,23,42,0.45)]">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyQuickOption("today")}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:border-amber-300"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickOption("tomorrow")}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:border-amber-300"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickOption("nextWeek")}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:border-amber-300"
                >
                  Next week
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickOption("pending")}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:border-amber-300"
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickOption("done")}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:border-amber-300"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickOption("clear")}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Clear
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() =>
                      setVisibleMonth(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth() - 1,
                          1
                        )
                      )
                    }
                    className={navButtonClass}
                  >
                    {"<"}
                  </button>
                  <p className="text-sm font-bold text-slate-900">
                    {getDisplayMonth(visibleMonth)}
                  </p>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() =>
                      setVisibleMonth(
                        new Date(
                          visibleMonth.getFullYear(),
                          visibleMonth.getMonth() + 1,
                          1
                        )
                      )
                    }
                    className={navButtonClass}
                  >
                    {">"}
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day} className="py-1">
                      {day}
                    </span>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                    const isSelected = selectedDate ? isSameDate(day, selectedDate) : false;
                    const isToday = isSameDate(day, today);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        aria-label={`Select ${day.toLocaleDateString("en-IE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`}
                        onClick={() => handleDateSelect(day)}
                        className={[
                          "h-10 rounded-lg text-sm font-semibold transition",
                          isSelected
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : isToday
                              ? "border border-amber-300 bg-amber-50 text-slate-900 hover:bg-amber-100"
                              : "text-slate-700 hover:bg-slate-100",
                          !isCurrentMonth ? "text-slate-400" : "",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
