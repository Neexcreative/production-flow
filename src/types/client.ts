export type Client = {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
  sortOrder?: number;
  active: boolean;
};

export function normalizeClientName(name: string) {
  return name.trim().toLowerCase();
}

export function clientExists(name: string, clients: Client[]) {
  const normalizedName = normalizeClientName(name);

  return clients.some(
    (client) => normalizeClientName(client.name) === normalizedName
  );
}
