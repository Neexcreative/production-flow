import type { PriorityOption } from "@/types/order";

export const priorities: PriorityOption[] = [
  {
    id: "priority-low",
    name: "Low",
    color: "#64748b",
    sortOrder: 1,
    active: true,
  },
  {
    id: "priority-normal",
    name: "Normal",
    color: "#2563eb",
    sortOrder: 2,
    active: true,
  },
  {
    id: "priority-high",
    name: "High",
    color: "#dc2626",
    sortOrder: 3,
    active: true,
  },
];
