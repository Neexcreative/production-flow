export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime()) || toISODate(date) !== value) {
    return null;
  }

  return date;
}

export function getTodayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(days: number, from = new Date()): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

function normalizeDueText(value?: string | null) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const normalizedValue = trimmedValue.toLowerCase();

  if (normalizedValue === "today") {
    return "Today";
  }

  if (normalizedValue === "pending") {
    return "Pending";
  }

  if (normalizedValue === "done") {
    return "Done";
  }

  return trimmedValue;
}

function parseSlashDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;

  return parseISODate(isoDate) ? isoDate : null;
}

function parseFriendlyDate(value: string) {
  const currentYear = new Date().getFullYear();
  const parsedDate = new Date(`${value} ${currentYear}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return toISODate(parsedDate);
}

export function normalizeDueDateInput(input: {
  dueDate?: string | null;
  dueText?: string | null;
  due?: string | null;
}) {
  const normalizedDueText = normalizeDueText(input.dueText);

  if (normalizedDueText === "Pending" || normalizedDueText === "Done") {
    return { dueDate: null, dueText: normalizedDueText };
  }

  if (normalizedDueText === "Today") {
    return {
      dueDate: parseISODate(input.dueDate ?? null)
        ? input.dueDate ?? getTodayISO()
        : getTodayISO(),
      dueText: "Today",
    };
  }

  if (parseISODate(input.dueDate ?? null)) {
    return { dueDate: input.dueDate ?? null, dueText: normalizedDueText };
  }

  const legacyDue = input.due?.trim();

  if (!legacyDue) {
    return { dueDate: null, dueText: normalizedDueText };
  }

  const normalizedLegacyDueText = normalizeDueText(legacyDue);

  if (
    normalizedLegacyDueText === "Today" ||
    normalizedLegacyDueText === "Pending" ||
    normalizedLegacyDueText === "Done"
  ) {
    return normalizeDueDateInput({ dueText: normalizedLegacyDueText });
  }

  const slashDate = parseSlashDate(legacyDue);

  if (slashDate) {
    return { dueDate: slashDate, dueText: null };
  }

  const isoDate = parseISODate(legacyDue);

  if (isoDate) {
    return { dueDate: legacyDue, dueText: null };
  }

  const friendlyDate = parseFriendlyDate(legacyDue);

  if (friendlyDate) {
    return { dueDate: friendlyDate, dueText: null };
  }

  return { dueDate: null, dueText: legacyDue };
}

export function formatDueDisplay(
  dueDate: string | null | undefined,
  dueText: string | null | undefined
) {
  const normalizedDueText = normalizeDueText(dueText);

  if (normalizedDueText) {
    return normalizedDueText;
  }

  const parsedDate = parseISODate(dueDate);

  if (!parsedDate) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
