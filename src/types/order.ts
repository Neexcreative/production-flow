export type OrderStatus = string;
export type ProductionStage = string;
export type Priority = string;

export type StatusOption = {
  id: string;
  name: string;
  slug?: string;
  color?: string;
  sortOrder: number;
  isBoardColumn: boolean;
  isDone: boolean;
  active: boolean;
};

export type PriorityOption = {
  id: string;
  name: string;
  color?: string;
  sortOrder: number;
  active: boolean;
};

export type JobOrder = {
  id: string;
  title: string;
  client: string;
  jobType: string;
  productionStage: ProductionStage;
  status: OrderStatus;
  priority: Priority;
  due: string;
  vehicleItem?: string;
  material?: string;
  quantity?: string;
  printQuantity?: string;
  cutQuantity?: string;
  laminationQuantity?: string;
  requestedBy?: string;
  waitingReason?: string;
  fileLink?: string;
  artworkLink?: string;
  productionFileLink?: string;
  notes?: string;
  referenceImage?: string;
  referenceImageName?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  archivedAt?: string | null;
};

export type OrderFormValues = {
  title: string;
  client: string;
  jobType: string;
  productionStage: ProductionStage;
  status: OrderStatus;
  priority: Priority;
  due: string;
  vehicleItem: string;
  material: string;
  quantity: string;
  printQuantity: string;
  cutQuantity: string;
  laminationQuantity: string;
  requestedBy: string;
  waitingReason: string;
  fileLink: string;
  artworkLink: string;
  productionFileLink: string;
  notes: string;
  referenceImage: string;
  referenceImageName: string;
  referenceImageUrl: string;
};

export type OrderHistoryItem = {
  id: string;
  orderId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
};

export type OrderFilters = {
  search: string;
  client: string;
  jobType: string;
  productionStage: string;
  priority: string;
  material: string;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "In Progress",
  "Waiting",
  "Done",
];

export const PRODUCTION_STAGES: ProductionStage[] = [
  "Artwork",
  "Printing",
  "Production",
  "Review",
  "Approval",
  "Installation",
];

export const PRIORITIES: Priority[] = ["Low", "Normal", "High"];

export const WAITING_REASONS = [
  "Waiting client approval",
  "Waiting internal approval",
  "Waiting resources",
  "Waiting Information",
  "Waiting files",
  "Waiting review",
  "Other",
] as const;
