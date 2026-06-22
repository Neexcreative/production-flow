import * as XLSX from "xlsx";

import type { ReportRow, ReportSummary } from "@/lib/reports";
import { buildReportExcelFilename } from "@/lib/reports";

type ExportJobsExcelArgs = {
  activeFilters: Array<{ label: string; value: string }>;
  summary: ReportSummary;
  rows: ReportRow[];
};

export function exportJobsExcel({
  activeFilters,
  summary,
  rows,
}: ExportJobsExcelArgs) {
  const workbook = XLSX.utils.book_new();

  const summaryRows = [
    ["Generated", new Date().toLocaleString("en-IE")],
    ...activeFilters.map((item) => [item.label, item.value]),
    [],
    ["Metric", "Value"],
    ["Total jobs", summary.totalJobs],
    ["New jobs", summary.newJobs],
    ["In progress jobs", summary.inProgressJobs],
    ["Waiting jobs", summary.waitingJobs],
    ["Completed jobs", summary.completedJobs],
    ["Overdue jobs", summary.overdueJobs],
  ];

  const jobsRows = rows.map((row) => ({
    "Job ID": row.jobId,
    Title: row.title,
    Client: row.client,
    Status: row.status,
    Priority: row.priority,
    "Job Type": row.jobType,
    "Production Stage": row.productionStage,
    "Due Date": row.dueDate,
    "Completed Date": row.completedDate,
  }));

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  const jobsSheet = XLSX.utils.json_to_sheet(jobsRows);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, jobsSheet, "Jobs");

  XLSX.writeFile(workbook, buildReportExcelFilename());
}
