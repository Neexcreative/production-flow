export type JobTypeOption = {
  id: string;
  name: string;
  sortOrder?: number;
  active: boolean;
};

export function normalizeJobTypeName(name: string) {
  return name.trim().toLowerCase();
}

export function jobTypeExists(name: string, jobTypes: JobTypeOption[]) {
  const normalizedName = normalizeJobTypeName(name);

  return jobTypes.some(
    (jobType) => normalizeJobTypeName(jobType.name) === normalizedName
  );
}
