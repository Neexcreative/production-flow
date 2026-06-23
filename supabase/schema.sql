create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_name text,
  email text,
  phone text,
  notes text,
  sort_order integer default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  color text,
  sort_order integer not null default 0,
  is_board_column boolean not null default true,
  is_done boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists priorities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists production_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists waiting_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists requesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null unique,
  title text not null,
  client_id uuid references clients(id),
  job_type_id uuid references job_types(id),
  production_stage_id uuid references production_stages(id),
  status_id uuid references statuses(id),
  priority_id uuid references priorities(id),
  due_date date,
  due_text text,
  item_project_asset text,
  requested_by_id uuid references requesters(id),
  resource_id uuid references resources(id),
  waiting_reason_id uuid references waiting_reasons(id),
  quantity integer,
  output_quantity integer,
  cut_quantity integer,
  lamination_finishing_quantity integer,
  main_file_link text,
  artwork_design_link text,
  final_production_link text,
  internal_notes text,
  reference_url text,
  reference_attachment_url text,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists jobs_set_updated_at on jobs;

create trigger jobs_set_updated_at
before update on jobs
for each row
execute function set_updated_at();
