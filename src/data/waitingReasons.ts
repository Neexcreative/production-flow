import type { CatalogOption } from "@/types/catalog";

export const waitingReasons: CatalogOption[] = [
  {
    id: "waiting-client-approval",
    name: "Waiting client approval",
    sortOrder: 1,
    active: true,
  },
  {
    id: "waiting-internal-approval",
    name: "Waiting internal approval",
    sortOrder: 2,
    active: true,
  },
  {
    id: "waiting-resources",
    name: "Waiting resources",
    sortOrder: 3,
    active: true,
  },
  {
    id: "waiting-information",
    name: "Waiting Information",
    sortOrder: 4,
    active: true,
  },
  {
    id: "waiting-files",
    name: "Waiting files",
    sortOrder: 5,
    active: true,
  },
  {
    id: "waiting-review",
    name: "Waiting review",
    sortOrder: 6,
    active: true,
  },
  { id: "waiting-other", name: "Other", sortOrder: 7, active: true },
];
