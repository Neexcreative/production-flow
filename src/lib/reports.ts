import type {
  JobOrder,
  OrderStatus,
  Priority,
  ProductionStage,
} from "@/types/order";

export type ReportFilters = {
  dateFrom: string;
  dateTo: string;
  client: string;
  status: string;
  jobType: string;
  priority: string;
  productionStage: string;
};

export type ReportSummary = {
  totalJobs: number;
  newJobs: number;
  inProgressJobs: number;
  waitingJobs: number;
  completedJobs: number;
  overdueJobs: number;
};

export type ReportRow = {
  jobId: string;
  title: string;
  client: string;
  status: OrderStatus;
  priority: Priority;
  jobType: string;
  productionStage: ProductionStage;
  dueDate: string;
  completedDate: string;
};

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  dateFrom: "",
  dateTo: "",
  client: "",
  status: "",
  jobType: "",
  priority: "",
  productionStage: "",
};

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function parseIsoDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function getReportDate(order: JobOrder) {
  return parseIsoDate(order.createdAt) ?? parseIsoDate(order.updatedAt);
}

export function parseDueText(value?: string | null, now = new Date()) {
  const dueText = value?.trim();

  if (!dueText) {
    return null;
  }

  const normalized = dueText.toLowerCase();

  if (normalized === "today") {
    return endOfDay(now);
  }

  if (normalized === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return endOfDay(tomorrow);
  }

  if (normalized === "pending" || normalized === "done") {
    return null;
  }

  const parsedWithYear = new Date(`${dueText} ${now.getFullYear()}`);
  if (!Number.isNaN(parsedWithYear.getTime())) {
    return endOfDay(parsedWithYear);
  }

  const directParse = new Date(dueText);
  return Number.isNaN(directParse.getTime()) ? null : endOfDay(directParse);
}

export function isOverdue(order: JobOrder, now = new Date()) {
  if (order.status === "Done") {
    return false;
  }

  const dueDate = parseDueText(order.due, now);

  if (!dueDate) {
    return false;
  }

  return dueDate.getTime() < now.getTime();
}

export function filterOrdersForReport(orders: JobOrder[], filters: ReportFilters) {
  const dateFrom = filters.dateFrom ? startOfDay(new Date(filters.dateFrom)) : null;
  const dateTo = filters.dateTo ? endOfDay(new Date(filters.dateTo)) : null;

  return orders.filter((order) => {
    const reportDate = getReportDate(order);

    if (filters.client && order.client !== filters.client) {
      return false;
    }

    if (filters.status && order.status !== filters.status) {
      return false;
    }

    if (filters.jobType && order.jobType !== filters.jobType) {
      return false;
    }

    if (filters.priority && order.priority !== filters.priority) {
      return false;
    }

    if (
      filters.productionStage &&
      order.productionStage !== filters.productionStage
    ) {
      return false;
    }

    if (dateFrom && (!reportDate || reportDate.getTime() < dateFrom.getTime())) {
      return false;
    }

    if (dateTo && (!reportDate || reportDate.getTime() > dateTo.getTime())) {
      return false;
    }

    return true;
  });
}

export function buildReportSummary(orders: JobOrder[]): ReportSummary {
  return {
    totalJobs: orders.length,
    newJobs: orders.filter((order) => order.status === "New").length,
    inProgressJobs: orders.filter((order) => order.status === "In Progress").length,
    waitingJobs: orders.filter((order) => order.status === "Waiting").length,
    completedJobs: orders.filter((order) => order.status === "Done").length,
    overdueJobs: orders.filter((order) => isOverdue(order)).length,
  };
}

export function formatReportDate(value?: string | null) {
  const parsedDate = parseIsoDate(value);

  if (!parsedDate) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildReportRows(orders: JobOrder[]): ReportRow[] {
  return orders.map((order) => ({
    jobId: order.id,
    title: order.title,
    client: order.client,
    status: order.status,
    priority: order.priority,
    jobType: order.jobType,
    productionStage: order.productionStage,
    dueDate: order.due,
    completedDate: formatReportDate(order.completedAt) || "",
  }));
}

export function getActiveReportFilters(filters: ReportFilters) {
  return [
    { label: "Date from", value: filters.dateFrom },
    { label: "Date to", value: filters.dateTo },
    { label: "Client", value: filters.client },
    { label: "Status", value: filters.status },
    { label: "Job type", value: filters.jobType },
    { label: "Priority", value: filters.priority },
    { label: "Production stage", value: filters.productionStage },
  ].filter((item) => item.value);
}

export function getReportStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildReportPdfFilename(date = new Date()) {
  return `production-flow-jobs-report-${getReportStamp(date)}.pdf`;
}

export function buildReportCsvFilename(date = new Date()) {
  return `production-flow-jobs-report-${getReportStamp(date)}.csv`;
}

export function buildReportExcelFilename(date = new Date()) {
  return `production-flow-jobs-report-${getReportStamp(date)}.xlsx`;
}
