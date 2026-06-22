"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { clients as defaultClients } from "@/data/clients";
import { jobTypes as defaultJobTypes } from "@/data/jobTypes";
import { materials as defaultMaterials } from "@/data/materials";
import { orders as defaultOrders } from "@/data/orders";
import { priorities as defaultPriorities } from "@/data/priorities";
import { productionStages as defaultProductionStages } from "@/data/productionStages";
import { requestedByOptions as defaultRequestedBy } from "@/data/requestedBy";
import { statuses as defaultStatuses } from "@/data/statuses";
import { waitingReasons as defaultWaitingReasons } from "@/data/waitingReasons";
import type { CatalogOption } from "@/types/catalog";
import { normalizeCatalogName } from "@/types/catalog";
import type { Client } from "@/types/client";
import { clientExists, normalizeClientName } from "@/types/client";
import type { JobTypeOption } from "@/types/jobType";
import type {
  JobOrder,
  OrderFormValues,
  OrderHistoryItem,
  OrderStatus,
  PriorityOption,
  StatusOption,
} from "@/types/order";
import {
  buildBackupFilename,
  buildOrderFormValues,
  buildOrderFromForm,
  CLIENTS_STORAGE_KEY,
  createHistoryItem,
  getNextOrderId,
  HISTORY_STORAGE_KEY,
  JOB_TYPES_STORAGE_KEY,
  MATERIALS_STORAGE_KEY,
  ORDERS_STORAGE_KEY,
  readStoredClients,
  readStoredHistory,
  readStoredJobTypes,
  readStoredMaterials,
  readStoredOrders,
  readStoredRequestedBy,
  REQUESTED_BY_STORAGE_KEY,
} from "@/lib/productionTracker";
import { fetchProductionFlowData } from "@/lib/supabaseData";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type ModalMode = "create" | "edit";

type SaveResult<T> = Promise<{ item?: T; error?: string }>;

type ProductionTrackerContextValue = {
  orders: JobOrder[];
  allOrders: JobOrder[];
  archivedOrders: JobOrder[];
  history: OrderHistoryItem[];
  clients: Client[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  jobTypes: JobTypeOption[];
  productionStages: CatalogOption[];
  materials: CatalogOption[];
  waitingReasons: CatalogOption[];
  requestedByOptions: CatalogOption[];
  latestActivity: OrderHistoryItem[];
  selectedOrder: JobOrder | null;
  selectedOrderHistory: OrderHistoryItem[];
  isFormOpen: boolean;
  formMode: ModalMode;
  formInitialValues: OrderFormValues;
  editingOrderId?: string;
  formMessage: string;
  isReady: boolean;
  isUsingSupabase: boolean;
  dataError: string;
  openCreateModal: () => void;
  openEditModal: (order: JobOrder, overrides?: Partial<OrderFormValues>) => void;
  openDetailsModal: (order: JobOrder) => void;
  closeFormModal: () => void;
  closeDetailsModal: () => void;
  submitOrder: (values: OrderFormValues) => Promise<void>;
  requestStatusChange: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  archiveOrder: (orderId: string) => Promise<void>;
  restoreOrder: (orderId: string) => Promise<void>;
  addClient: (name: string) => Promise<{ clientName?: string; error?: string }>;
  addJobType: (name: string) => Promise<{ jobTypeName?: string; error?: string }>;
  addMaterial: (name: string) => Promise<{ materialName?: string; error?: string }>;
  addRequestedBy: (name: string) => Promise<{ requestedByName?: string; error?: string }>;
  saveClientRecord: (input: Partial<Client> & { id?: string; name: string }) => SaveResult<Client>;
  saveStatusRecord: (
    input: Partial<StatusOption> & { id?: string; name: string; slug?: string }
  ) => SaveResult<StatusOption>;
  savePriorityRecord: (
    input: Partial<PriorityOption> & { id?: string; name: string }
  ) => SaveResult<PriorityOption>;
  saveJobTypeRecord: (
    input: Partial<JobTypeOption> & { id?: string; name: string }
  ) => SaveResult<JobTypeOption>;
  saveProductionStageRecord: (
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) => SaveResult<CatalogOption>;
  saveMaterialRecord: (
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) => SaveResult<CatalogOption>;
  saveWaitingReasonRecord: (
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) => SaveResult<CatalogOption>;
  saveRequesterRecord: (
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) => SaveResult<CatalogOption>;
  setClientActive: (id: string, nextActive: boolean) => Promise<void>;
  setStatusActive: (id: string, nextActive: boolean) => Promise<void>;
  setPriorityActive: (id: string, nextActive: boolean) => Promise<void>;
  setJobTypeActive: (id: string, nextActive: boolean) => Promise<void>;
  setProductionStageActive: (id: string, nextActive: boolean) => Promise<void>;
  setMaterialActive: (id: string, nextActive: boolean) => Promise<void>;
  setWaitingReasonActive: (id: string, nextActive: boolean) => Promise<void>;
  setRequesterActive: (id: string, nextActive: boolean) => Promise<void>;
  exportBackup: () => void;
};

const ProductionTrackerContext =
  createContext<ProductionTrackerContextValue | null>(null);

function buildOptionId(prefix: string, value: string) {
  return `${prefix}-${value.replace(/[^a-z0-9]+/g, "-")}`;
}

function buildReferenceHistory(
  orderId: string,
  previousOrder?: JobOrder,
  nextOrder?: JobOrder
) {
  const previousImage = previousOrder?.referenceImage ?? "";
  const nextImage = nextOrder?.referenceImage ?? "";

  if (!previousImage && nextImage) {
    return createHistoryItem(orderId, "Attachment added");
  }

  if (previousImage && !nextImage) {
    return createHistoryItem(orderId, "Attachment removed");
  }

  if (previousImage && nextImage && previousImage !== nextImage) {
    return createHistoryItem(orderId, "Attachment updated");
  }

  return null;
}

function sortCatalog<T extends { name: string; sortOrder?: number; active: boolean }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftActive = left.active ? 0 : 1;
    const rightActive = right.active ? 0 : 1;

    if (leftActive !== rightActive) {
      return leftActive - rightActive;
    }

    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name);
  });
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFallbackTrackerData() {
  const hydratedOrders = readStoredOrders();

  return {
    jobs: hydratedOrders,
    history: readStoredHistory(),
    clients: readStoredClients(hydratedOrders),
    statuses: defaultStatuses,
    priorities: defaultPriorities,
    jobTypes: readStoredJobTypes(hydratedOrders),
    productionStages: defaultProductionStages,
    materials: readStoredMaterials(hydratedOrders),
    waitingReasons: defaultWaitingReasons,
    requesters: readStoredRequestedBy(hydratedOrders),
  };
}

export function ProductionTrackerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [allOrders, setAllOrders] = useState<JobOrder[]>(defaultOrders);
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);
  const [clients, setClients] = useState<Client[]>(defaultClients);
  const [statuses, setStatuses] = useState<StatusOption[]>(defaultStatuses);
  const [priorities, setPriorities] = useState<PriorityOption[]>(defaultPriorities);
  const [jobTypes, setJobTypes] = useState<JobTypeOption[]>(defaultJobTypes);
  const [productionStages, setProductionStages] =
    useState<CatalogOption[]>(defaultProductionStages);
  const [materials, setMaterials] = useState<CatalogOption[]>(defaultMaterials);
  const [waitingReasons, setWaitingReasons] =
    useState<CatalogOption[]>(defaultWaitingReasons);
  const [requestedByOptions, setRequestedByOptions] =
    useState<CatalogOption[]>(defaultRequestedBy);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<ModalMode>("create");
  const [editingOrderId, setEditingOrderId] = useState<string>();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<OrderFormValues>(
    buildOrderFormValues()
  );
  const [formMessage, setFormMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isUsingSupabase, setIsUsingSupabase] = useState(false);
  const [dataError, setDataError] = useState("");

  const orders = useMemo(
    () => allOrders.filter((order) => !order.archivedAt),
    [allOrders]
  );
  const archivedOrders = useMemo(
    () => allOrders.filter((order) => !!order.archivedAt),
    [allOrders]
  );

  async function refreshFromSupabase() {
    const data = await fetchProductionFlowData();

    setAllOrders(data.jobs);
    setClients(sortCatalog(data.clients));
    setStatuses(sortCatalog(data.statuses));
    setPriorities(sortCatalog(data.priorities));
    setJobTypes(sortCatalog(data.jobTypes));
    setProductionStages(sortCatalog(data.productionStages));
    setMaterials(sortCatalog(data.resources));
    setWaitingReasons(sortCatalog(data.waitingReasons));
    setRequestedByOptions(sortCatalog(data.requesters));
  }

  function hydrateFallbackData() {
    const fallback = getFallbackTrackerData();

    setAllOrders(fallback.jobs);
    setHistory(fallback.history);
    setClients(sortCatalog(fallback.clients));
    setStatuses(sortCatalog(fallback.statuses));
    setPriorities(sortCatalog(fallback.priorities));
    setJobTypes(sortCatalog(fallback.jobTypes));
    setProductionStages(sortCatalog(fallback.productionStages));
    setMaterials(sortCatalog(fallback.materials));
    setWaitingReasons(sortCatalog(fallback.waitingReasons));
    setRequestedByOptions(sortCatalog(fallback.requesters));
  }

  useEffect(() => {
    const frameId = window.requestAnimationFrame(async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          await refreshFromSupabase();
          setIsUsingSupabase(true);
          setDataError("");
        } else {
          hydrateFallbackData();
          setIsUsingSupabase(false);
          setDataError("");
        }
      } catch {
        hydrateFallbackData();
        setIsUsingSupabase(false);
        setDataError(
          "Unable to connect to database. Check Supabase environment variables."
        );
      } finally {
        setIsReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isReady || isUsingSupabase) {
      return;
    }

    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
  }, [allOrders, isReady, isUsingSupabase]);

  useEffect(() => {
    if (!isReady || isUsingSupabase) {
      return;
    }

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history, isReady, isUsingSupabase]);

  useEffect(() => {
    if (!isReady || isUsingSupabase) {
      return;
    }

    window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    window.localStorage.setItem(JOB_TYPES_STORAGE_KEY, JSON.stringify(jobTypes));
    window.localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materials));
    window.localStorage.setItem(
      REQUESTED_BY_STORAGE_KEY,
      JSON.stringify(requestedByOptions)
    );
  }, [clients, isReady, isUsingSupabase, jobTypes, materials, requestedByOptions]);

  useEffect(() => {
    if (isUsingSupabase) {
      return;
    }

    function handleStorageChange(event: StorageEvent) {
      if (
        event.key &&
        ![
          ORDERS_STORAGE_KEY,
          HISTORY_STORAGE_KEY,
          CLIENTS_STORAGE_KEY,
          JOB_TYPES_STORAGE_KEY,
          MATERIALS_STORAGE_KEY,
          REQUESTED_BY_STORAGE_KEY,
        ].includes(event.key)
      ) {
        return;
      }

      hydrateFallbackData();
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isUsingSupabase]);

  const selectedOrder =
    allOrders.find((order) => order.id === selectedOrderId) ?? null;

  const selectedOrderHistory = history
    .filter((item) => item.orderId === selectedOrderId)
    .slice(0, 20);

  const latestActivity = history.slice(0, 12);
  const boardStatuses = statuses
    .filter((status) => status.active && status.isBoardColumn)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  function prependHistoryItems(items: OrderHistoryItem[]) {
    if (items.length === 0) {
      return;
    }

    setHistory((current) => [...items, ...current]);
  }

  function openCreateModal() {
    setSelectedOrderId(null);
    setFormMode("create");
    setEditingOrderId(undefined);
    setFormInitialValues(buildOrderFormValues());
    setFormMessage("");
    setIsFormOpen(true);
  }

  function openEditModal(order: JobOrder, overrides?: Partial<OrderFormValues>) {
    setSelectedOrderId(null);
    setFormMode("edit");
    setEditingOrderId(order.id);
    setFormInitialValues({
      ...buildOrderFormValues(order),
      ...overrides,
    });
    setFormMessage("");
    setIsFormOpen(true);
  }

  function openDetailsModal(order: JobOrder) {
    setSelectedOrderId(order.id);
  }

  function closeFormModal() {
    setIsFormOpen(false);
    setEditingOrderId(undefined);
    setFormInitialValues(buildOrderFormValues());
    setFormMessage("");
  }

  function closeDetailsModal() {
    setSelectedOrderId(null);
  }

  function findStatusByName(name: string) {
    return statuses.find((status) => status.name === name);
  }

  function findPriorityByName(name: string) {
    return priorities.find((priority) => priority.name === name);
  }

  function findJobTypeByName(name: string) {
    return jobTypes.find((jobType) => jobType.name === name);
  }

  function findProductionStageByName(name: string) {
    return productionStages.find((stage) => stage.name === name);
  }

  function findResourceByName(name?: string) {
    return materials.find((material) => material.name === name);
  }

  function findWaitingReasonByName(name?: string) {
    return waitingReasons.find((reason) => reason.name === name);
  }

  function findRequesterByName(name?: string) {
    return requestedByOptions.find((requester) => requester.name === name);
  }

  function findClientByName(name: string) {
    return clients.find((client) => client.name === name);
  }

  async function getNextSupabaseJobNumber() {
    if (!supabase) {
      return getNextOrderId(allOrders);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("job_number")
      .order("job_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const lastJobNumber = data?.job_number ?? "JOB-000";
    const nextValue = Number.parseInt(lastJobNumber.replace("JOB-", ""), 10) + 1;

    return `JOB-${String(nextValue).padStart(3, "0")}`;
  }

  async function addClient(name: string) {
    const result = await saveClientRecord({ name, active: true });
    return { clientName: result.item?.name, error: result.error };
  }

  async function addJobType(name: string) {
    const result = await saveJobTypeRecord({ name, active: true });
    return { jobTypeName: result.item?.name, error: result.error };
  }

  async function addMaterial(name: string) {
    const result = await saveMaterialRecord({ name, active: true });
    return { materialName: result.item?.name, error: result.error };
  }

  async function addRequestedBy(name: string) {
    const result = await saveRequesterRecord({ name, active: true });
    return { requestedByName: result.item?.name, error: result.error };
  }

  async function submitOrder(values: OrderFormValues) {
    const builtOrder = buildOrderFromForm(values, editingOrderId ? allOrders.find((order) => order.id === editingOrderId) : undefined);

    if (isUsingSupabase && supabase) {
      const status = findStatusByName(builtOrder.status);
      const priority = findPriorityByName(builtOrder.priority);
      const jobType = findJobTypeByName(builtOrder.jobType);
      const productionStage = findProductionStageByName(builtOrder.productionStage);
      const client = findClientByName(builtOrder.client);
      const material = findResourceByName(builtOrder.material);
      const waitingReason = findWaitingReasonByName(builtOrder.waitingReason);
      const requester = findRequesterByName(builtOrder.requestedBy);
      const now = new Date().toISOString();
      const jobNumber = formMode === "create" ? await getNextSupabaseJobNumber() : editingOrderId!;

      const payload = {
        job_number: jobNumber,
        title: builtOrder.title,
        client_id: client?.id ?? null,
        status_id: status?.id ?? null,
        priority_id: priority?.id ?? null,
        job_type_id: jobType?.id ?? null,
        production_stage_id: productionStage?.id ?? null,
        resource_id: material?.id ?? null,
        waiting_reason_id: waitingReason?.id ?? null,
        requester_id: requester?.id ?? null,
        due_text: builtOrder.due,
        vehicle_item: builtOrder.vehicleItem ?? null,
        quantity: builtOrder.quantity ?? null,
        print_quantity: builtOrder.printQuantity ?? null,
        cut_quantity: builtOrder.cutQuantity ?? null,
        lamination_quantity: builtOrder.laminationQuantity ?? null,
        file_link: builtOrder.fileLink ?? null,
        artwork_link: builtOrder.artworkLink ?? null,
        production_file_link: builtOrder.productionFileLink ?? null,
        notes: builtOrder.notes ?? null,
        reference_image: builtOrder.referenceImage ?? null,
        reference_image_name: builtOrder.referenceImageName ?? null,
        updated_at: now,
        completed_at: status?.isDone ? builtOrder.completedAt ?? now : null,
        archived_at: null,
      };

      if (formMode === "create") {
        const { error } = await supabase.from("jobs").insert({
          ...payload,
          created_at: now,
        });

        if (error) {
          setFormMessage("Unable to save job to Supabase.");
          return;
        }

        prependHistoryItems([createHistoryItem(jobNumber, "Job created")]);
      } else {
        const { error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("job_number", editingOrderId!);

        if (error) {
          setFormMessage("Unable to update job in Supabase.");
          return;
        }

        prependHistoryItems([createHistoryItem(editingOrderId!, "Job updated")]);
      }

      await refreshFromSupabase();
      closeFormModal();
      return;
    }

    if (formMode === "create") {
      const nextId = getNextOrderId(allOrders);
      const nextOrder = {
        ...builtOrder,
        id: nextId,
      };

      setAllOrders((current) => [nextOrder, ...current]);
      const nextHistoryItems = [createHistoryItem(nextId, "Job created")];
      const referenceHistory = buildReferenceHistory(nextId, undefined, nextOrder);

      if (referenceHistory) {
        nextHistoryItems.unshift(referenceHistory);
      }

      prependHistoryItems(nextHistoryItems);
      closeFormModal();
      return;
    }

    if (!editingOrderId) {
      return;
    }

    const existingOrder = allOrders.find((order) => order.id === editingOrderId);

    if (!existingOrder) {
      return;
    }

    const updatedOrder = {
      ...builtOrder,
      id: existingOrder.id,
      archivedAt: existingOrder.archivedAt,
    };

    setAllOrders((current) =>
      current.map((order) => (order.id === existingOrder.id ? updatedOrder : order))
    );
    prependHistoryItems([createHistoryItem(existingOrder.id, "Job updated")]);
    closeFormModal();
  }

  async function requestStatusChange(orderId: string, nextStatus: OrderStatus) {
    const existingOrder = allOrders.find((order) => order.id === orderId);

    if (!existingOrder || existingOrder.status === nextStatus) {
      return;
    }

    if (nextStatus === "Waiting" && !existingOrder.waitingReason?.trim()) {
      openEditModal(existingOrder, { status: "Waiting" });
      setFormMessage("Waiting reason is required before a job can be blocked.");
      return;
    }

    const nextStatusRecord = findStatusByName(nextStatus);
    const now = new Date().toISOString();

    if (isUsingSupabase && supabase) {
      const { error } = await supabase
        .from("jobs")
        .update({
          status_id: nextStatusRecord?.id ?? null,
          updated_at: now,
          completed_at: nextStatusRecord?.isDone ? existingOrder.completedAt ?? now : null,
        })
        .eq("job_number", orderId);

      if (error) {
        setDataError("Unable to update job status in Supabase.");
        return;
      }

      prependHistoryItems([
        createHistoryItem(orderId, "Status changed", existingOrder.status, nextStatus),
      ]);
      await refreshFromSupabase();
      return;
    }

    const updatedOrder: JobOrder = {
      ...existingOrder,
      status: nextStatus,
      completedAt: nextStatusRecord?.isDone ? existingOrder.completedAt ?? now : null,
      updatedAt: now,
    };

    setAllOrders((current) =>
      current.map((order) => (order.id === orderId ? updatedOrder : order))
    );
    prependHistoryItems([
      createHistoryItem(orderId, "Status changed", existingOrder.status, nextStatus),
    ]);
  }

  async function archiveOrder(orderId: string) {
    const now = new Date().toISOString();

    if (isUsingSupabase && supabase) {
      const { error } = await supabase
        .from("jobs")
        .update({ archived_at: now, updated_at: now })
        .eq("job_number", orderId);

      if (error) {
        setDataError("Unable to archive job in Supabase.");
        return;
      }

      await refreshFromSupabase();
      prependHistoryItems([createHistoryItem(orderId, "Job archived")]);
      return;
    }

    setAllOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, archivedAt: now, updatedAt: now } : order
      )
    );
    prependHistoryItems([createHistoryItem(orderId, "Job archived")]);
  }

  async function restoreOrder(orderId: string) {
    const now = new Date().toISOString();

    if (isUsingSupabase && supabase) {
      const { error } = await supabase
        .from("jobs")
        .update({ archived_at: null, updated_at: now })
        .eq("job_number", orderId);

      if (error) {
        setDataError("Unable to restore job in Supabase.");
        return;
      }

      await refreshFromSupabase();
      prependHistoryItems([createHistoryItem(orderId, "Job restored")]);
      return;
    }

    setAllOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, archivedAt: null, updatedAt: now } : order
      )
    );
    prependHistoryItems([createHistoryItem(orderId, "Job restored")]);
  }

  async function saveClientRecord(input: Partial<Client> & { id?: string; name: string }) {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      return { error: "Please enter a client name." };
    }

    if (isUsingSupabase && supabase) {
      const payload = {
        id: input.id,
        name: trimmedName,
        contact_name: input.contactName ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        notes: input.notes ?? null,
        sort_order: input.sortOrder ?? 0,
        is_active: input.active ?? true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("clients").upsert(payload);

      if (error) {
        return { error: error.message };
      }

      await refreshFromSupabase();
      return {
        item: clients.find((client) => client.name === trimmedName) ?? {
          id: input.id ?? buildOptionId("client", normalizeClientName(trimmedName)),
          name: trimmedName,
          contactName: input.contactName,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
          sortOrder: input.sortOrder,
          active: input.active ?? true,
        },
      };
    }

    if (!input.id && clientExists(trimmedName, clients)) {
      return { error: "That client already exists." };
    }

    const nextClient: Client = {
      id:
        input.id ??
        buildOptionId("client", normalizeClientName(trimmedName).replace(/[^a-z0-9]+/g, "-")),
      name: trimmedName,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      notes: input.notes,
      sortOrder: input.sortOrder,
      active: input.active ?? true,
    };

    setClients((current) =>
      sortCatalog(
        input.id
          ? current.map((client) => (client.id === input.id ? nextClient : client))
          : [...current, nextClient]
      )
    );
    return { item: nextClient };
  }

  async function upsertSimpleCatalog<T extends CatalogOption>(
    table: "job_types" | "production_stages" | "resources" | "waiting_reasons" | "requesters",
    currentItems: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    input: Partial<T> & { id?: string; name: string },
    prefix: string
  ): SaveResult<T> {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      return Promise.resolve({ error: "Please enter a name." });
    }

    if (isUsingSupabase && supabase) {
      const payload = {
        id: input.id,
        name: trimmedName,
        sort_order: input.sortOrder ?? 0,
        is_active: input.active ?? true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from(table).upsert(payload);

      if (error) {
        return { error: error.message };
      }

      await refreshFromSupabase();
    } else {
      const nextItem = {
        id: input.id ?? buildOptionId(prefix, normalizeCatalogName(trimmedName)),
        name: trimmedName,
        sortOrder: input.sortOrder,
        active: input.active ?? true,
      } as T;

      setItems((current) =>
        sortCatalog(
          input.id
            ? current.map((item) => (item.id === input.id ? nextItem : item))
            : [...current, nextItem]
        )
      );
    }

    const item =
      currentItems.find((entry) => entry.name === trimmedName) ??
      ({
        id: input.id ?? buildOptionId(prefix, normalizeCatalogName(trimmedName)),
        name: trimmedName,
        sortOrder: input.sortOrder,
        active: input.active ?? true,
      } as T);

    return { item };
  }

  async function saveStatusRecord(
    input: Partial<StatusOption> & { id?: string; name: string; slug?: string }
  ) {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      return { error: "Please enter a status name." };
    }

    const nextStatus: StatusOption = {
      id: input.id ?? buildOptionId("status", normalizeSlug(input.slug ?? trimmedName)),
      name: trimmedName,
      slug: normalizeSlug(input.slug ?? trimmedName),
      color: input.color ?? "#0f172a",
      sortOrder: input.sortOrder ?? statuses.length + 1,
      isBoardColumn: input.isBoardColumn ?? true,
      isDone: input.isDone ?? false,
      active: input.active ?? true,
    };

    if (isUsingSupabase && supabase) {
      const { error } = await supabase.from("statuses").upsert({
        id: input.id,
        name: nextStatus.name,
        slug: nextStatus.slug,
        color: nextStatus.color,
        sort_order: nextStatus.sortOrder,
        is_board_column: nextStatus.isBoardColumn,
        is_done: nextStatus.isDone,
        is_active: nextStatus.active,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { error: error.message };
      }

      await refreshFromSupabase();
      return { item: nextStatus };
    }

    setStatuses((current) =>
      sortCatalog(
        input.id
          ? current.map((status) => (status.id === input.id ? nextStatus : status))
          : [...current, nextStatus]
      )
    );
    return { item: nextStatus };
  }

  async function savePriorityRecord(
    input: Partial<PriorityOption> & { id?: string; name: string }
  ) {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      return { error: "Please enter a priority name." };
    }

    const nextPriority: PriorityOption = {
      id: input.id ?? buildOptionId("priority", normalizeCatalogName(trimmedName)),
      name: trimmedName,
      color: input.color ?? "#64748b",
      sortOrder: input.sortOrder ?? priorities.length + 1,
      active: input.active ?? true,
    };

    if (isUsingSupabase && supabase) {
      const { error } = await supabase.from("priorities").upsert({
        id: input.id,
        name: nextPriority.name,
        color: nextPriority.color,
        sort_order: nextPriority.sortOrder,
        is_active: nextPriority.active,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { error: error.message };
      }

      await refreshFromSupabase();
      return { item: nextPriority };
    }

    setPriorities((current) =>
      sortCatalog(
        input.id
          ? current.map((priority) =>
              priority.id === input.id ? nextPriority : priority
            )
          : [...current, nextPriority]
      )
    );
    return { item: nextPriority };
  }

  async function saveJobTypeRecord(
    input: Partial<JobTypeOption> & { id?: string; name: string }
  ) {
    return upsertSimpleCatalog(
      "job_types",
      jobTypes,
      setJobTypes,
      input,
      "job-type"
    );
  }

  async function saveProductionStageRecord(
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) {
    return upsertSimpleCatalog(
      "production_stages",
      productionStages,
      setProductionStages,
      input,
      "stage"
    );
  }

  async function saveMaterialRecord(
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) {
    return upsertSimpleCatalog("resources", materials, setMaterials, input, "resource");
  }

  async function saveWaitingReasonRecord(
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) {
    return upsertSimpleCatalog(
      "waiting_reasons",
      waitingReasons,
      setWaitingReasons,
      input,
      "waiting"
    );
  }

  async function saveRequesterRecord(
    input: Partial<CatalogOption> & { id?: string; name: string }
  ) {
    return upsertSimpleCatalog(
      "requesters",
      requestedByOptions,
      setRequestedByOptions,
      input,
      "requester"
    );
  }

  async function updateActiveState(
    table:
      | "clients"
      | "statuses"
      | "priorities"
      | "job_types"
      | "production_stages"
      | "resources"
      | "waiting_reasons"
      | "requesters",
    id: string,
    nextActive: boolean
  ) {
    if (isUsingSupabase && supabase) {
      const { error } = await supabase
        .from(table)
        .update({
          is_active: nextActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (!error) {
        await refreshFromSupabase();
      }

      return;
    }

    const applyToggle = <T extends { id: string; active: boolean }>(
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) =>
      setter((current) =>
        current.map((item) =>
          item.id === id ? { ...item, active: nextActive } : item
        )
      );

    switch (table) {
      case "clients":
        applyToggle(setClients);
        break;
      case "statuses":
        applyToggle(setStatuses);
        break;
      case "priorities":
        applyToggle(setPriorities);
        break;
      case "job_types":
        applyToggle(setJobTypes);
        break;
      case "production_stages":
        applyToggle(setProductionStages);
        break;
      case "resources":
        applyToggle(setMaterials);
        break;
      case "waiting_reasons":
        applyToggle(setWaitingReasons);
        break;
      case "requesters":
        applyToggle(setRequestedByOptions);
        break;
    }
  }

  function exportBackup() {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: isUsingSupabase ? "supabase" : "local-fallback",
      jobs: allOrders,
      clients,
      statuses,
      priorities,
      jobTypes,
      productionStages,
      resources: materials,
      waitingReasons,
      requesters: requestedByOptions,
      history,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildBackupFilename();
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ProductionTrackerContext.Provider
      value={{
        orders,
        allOrders,
        archivedOrders,
        history,
        clients,
        statuses: boardStatuses.length > 0 ? statuses : defaultStatuses,
        priorities,
        jobTypes,
        productionStages,
        materials,
        waitingReasons,
        requestedByOptions,
        latestActivity,
        selectedOrder,
        selectedOrderHistory,
        isFormOpen,
        formMode,
        formInitialValues,
        editingOrderId,
        formMessage,
        isReady,
        isUsingSupabase,
        dataError,
        openCreateModal,
        openEditModal,
        openDetailsModal,
        closeFormModal,
        closeDetailsModal,
        submitOrder,
        requestStatusChange,
        archiveOrder,
        restoreOrder,
        addClient,
        addJobType,
        addMaterial,
        addRequestedBy,
        saveClientRecord,
        saveStatusRecord,
        savePriorityRecord,
        saveJobTypeRecord,
        saveProductionStageRecord,
        saveMaterialRecord,
        saveWaitingReasonRecord,
        saveRequesterRecord,
        setClientActive: (id, nextActive) => updateActiveState("clients", id, nextActive),
        setStatusActive: (id, nextActive) => updateActiveState("statuses", id, nextActive),
        setPriorityActive: (id, nextActive) =>
          updateActiveState("priorities", id, nextActive),
        setJobTypeActive: (id, nextActive) =>
          updateActiveState("job_types", id, nextActive),
        setProductionStageActive: (id, nextActive) =>
          updateActiveState("production_stages", id, nextActive),
        setMaterialActive: (id, nextActive) =>
          updateActiveState("resources", id, nextActive),
        setWaitingReasonActive: (id, nextActive) =>
          updateActiveState("waiting_reasons", id, nextActive),
        setRequesterActive: (id, nextActive) =>
          updateActiveState("requesters", id, nextActive),
        exportBackup,
      }}
    >
      {children}
    </ProductionTrackerContext.Provider>
  );
}

export function useProductionTracker() {
  const context = useContext(ProductionTrackerContext);

  if (!context) {
    throw new Error(
      "useProductionTracker must be used within a ProductionTrackerProvider."
    );
  }

  return context;
}
