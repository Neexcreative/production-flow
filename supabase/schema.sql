create extension if not exists pgcrypto;

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
  status_id uuid references statuses(id),
  priority_id uuid references priorities(id),
  job_type_id uuid references job_types(id),
  production_stage_id uuid references production_stages(id),
  resource_id uuid references resources(id),
  waiting_reason_id uuid references waiting_reasons(id),
  requester_id uuid references requesters(id),
  due_text text not null default 'Pending',
  vehicle_item text,
  quantity text,
  print_quantity text,
  cut_quantity text,
  lamination_quantity text,
  file_link text,
  artwork_link text,
  production_file_link text,
  notes text,
  reference_image text,
  reference_image_name text,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
