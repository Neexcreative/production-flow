import { jsPDF } from "jspdf";

import type { ReportRow, ReportSummary } from "@/lib/reports";
import { buildReportPdfFilename } from "@/lib/reports";

const PAGE_MARGIN = 28;
const FOOTER_HEIGHT = 20;

type Column = {
  key: keyof ReportRow;
  label: string;
  width: number;
};

const columns: Column[] = [
  { key: "jobId", label: "Job ID", width: 60 },
  { key: "title", label: "Title", width: 120 },
  { key: "client", label: "Client", width: 90 },
  { key: "status", label: "Status", width: 70 },
  { key: "priority", label: "Priority", width: 56 },
  { key: "jobType", label: "Job Type", width: 78 },
  { key: "productionStage", label: "Production Stage", width: 92 },
  { key: "dueDate", label: "Due Date", width: 68 },
  { key: "completedDate", label: "Completed Date", width: 82 },
];

function ensureSpace(doc: jsPDF, cursorY: number, heightNeeded: number) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (cursorY + heightNeeded <= pageHeight - PAGE_MARGIN - FOOTER_HEIGHT) {
    return cursorY;
  }

  doc.addPage();
  return PAGE_MARGIN;
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(PAGE_MARGIN, pageHeight - FOOTER_HEIGHT, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_HEIGHT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Production Flow", PAGE_MARGIN, pageHeight - 6);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 6, {
      align: "right",
    });
  }
}

function drawTableHeader(doc: jsPDF, startY: number) {
  let currentX = PAGE_MARGIN;

  doc.setFillColor(241, 245, 249);
  doc.rect(PAGE_MARGIN, startY, columns.reduce((sum, column) => sum + column.width, 0), 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  for (const column of columns) {
    doc.text(column.label, currentX + 4, startY + 13);
    currentX += column.width;
  }

  return startY + 20;
}

function drawTableRow(
  doc: jsPDF,
  row: ReportRow,
  startY: number
) {
  const splitValues = columns.map((column) =>
    doc.splitTextToSize(String(row[column.key] || ""), column.width - 8)
  );
  const rowHeight = Math.max(
    20,
    ...splitValues.map((value) => value.length * 10 + 8)
  );
  let currentX = PAGE_MARGIN;

  doc.setDrawColor(226, 232, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  splitValues.forEach((value, index) => {
    const column = columns[index];
    doc.rect(currentX, startY, column.width, rowHeight);
    doc.text(value, currentX + 4, startY + 11);
    currentX += column.width;
  });

  return startY + rowHeight;
}

type GenerateJobsReportPdfArgs = {
  activeFilters: Array<{ label: string; value: string }>;
  summary: ReportSummary;
  rows: ReportRow[];
};

export async function generateJobsReportPdf({
  activeFilters,
  summary,
  rows,
}: GenerateJobsReportPdfArgs) {
  const doc = new jsPDF({
    format: "a4",
    orientation: "landscape",
    unit: "pt",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = PAGE_MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Production Flow", PAGE_MARGIN, cursorY);
  doc.text("Jobs Report", pageWidth - PAGE_MARGIN, cursorY, { align: "right" });

  cursorY += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IE")}`,
    PAGE_MARGIN,
    cursorY
  );

  cursorY += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("Selected Filters", PAGE_MARGIN, cursorY);
  cursorY += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (activeFilters.length === 0) {
    doc.text("All jobs", PAGE_MARGIN, cursorY);
    cursorY += 14;
  } else {
    for (const filter of activeFilters) {
      doc.text(`${filter.label}: ${filter.value}`, PAGE_MARGIN, cursorY);
      cursorY += 12;
    }
  }

  cursorY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Summary", PAGE_MARGIN, cursorY);
  cursorY += 14;

  const summaryItems = [
    ["Total jobs", String(summary.totalJobs)],
    ["New jobs", String(summary.newJobs)],
    ["In progress jobs", String(summary.inProgressJobs)],
    ["Waiting jobs", String(summary.waitingJobs)],
    ["Completed jobs", String(summary.completedJobs)],
    ["Overdue jobs", String(summary.overdueJobs)],
  ];

  const cardWidth = 110;
  const cardGap = 10;
  let cardX = PAGE_MARGIN;

  for (const [label, value] of summaryItems) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cardX, cursorY, cardWidth, 44, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(value, cardX + 10, cursorY + 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(label, cardX + 10, cursorY + 32);
    cardX += cardWidth + cardGap;
  }

  cursorY += 58;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("Jobs", PAGE_MARGIN, cursorY);
  cursorY += 12;

  cursorY = drawTableHeader(doc, cursorY);

  if (rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("No jobs match the selected filters.", PAGE_MARGIN, cursorY + 16);
  } else {
    for (const row of rows) {
      cursorY = ensureSpace(doc, cursorY, 34);

      if (cursorY === PAGE_MARGIN) {
        cursorY = drawTableHeader(doc, cursorY);
      }

      cursorY = drawTableRow(doc, row, cursorY);
    }
  }

  addFooter(doc);
  doc.save(buildReportPdfFilename());
}
