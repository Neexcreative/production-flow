export type CatalogOption = {
  id: string;
  name: string;
  sortOrder?: number;
  active: boolean;
};

export function normalizeCatalogName(name: string) {
  return name.trim().toLowerCase();
}

export function catalogOptionExists(name: string, options: CatalogOption[]) {
  const normalizedName = normalizeCatalogName(name);

  return options.some(
    (option) => normalizeCatalogName(option.name) === normalizedName
  );
}
