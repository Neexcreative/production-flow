import type { CatalogOption } from "@/types/catalog";
import { catalogOptionExists, normalizeCatalogName } from "@/types/catalog";
import type { Client } from "@/types/client";
import { clientExists, normalizeClientName } from "@/types/client";
import type { JobTypeOption } from "@/types/jobType";
import { jobTypeExists, normalizeJobTypeName } from "@/types/jobType";
import { clients as defaultClients } from "@/data/clients";
import { jobTypes as defaultJobTypes } from "@/data/jobTypes";
import { materials as defaultMaterials } from "@/data/materials";
import { orders as defaultOrders } from "@/data/orders";
import { requestedByOptions as defaultRequestedBy } from "@/data/requestedBy";
import {
  PRIORITIES,
  PRODUCTION_STAGES,
  type JobOrder,
  type OrderFilters,
  type OrderFormValues,
  type OrderHistoryItem,
  type OrderStatus,
  type Priority,
  type ProductionStage,
} from "@/types/order";

export const ORDERS_STORAGE_KEY = "productionFlowJobs";
export const HISTORY_STORAGE_KEY = "productionFlowHistory";
export const CLIENTS_STORAGE_KEY = "productionFlowClients";
export const JOB_TYPES_STORAGE_KEY = "productionFlowJobTypes";
export const MATERIALS_STORAGE_KEY = "productionFlowResources";
export const REQUESTED_BY_STORAGE_KEY = "productionFlowRequestedBy";
export const VIEW_MODE_STORAGE_KEY = "productionFlowViewMode";

const LEGACY_STORAGE_KEYS = {
  orders: "job-tracker-orders",
  history: "job-tracker-history",
  clients: "job-tracker-clients",
  jobTypes: "job-tracker-job-types",
  materials: "job-tracker-materials",
  requestedBy: "job-tracker-requested-by",
} as const;

const ALL_STORAGE_KEYS = [
  ORDERS_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  CLIENTS_STORAGE_KEY,
  JOB_TYPES_STORAGE_KEY,
  MATERIALS_STORAGE_KEY,
  REQUESTED_BY_STORAGE_KEY,
  LEGACY_STORAGE_KEYS.orders,
  LEGACY_STORAGE_KEYS.history,
  LEGACY_STORAGE_KEYS.clients,
  LEGACY_STORAGE_KEYS.jobTypes,
  LEGACY_STORAGE_KEYS.materials,
  LEGACY_STORAGE_KEYS.requestedBy,
] as const;

export const DEFAULT_FILTERS: OrderFilters = {
  search: "",
  client: "",
  jobType: "",
  productionStage: "",
  priority: "",
  material: "",
};

export type ViewMode = "board" | "list";

type LegacyOrder = Partial<JobOrder> & {
  service?: string;
};

export function createHistoryItem(
  orderId: string,
  action: string,
  oldValue?: string,
  newValue?: string
): OrderHistoryItem {
  return {
    id: `${orderId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId,
    action,
    oldValue,
    newValue,
    createdAt: new Date().toISOString(),
  };
}

function containsLegacyDemoContent(value: unknown) {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.some((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const candidate = item as Record<string, unknown>;
    const looksLikeJobRecord =
      "status" in candidate ||
      "jobType" in candidate ||
      "productionStage" in candidate ||
      "due" in candidate ||
      "title" in candidate;

    if (!looksLikeJobRecord) {
      return false;
    }

    const hasLegacyId =
      typeof candidate.id === "string" &&
      candidate.id.trim().length > 0 &&
      !candidate.id.trim().startsWith("JOB-");
    const hasLegacyStatus = candidate.status === "Order";
    const hasLegacyStage =
      typeof candidate.productionStage === "string"
        ? !PRODUCTION_STAGES.includes(candidate.productionStage as ProductionStage)
        : false;

    return hasLegacyId || hasLegacyStatus || hasLegacyStage;
  });
}

function removeStorageKeys(keys: readonly string[]) {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
}

function seedProductionFlowStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(defaultOrders));
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
  window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(defaultClients));
  window.localStorage.setItem(JOB_TYPES_STORAGE_KEY, JSON.stringify(defaultJobTypes));
  window.localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(defaultMaterials));
  window.localStorage.setItem(
    REQUESTED_BY_STORAGE_KEY,
    JSON.stringify(defaultRequestedBy)
  );
}

function resetToProductionFlowDemoData() {
  removeStorageKeys(ALL_STORAGE_KEYS);
  seedProductionFlowStorage();
}

export function translateLegacyStage(value?: string): ProductionStage {
  if (!value) {
    return "Artwork";
  }

  const normalizedValue = value.trim().toLowerCase();
  const mappedStages: Record<string, ProductionStage> = {
    artwork: "Artwork",
    printing: "Printing",
    impressao: "Printing",
    cutting: "Production",
    corte: "Production",
    lamination: "Production",
    laminacao: "Production",
    production: "Production",
    review: "Review",
    approval: "Approval",
    installation: "Installation",
    ready: "Production",
    finished: "Production",
    "ready / finished": "Production",
  };

  return mappedStages[normalizedValue] ?? "Artwork";
}

function resolvePriority(value?: string): Priority {
  if (value && PRIORITIES.includes(value as Priority)) {
    return value as Priority;
  }

  return "Normal";
}

function resolveStatus(value?: string): OrderStatus {
  if (
    value === "New" ||
    value === "In Progress" ||
    value === "Waiting" ||
    value === "Done"
  ) {
    return value;
  }

  if (value === "Order") {
    return "New";
  }

  return "New";
}

function resolveJobType(value?: string) {
  if (!value?.trim()) {
    return "Other";
  }

  return value.trim();
}

function resolveText(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizeJobId(value?: string) {
  const normalizedValue = resolveText(value);

  if (!normalizedValue) {
    return "";
  }

  const numericMatch = normalizedValue.match(/(\d+)/);

  if (numericMatch) {
    return `JOB-${numericMatch[1].padStart(3, "0")}`;
  }

  return normalizedValue.toUpperCase().startsWith("JOB-")
    ? normalizedValue.toUpperCase()
    : `JOB-${normalizedValue.replace(/[^A-Za-z0-9]+/g, "").slice(0, 3).padStart(3, "0")}`;
}

function migrateOrder(order: LegacyOrder, fallbackCreatedAt: string): JobOrder {
  const status = resolveStatus(order.status);
  const productionStage = translateLegacyStage(
    order.productionStage ?? order.service
  );
  const waitingReason = resolveText(order.waitingReason);
  const createdAt = resolveText(order.createdAt) || fallbackCreatedAt;
  const updatedAt = resolveText(order.updatedAt) || createdAt;
  const completedAt =
    status === "Done"
      ? resolveText(order.completedAt) || updatedAt
      : null;

  return {
    id:
      normalizeJobId(order.id) ||
      `JOB-${Math.random().toString(36).replace(/[^0-9]+/g, "").slice(0, 3).padStart(3, "0")}`,
    title: resolveText(order.title) || "Untitled Job",
    client: resolveText(order.client) || "General",
    jobType: resolveJobType(order.jobType),
    productionStage:
      PRODUCTION_STAGES.includes(productionStage) ? productionStage : "Artwork",
    status,
    priority: resolvePriority(order.priority),
    due: resolveText(order.due) || "Pending",
    vehicleItem: resolveText(order.vehicleItem) || undefined,
    material: resolveText(order.material) || undefined,
    quantity: resolveText(order.quantity) || undefined,
    printQuantity: resolveText(order.printQuantity) || undefined,
    cutQuantity: resolveText(order.cutQuantity) || undefined,
    laminationQuantity: resolveText(order.laminationQuantity) || undefined,
    requestedBy: resolveText(order.requestedBy) || undefined,
    waitingReason:
      status === "Waiting" ? waitingReason || "Waiting Information" : undefined,
    fileLink: resolveText(order.fileLink) || undefined,
    artworkLink: resolveText(order.artworkLink) || undefined,
    productionFileLink: resolveText(order.productionFileLink) || undefined,
    notes: resolveText(order.notes) || undefined,
    referenceImage: resolveText(order.referenceImage) || undefined,
    referenceImageName: resolveText(order.referenceImageName) || undefined,
    createdAt,
    updatedAt,
    completedAt,
  };
}

export function migrateOrders(rawOrders: unknown) {
  if (!Array.isArray(rawOrders)) {
    return defaultOrders;
  }

  const fallbackCreatedAt = new Date().toISOString();
  const migratedOrders = rawOrders.map((order) =>
    migrateOrder(order as LegacyOrder, fallbackCreatedAt)
  );

  return migratedOrders.length > 0 ? migratedOrders : defaultOrders;
}

function readJsonValue<T>(storageKey: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

function readCurrentOrLegacyValue<T>(
  currentKey: string,
  legacyKey: string
): T | null {
  const currentValue = readJsonValue<T>(currentKey);

  if (currentValue) {
    return currentValue;
  }

  return readJsonValue<T>(legacyKey);
}

function mergeClientsWithOrders(options: Client[], jobOrders: JobOrder[]) {
  const mergedClients = [...options];

  for (const order of jobOrders) {
    if (order.client && !clientExists(order.client, mergedClients)) {
      mergedClients.push({
        id: `client-${normalizeClientName(order.client).replace(/[^a-z0-9]+/g, "-")}`,
        name: order.client,
        active: true,
      });
    }
  }

  return mergedClients;
}

function mergeJobTypesWithOrders(options: JobTypeOption[], jobOrders: JobOrder[]) {
  const mergedJobTypes = [...options];

  for (const order of jobOrders) {
    if (order.jobType && !jobTypeExists(order.jobType, mergedJobTypes)) {
      mergedJobTypes.push({
        id: `job-type-${normalizeJobTypeName(order.jobType).replace(/[^a-z0-9]+/g, "-")}`,
        name: order.jobType,
        active: true,
      });
    }
  }

  return mergedJobTypes;
}

function mergeCatalogWithOrders(
  options: CatalogOption[],
  jobOrders: JobOrder[],
  getter: (order: JobOrder) => string | undefined,
  prefix: string
) {
  const mergedOptions = [...options];

  for (const order of jobOrders) {
    const value = getter(order)?.trim();

    if (value && !catalogOptionExists(value, mergedOptions)) {
      mergedOptions.push({
        id: `${prefix}-${normalizeCatalogName(value).replace(/[^a-z0-9]+/g, "-")}`,
        name: value,
        active: true,
      });
    }
  }

  return mergedOptions;
}

export function readStoredOrders() {
  const rawOrders = readCurrentOrLegacyValue<unknown>(
    ORDERS_STORAGE_KEY,
    LEGACY_STORAGE_KEYS.orders
  );

  if (!rawOrders) {
    seedProductionFlowStorage();
    return defaultOrders;
  }

  if (containsLegacyDemoContent(rawOrders)) {
    resetToProductionFlowDemoData();
    return defaultOrders;
  }

  const migratedOrders = migrateOrders(rawOrders);
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(migratedOrders));
  window.localStorage.removeItem(LEGACY_STORAGE_KEYS.orders);
  return migratedOrders;
}

export function readStoredHistory() {
  const history = readCurrentOrLegacyValue<OrderHistoryItem[]>(
    HISTORY_STORAGE_KEY,
    LEGACY_STORAGE_KEYS.history
  );

  if (history && !containsLegacyDemoContent(history)) {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    window.localStorage.removeItem(LEGACY_STORAGE_KEYS.history);
    return history;
  }

  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]));
  return [];
}

export function readStoredClients(jobOrders: JobOrder[]) {
  const storedClients = readCurrentOrLegacyValue<Client[]>(
    CLIENTS_STORAGE_KEY,
    LEGACY_STORAGE_KEYS.clients
  );
  const safeClients =
    storedClients?.length && !containsLegacyDemoContent(storedClients)
      ? storedClients
      : defaultClients;
  const mergedClients = mergeClientsWithOrders(safeClients, jobOrders);

  window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(mergedClients));
  window.localStorage.removeItem(LEGACY_STORAGE_KEYS.clients);
  return mergedClients;
}

export function readStoredJobTypes(jobOrders: JobOrder[]) {
  const storedJobTypes = readCurrentOrLegacyValue<JobTypeOption[]>(
    JOB_TYPES_STORAGE_KEY,
    LEGACY_STORAGE_KEYS.jobTypes
  );
  const safeJobTypes =
    storedJobTypes?.length && !containsLegacyDemoContent(storedJobTypes)
      ? storedJobTypes
      : defaultJobTypes;
  const mergedJobTypes = mergeJobTypesWithOrders(safeJobTypes, jobOrders);

  window.localStorage.setItem(
    JOB_TYPES_STORAGE_KEY,
    JSON.stringify(mergedJobTypes)
  );
  window.localStorage.removeItem(LEGACY_STORAGE_KEYS.jobTypes);
  return mergedJobTypes;
}

export function readStoredMaterials(jobOrders: JobOrder[]) {
  const storedMaterials = readCurrentOrLegacyValue<CatalogOption[]>(
    MATERIALS_STORAGE_KEY,
    LEGACY_STORAGE_KEYS.materials
  );
  const safeMaterials =
    storedMaterials?.length && !containsLegacyDemoContent(storedMaterials)
      ? storedMaterials
      : defaultMaterials;
  const mergedMaterials = mergeCatalogWithOrders(
    safeMaterials,
    jobOrders,
    (order) => order.material,
    "resource"
  );

  window.localStorage.setItem(
    MATERIALS_STORAGE_KEY,
    JSON.stringify(mergedMaterials)
  );
  window.localStorage.removeItem(LEGACY_STORAGE_KEYS.materials);
  return mergedMaterials;
}

export function readStoredRequestedBy(jobOrders: JobOrder[]) {
  const storedRequestedBy = readCurrentOrLegacyValue<CatalogOption[]>(
    REQUESTED_BY_STORAGE_KEY,
    LEGACY_STORAGE_KEYS.requestedBy
  );
  const safeRequestedBy =
    storedRequestedBy?.length && !containsLegacyDemoContent(storedRequestedBy)
      ? storedRequestedBy
      : defaultRequestedBy;
  const mergedRequestedBy = mergeCatalogWithOrders(
    safeRequestedBy,
    jobOrders,
    (order) => order.requestedBy,
    "requested-by"
  );

  window.localStorage.setItem(
    REQUESTED_BY_STORAGE_KEY,
    JSON.stringify(mergedRequestedBy)
  );
  window.localStorage.removeItem(LEGACY_STORAGE_KEYS.requestedBy);
  return mergedRequestedBy;
}

export function buildOrderFormValues(order?: JobOrder): OrderFormValues {
  return {
    title: order?.title ?? "",
    client: order?.client ?? "",
    jobType: order?.jobType ?? "Design",
    productionStage: order?.productionStage ?? "Artwork",
    status: order?.status ?? "New",
    priority: order?.priority ?? "Normal",
    due: order?.due ?? "",
    vehicleItem: order?.vehicleItem ?? "",
    material: order?.material ?? "",
    quantity: order?.quantity ?? "",
    printQuantity: order?.printQuantity ?? "",
    cutQuantity: order?.cutQuantity ?? "",
    laminationQuantity: order?.laminationQuantity ?? "",
    requestedBy: order?.requestedBy ?? "",
    waitingReason: order?.waitingReason ?? "",
    fileLink: order?.fileLink ?? "",
    artworkLink: order?.artworkLink ?? "",
    productionFileLink: order?.productionFileLink ?? "",
    notes: order?.notes ?? "",
    referenceImage: order?.referenceImage ?? "",
    referenceImageName: order?.referenceImageName ?? "",
    referenceImageUrl:
      order?.referenceImage && !order.referenceImage.startsWith("data:image/")
        ? order.referenceImage
        : "",
  };
}

export function getNextOrderId(jobOrders: JobOrder[]) {
  const maxNumericId = jobOrders.reduce((currentMax, order) => {
    const numericPart = Number.parseInt(order.id.replace("JOB-", ""), 10);

    if (Number.isNaN(numericPart)) {
      return currentMax;
    }

    return Math.max(currentMax, numericPart);
  }, 0);

  return `JOB-${String(maxNumericId + 1).padStart(3, "0")}`;
}

export function sanitizeFormValues(values: OrderFormValues) {
  return {
    ...values,
    title: values.title.trim(),
    client: values.client.trim(),
    jobType: values.jobType.trim(),
    due: values.due.trim(),
    vehicleItem: values.vehicleItem.trim(),
    material: values.material.trim(),
    quantity: values.quantity.trim(),
    printQuantity: values.printQuantity.trim(),
    cutQuantity: values.cutQuantity.trim(),
    laminationQuantity: values.laminationQuantity.trim(),
    requestedBy: values.requestedBy.trim(),
    waitingReason: values.waitingReason.trim(),
    fileLink: values.fileLink.trim(),
    artworkLink: values.artworkLink.trim(),
    productionFileLink: values.productionFileLink.trim(),
    notes: values.notes.trim(),
    referenceImage: values.referenceImage.trim(),
    referenceImageName: values.referenceImageName.trim(),
    referenceImageUrl: values.referenceImageUrl.trim(),
  };
}

export function buildOrderFromForm(
  values: OrderFormValues,
  existingOrder?: JobOrder
): JobOrder {
  const now = new Date().toISOString();
  const sanitizedValues = sanitizeFormValues(values);
  const referenceImage =
    sanitizedValues.referenceImage || sanitizedValues.referenceImageUrl || "";

  const nextStatus = sanitizedValues.status;
  const nextCompletedAt =
    nextStatus === "Done"
      ? existingOrder?.completedAt ?? now
      : null;

  return {
    id: existingOrder?.id ?? "",
    title: sanitizedValues.title,
    client: sanitizedValues.client,
    jobType: sanitizedValues.jobType,
    productionStage: sanitizedValues.productionStage,
    status: nextStatus,
    priority: sanitizedValues.priority,
    due: sanitizedValues.due,
    vehicleItem: sanitizedValues.vehicleItem || undefined,
    material: sanitizedValues.material || undefined,
    quantity: sanitizedValues.quantity || undefined,
    printQuantity: sanitizedValues.printQuantity || undefined,
    cutQuantity: sanitizedValues.cutQuantity || undefined,
    laminationQuantity: sanitizedValues.laminationQuantity || undefined,
    requestedBy: sanitizedValues.requestedBy || undefined,
    waitingReason:
      nextStatus === "Waiting"
        ? sanitizedValues.waitingReason || undefined
        : undefined,
    fileLink: sanitizedValues.fileLink || undefined,
    artworkLink: sanitizedValues.artworkLink || undefined,
    productionFileLink: sanitizedValues.productionFileLink || undefined,
    notes: sanitizedValues.notes || undefined,
    referenceImage: referenceImage || undefined,
    referenceImageName:
      referenceImage && sanitizedValues.referenceImageName
        ? sanitizedValues.referenceImageName
        : referenceImage
          ? "External image URL"
          : undefined,
    createdAt: existingOrder?.createdAt ?? now,
    updatedAt: now,
    completedAt: nextCompletedAt,
  };
}

export function buildBackupFilename() {
  return "production-flow-backup.json";
}

export function formatHistoryEvent(item: OrderHistoryItem) {
  if (item.oldValue && item.newValue) {
    return `${item.action} from ${item.oldValue} to ${item.newValue}`;
  }

  if (item.newValue) {
    return `${item.action}: ${item.newValue}`;
  }

  return item.action;
}

export function formatActivityEvent(item: OrderHistoryItem) {
  if (item.oldValue && item.newValue) {
    return `${item.orderId} | ${item.action}: ${item.oldValue} -> ${item.newValue}`;
  }

  if (item.newValue) {
    return `${item.orderId} | ${item.action}: ${item.newValue}`;
  }

  return `${item.orderId} | ${item.action}`;
}

export function filterOrders(orders: JobOrder[], filters: OrderFilters) {
  const search = filters.search.trim().toLowerCase();

  return orders.filter((order) => {
    if (filters.client && order.client !== filters.client) {
      return false;
    }

    if (filters.jobType && order.jobType !== filters.jobType) {
      return false;
    }

    if (
      filters.productionStage &&
      order.productionStage !== filters.productionStage
    ) {
      return false;
    }

    if (filters.priority && order.priority !== filters.priority) {
      return false;
    }

    if (filters.material && (order.material ?? "") !== filters.material) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchableValues = [
      order.id,
      order.title,
      order.client,
      order.vehicleItem,
      order.jobType,
      order.status,
      order.productionStage,
      order.material,
      order.requestedBy,
      order.notes,
    ];

    return searchableValues.some((value) =>
      value?.toLowerCase().includes(search)
    );
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCompactTimestamp(value: string) {
  const date = new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-IE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
  });
}

export function readStoredViewMode(): ViewMode {
  if (typeof window === "undefined") {
    return "board";
  }

  const storedValue = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return storedValue === "list" ? "list" : "board";
}
