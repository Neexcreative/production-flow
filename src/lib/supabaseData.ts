import type { CatalogOption } from "@/types/catalog";
import type { Client } from "@/types/client";
import type { JobTypeOption } from "@/types/jobType";
import type {
  JobOrder,
  PriorityOption,
  StatusOption,
} from "@/types/order";

import { supabase } from "@/lib/supabaseClient";

type JobRow = {
  id: string;
  job_number: string;
  title: string;
  client_id: string | null;
  status_id: string | null;
  priority_id: string | null;
  job_type_id: string | null;
  production_stage_id: string | null;
  resource_id: string | null;
  waiting_reason_id: string | null;
  requester_id: string | null;
  due_text: string;
  vehicle_item: string | null;
  quantity: string | null;
  print_quantity: string | null;
  cut_quantity: string | null;
  lamination_quantity: string | null;
  file_link: string | null;
  artwork_link: string | null;
  production_file_link: string | null;
  notes: string | null;
  reference_image: string | null;
  reference_image_name: string | null;
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
};

type ClientRow = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number | null;
};

type StatusRow = {
  id: string;
  name: string;
  slug: string | null;
  color: string | null;
  sort_order: number | null;
  is_board_column: boolean;
  is_done: boolean;
  is_active: boolean;
};

type PriorityRow = {
  id: string;
  name: string;
  color: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type CatalogRow = {
  id: string;
  name: string;
  sort_order: number | null;
  is_active: boolean;
};

export type ProductionFlowSupabaseData = {
  jobs: JobOrder[];
  clients: Client[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  jobTypes: JobTypeOption[];
  productionStages: CatalogOption[];
  resources: CatalogOption[];
  waitingReasons: CatalogOption[];
  requesters: CatalogOption[];
};

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function sortByName<T extends { name: string; sortOrder?: number }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name);
  });
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    sortOrder: row.sort_order ?? undefined,
    active: row.is_active,
  };
}

function mapStatus(row: StatusRow): StatusOption {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? undefined,
    color: row.color ?? undefined,
    sortOrder: row.sort_order ?? 0,
    isBoardColumn: row.is_board_column,
    isDone: row.is_done,
    active: row.is_active,
  };
}

function mapPriority(row: PriorityRow): PriorityOption {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
    sortOrder: row.sort_order ?? 0,
    active: row.is_active,
  };
}

function mapCatalog(row: CatalogRow): CatalogOption {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
    active: row.is_active,
  };
}

function indexById<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function mapJobRow(
  row: JobRow,
  lookups: {
    clients: Map<string, Client>;
    statuses: Map<string, StatusOption>;
    priorities: Map<string, PriorityOption>;
    jobTypes: Map<string, JobTypeOption>;
    productionStages: Map<string, CatalogOption>;
    resources: Map<string, CatalogOption>;
    waitingReasons: Map<string, CatalogOption>;
    requesters: Map<string, CatalogOption>;
  }
): JobOrder {
  return {
    id: row.job_number,
    title: row.title,
    client: row.client_id ? lookups.clients.get(row.client_id)?.name ?? "General" : "General",
    jobType: row.job_type_id ? lookups.jobTypes.get(row.job_type_id)?.name ?? "Other" : "Other",
    productionStage:
      row.production_stage_id
        ? lookups.productionStages.get(row.production_stage_id)?.name ?? "Artwork"
        : "Artwork",
    status: row.status_id ? lookups.statuses.get(row.status_id)?.name ?? "New" : "New",
    priority: row.priority_id ? lookups.priorities.get(row.priority_id)?.name ?? "Normal" : "Normal",
    due: row.due_text,
    vehicleItem: row.vehicle_item ?? undefined,
    material: row.resource_id ? lookups.resources.get(row.resource_id)?.name ?? undefined : undefined,
    quantity: row.quantity ?? undefined,
    printQuantity: row.print_quantity ?? undefined,
    cutQuantity: row.cut_quantity ?? undefined,
    laminationQuantity: row.lamination_quantity ?? undefined,
    requestedBy:
      row.requester_id ? lookups.requesters.get(row.requester_id)?.name ?? undefined : undefined,
    waitingReason:
      row.waiting_reason_id
        ? lookups.waitingReasons.get(row.waiting_reason_id)?.name ?? undefined
        : undefined,
    fileLink: row.file_link ?? undefined,
    artworkLink: row.artwork_link ?? undefined,
    productionFileLink: row.production_file_link ?? undefined,
    notes: row.notes ?? undefined,
    referenceImage: row.reference_image ?? undefined,
    referenceImageName: row.reference_image_name ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
  };
}

export async function fetchProductionFlowData(): Promise<ProductionFlowSupabaseData> {
  const client = ensureSupabase();

  const [
    jobsResponse,
    clientsResponse,
    statusesResponse,
    prioritiesResponse,
    jobTypesResponse,
    productionStagesResponse,
    resourcesResponse,
    waitingReasonsResponse,
    requestersResponse,
  ] = await Promise.all([
    client.from("jobs").select("*").order("created_at", { ascending: false }),
    client.from("clients").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("statuses").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("priorities").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("job_types").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("production_stages").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("resources").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("waiting_reasons").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    client.from("requesters").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
  ]);

  const firstError = [
    jobsResponse.error,
    clientsResponse.error,
    statusesResponse.error,
    prioritiesResponse.error,
    jobTypesResponse.error,
    productionStagesResponse.error,
    resourcesResponse.error,
    waitingReasonsResponse.error,
    requestersResponse.error,
  ].find(Boolean);

  if (firstError) {
    throw firstError;
  }

  const clients = sortByName((clientsResponse.data as ClientRow[]).map(mapClient));
  const statuses = sortByName((statusesResponse.data as StatusRow[]).map(mapStatus));
  const priorities = sortByName((prioritiesResponse.data as PriorityRow[]).map(mapPriority));
  const jobTypes = sortByName((jobTypesResponse.data as CatalogRow[]).map(mapCatalog)).map(
    (item) => ({ ...item })
  ) as JobTypeOption[];
  const productionStages = sortByName(
    (productionStagesResponse.data as CatalogRow[]).map(mapCatalog)
  );
  const resources = sortByName((resourcesResponse.data as CatalogRow[]).map(mapCatalog));
  const waitingReasons = sortByName(
    (waitingReasonsResponse.data as CatalogRow[]).map(mapCatalog)
  );
  const requesters = sortByName((requestersResponse.data as CatalogRow[]).map(mapCatalog));

  const jobs = (jobsResponse.data as JobRow[]).map((row) =>
    mapJobRow(row, {
      clients: indexById(clients),
      statuses: indexById(statuses),
      priorities: indexById(priorities),
      jobTypes: indexById(jobTypes),
      productionStages: indexById(productionStages),
      resources: indexById(resources),
      waitingReasons: indexById(waitingReasons),
      requesters: indexById(requesters),
    })
  );

  return {
    jobs,
    clients,
    statuses,
    priorities,
    jobTypes,
    productionStages,
    resources,
    waitingReasons,
    requesters,
  };
}
