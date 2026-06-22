import type { ReportRow } from "@/lib/reports";
import { buildReportCsvFilename } from "@/lib/reports";

function escapeCsvValue(value: string) {
  const normalized = value.replace(/"/g, '""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

export function exportJobsCsv(rows: ReportRow[]) {
  const header = [
    "Job ID",
    "Title",
    "Client",
    "Status",
    "Priority",
    "Job Type",
    "Production Stage",
    "Due Date",
    "Completed Date",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.jobId,
        row.title,
        row.client,
        row.status,
        row.priority,
        row.jobType,
        row.productionStage,
        row.dueDate,
        row.completedDate,
      ]
        .map((value) => escapeCsvValue(value))
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildReportCsvFilename();
  link.click();
  URL.revokeObjectURL(url);
}
