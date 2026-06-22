import type { StatusOption } from "@/types/order";

export const statuses: StatusOption[] = [
  {
    id: "status-new",
    name: "New",
    slug: "new",
    color: "#0f172a",
    sortOrder: 1,
    isBoardColumn: true,
    isDone: false,
    active: true,
  },
  {
    id: "status-in-progress",
    name: "In Progress",
    slug: "in-progress",
    color: "#f59e0b",
    sortOrder: 2,
    isBoardColumn: true,
    isDone: false,
    active: true,
  },
  {
    id: "status-waiting",
    name: "Waiting",
    slug: "waiting",
    color: "#dc2626",
    sortOrder: 3,
    isBoardColumn: true,
    isDone: false,
    active: true,
  },
  {
    id: "status-done",
    name: "Done",
    slug: "done",
    color: "#059669",
    sortOrder: 4,
    isBoardColumn: true,
    isDone: true,
    active: true,
  },
];
