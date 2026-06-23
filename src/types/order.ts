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
  itemProjectAsset?: string;
  resource?: string;
  quantity?: string;
  outputQuantity?: string;
  cutQuantity?: string;
  laminationFinishingQuantity?: string;
  requestedBy?: string;
  waitingReason?: string;
  mainFileLink?: string;
  artworkDesignLink?: string;
  finalProductionLink?: string;
  internalNotes?: string;
  referenceUrl?: string;
  referenceAttachmentUrl?: string;
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
  itemProjectAsset: string;
  resource: string;
  quantity: string;
  outputQuantity: string;
  cutQuantity: string;
  laminationFinishingQuantity: string;
  requestedBy: string;
  waitingReason: string;
  mainFileLink: string;
  artworkDesignLink: string;
  finalProductionLink: string;
  internalNotes: string;
  referenceAttachmentUrl: string;
  referenceAttachmentName: string;
  referenceUrl: string;
};

export type SupabaseJobPayload = {
  job_number: string;
  title: string;
  client_id: string | null;
  job_type_id: string | null;
  production_stage_id: string | null;
  status_id: string | null;
  priority_id: string | null;
  due_date: string | null;
  due_text: string | null;
  item_project_asset: string | null;
  requested_by_id: string | null;
  resource_id: string | null;
  quantity: number | null;
  output_quantity: number | null;
  cut_quantity: number | null;
  lamination_finishing_quantity: number | null;
  waiting_reason_id: string | null;
  main_file_link: string | null;
  artwork_design_link: string | null;
  final_production_link: string | null;
  internal_notes: string | null;
  reference_url: string | null;
  reference_attachment_url: string | null;
  completed_at: string | null;
  archived_at: string | null;
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
