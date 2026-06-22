import type { CatalogOption } from "@/types/catalog";

export const productionStages: CatalogOption[] = [
  { id: "stage-artwork", name: "Artwork", sortOrder: 1, active: true },
  { id: "stage-printing", name: "Printing", sortOrder: 2, active: true },
  { id: "stage-production", name: "Production", sortOrder: 3, active: true },
  { id: "stage-review", name: "Review", sortOrder: 4, active: true },
  { id: "stage-approval", name: "Approval", sortOrder: 5, active: true },
  { id: "stage-installation", name: "Installation", sortOrder: 6, active: true },
];
