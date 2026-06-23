export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateForSupabase(date: Date): string {
  return toISODate(date);
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

export function parseDisplayDate(displayDate: string | null | undefined) {
  if (!displayDate) {
    return null;
  }

  const match = displayDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, month, day, year] = match;
  const isoDate = `${year}-${month}-${day}`;

  return parseISODate(isoDate) ? isoDate : null;
}

export function normalizeDueDateInput(input: {
  dueDate?: string | null;
  dueText?: string | null;
  due?: string | null;
}) {
  if (parseISODate(input.dueDate ?? null)) {
    return { dueDate: input.dueDate ?? null, dueText: null };
  }

  const legacyDue = input.due?.trim();

  if (!legacyDue) {
    return { dueDate: null, dueText: null };
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

  return { dueDate: null, dueText: null };
}

export function formatDateForDisplay(dueDate: string | null | undefined) {
  const parsedDate = parseISODate(dueDate);

  if (!parsedDate) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}
