create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  notes text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_name_unique unique (name)
);

create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  color text,
  sort_order integer not null default 0,
  is_board_column boolean not null default true,
  is_done boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint statuses_name_unique unique (name),
  constraint statuses_slug_unique unique (slug)
);

create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint priorities_name_unique unique (name)
);

create table if not exists public.job_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_types_name_unique unique (name)
);

create table if not exists public.production_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint production_stages_name_unique unique (name)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_name_unique unique (name)
);

create table if not exists public.waiting_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waiting_reasons_name_unique unique (name)
);

create table if not exists public.requesters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requesters_name_unique unique (name)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  job_number text not null,
  title text not null,
  client_id uuid references public.clients(id),
  job_type_id uuid references public.job_types(id),
  production_stage_id uuid references public.production_stages(id),
  status_id uuid references public.statuses(id),
  priority_id uuid references public.priorities(id),
  due_date date,
  due_text text,
  item_project_asset text,
  requested_by_id uuid references public.requesters(id),
  resource_id uuid references public.resources(id),
  waiting_reason_id uuid references public.waiting_reasons(id),
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
  updated_at timestamptz not null default now(),
  constraint jobs_job_number_unique unique (job_number)
);

create unique index if not exists clients_name_lower_idx
  on public.clients (lower(name));

create unique index if not exists statuses_name_lower_idx
  on public.statuses (lower(name));

create unique index if not exists statuses_slug_lower_idx
  on public.statuses (lower(slug));

create unique index if not exists priorities_name_lower_idx
  on public.priorities (lower(name));

create unique index if not exists job_types_name_lower_idx
  on public.job_types (lower(name));

create unique index if not exists production_stages_name_lower_idx
  on public.production_stages (lower(name));

create unique index if not exists resources_name_lower_idx
  on public.resources (lower(name));

create unique index if not exists waiting_reasons_name_lower_idx
  on public.waiting_reasons (lower(name));

create unique index if not exists requesters_name_lower_idx
  on public.requesters (lower(name));

create unique index if not exists jobs_job_number_lower_idx
  on public.jobs (lower(job_number));

create index if not exists jobs_status_id_idx on public.jobs (status_id);
create index if not exists jobs_priority_id_idx on public.jobs (priority_id);
create index if not exists jobs_client_id_idx on public.jobs (client_id);
create index if not exists jobs_due_date_idx on public.jobs (due_date);
create index if not exists jobs_archived_at_idx on public.jobs (archived_at);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

drop trigger if exists statuses_set_updated_at on public.statuses;
create trigger statuses_set_updated_at
before update on public.statuses
for each row
execute function public.set_updated_at();

drop trigger if exists priorities_set_updated_at on public.priorities;
create trigger priorities_set_updated_at
before update on public.priorities
for each row
execute function public.set_updated_at();

drop trigger if exists job_types_set_updated_at on public.job_types;
create trigger job_types_set_updated_at
before update on public.job_types
for each row
execute function public.set_updated_at();

drop trigger if exists production_stages_set_updated_at on public.production_stages;
create trigger production_stages_set_updated_at
before update on public.production_stages
for each row
execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
before update on public.resources
for each row
execute function public.set_updated_at();

drop trigger if exists waiting_reasons_set_updated_at on public.waiting_reasons;
create trigger waiting_reasons_set_updated_at
before update on public.waiting_reasons
for each row
execute function public.set_updated_at();

drop trigger if exists requesters_set_updated_at on public.requesters;
create trigger requesters_set_updated_at
before update on public.requesters
for each row
execute function public.set_updated_at();

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

revoke all on schema public from anon;
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant usage on schema public to authenticated;
grant select, insert, update on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
revoke all on tables from anon;

alter default privileges in schema public
revoke all on sequences from anon;

alter default privileges in schema public
grant select, insert, update on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated;

alter table public.clients enable row level security;
alter table public.statuses enable row level security;
alter table public.priorities enable row level security;
alter table public.job_types enable row level security;
alter table public.production_stages enable row level security;
alter table public.resources enable row level security;
alter table public.waiting_reasons enable row level security;
alter table public.requesters enable row level security;
alter table public.jobs enable row level security;

drop policy if exists "anon can read clients" on public.clients;
drop policy if exists "authenticated can read clients" on public.clients;
create policy "authenticated can read clients"
on public.clients
for select
to authenticated
using (true);

drop policy if exists "anon can insert clients" on public.clients;
drop policy if exists "authenticated can insert clients" on public.clients;
create policy "authenticated can insert clients"
on public.clients
for insert
to authenticated
with check (true);

drop policy if exists "anon can update clients" on public.clients;
drop policy if exists "authenticated can update clients" on public.clients;
create policy "authenticated can update clients"
on public.clients
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read statuses" on public.statuses;
drop policy if exists "authenticated can read statuses" on public.statuses;
create policy "authenticated can read statuses"
on public.statuses
for select
to authenticated
using (true);

drop policy if exists "anon can insert statuses" on public.statuses;
drop policy if exists "authenticated can insert statuses" on public.statuses;
create policy "authenticated can insert statuses"
on public.statuses
for insert
to authenticated
with check (true);

drop policy if exists "anon can update statuses" on public.statuses;
drop policy if exists "authenticated can update statuses" on public.statuses;
create policy "authenticated can update statuses"
on public.statuses
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read priorities" on public.priorities;
drop policy if exists "authenticated can read priorities" on public.priorities;
create policy "authenticated can read priorities"
on public.priorities
for select
to authenticated
using (true);

drop policy if exists "anon can insert priorities" on public.priorities;
drop policy if exists "authenticated can insert priorities" on public.priorities;
create policy "authenticated can insert priorities"
on public.priorities
for insert
to authenticated
with check (true);

drop policy if exists "anon can update priorities" on public.priorities;
drop policy if exists "authenticated can update priorities" on public.priorities;
create policy "authenticated can update priorities"
on public.priorities
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read job_types" on public.job_types;
drop policy if exists "authenticated can read job_types" on public.job_types;
create policy "authenticated can read job_types"
on public.job_types
for select
to authenticated
using (true);

drop policy if exists "anon can insert job_types" on public.job_types;
drop policy if exists "authenticated can insert job_types" on public.job_types;
create policy "authenticated can insert job_types"
on public.job_types
for insert
to authenticated
with check (true);

drop policy if exists "anon can update job_types" on public.job_types;
drop policy if exists "authenticated can update job_types" on public.job_types;
create policy "authenticated can update job_types"
on public.job_types
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read production_stages" on public.production_stages;
drop policy if exists "authenticated can read production_stages" on public.production_stages;
create policy "authenticated can read production_stages"
on public.production_stages
for select
to authenticated
using (true);

drop policy if exists "anon can insert production_stages" on public.production_stages;
drop policy if exists "authenticated can insert production_stages" on public.production_stages;
create policy "authenticated can insert production_stages"
on public.production_stages
for insert
to authenticated
with check (true);

drop policy if exists "anon can update production_stages" on public.production_stages;
drop policy if exists "authenticated can update production_stages" on public.production_stages;
create policy "authenticated can update production_stages"
on public.production_stages
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read resources" on public.resources;
drop policy if exists "authenticated can read resources" on public.resources;
create policy "authenticated can read resources"
on public.resources
for select
to authenticated
using (true);

drop policy if exists "anon can insert resources" on public.resources;
drop policy if exists "authenticated can insert resources" on public.resources;
create policy "authenticated can insert resources"
on public.resources
for insert
to authenticated
with check (true);

drop policy if exists "anon can update resources" on public.resources;
drop policy if exists "authenticated can update resources" on public.resources;
create policy "authenticated can update resources"
on public.resources
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read waiting_reasons" on public.waiting_reasons;
drop policy if exists "authenticated can read waiting_reasons" on public.waiting_reasons;
create policy "authenticated can read waiting_reasons"
on public.waiting_reasons
for select
to authenticated
using (true);

drop policy if exists "anon can insert waiting_reasons" on public.waiting_reasons;
drop policy if exists "authenticated can insert waiting_reasons" on public.waiting_reasons;
create policy "authenticated can insert waiting_reasons"
on public.waiting_reasons
for insert
to authenticated
with check (true);

drop policy if exists "anon can update waiting_reasons" on public.waiting_reasons;
drop policy if exists "authenticated can update waiting_reasons" on public.waiting_reasons;
create policy "authenticated can update waiting_reasons"
on public.waiting_reasons
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read requesters" on public.requesters;
drop policy if exists "authenticated can read requesters" on public.requesters;
create policy "authenticated can read requesters"
on public.requesters
for select
to authenticated
using (true);

drop policy if exists "anon can insert requesters" on public.requesters;
drop policy if exists "authenticated can insert requesters" on public.requesters;
create policy "authenticated can insert requesters"
on public.requesters
for insert
to authenticated
with check (true);

drop policy if exists "anon can update requesters" on public.requesters;
drop policy if exists "authenticated can update requesters" on public.requesters;
create policy "authenticated can update requesters"
on public.requesters
for update
to authenticated
using (true)
with check (true);

drop policy if exists "anon can read jobs" on public.jobs;
drop policy if exists "authenticated can read jobs" on public.jobs;
create policy "authenticated can read jobs"
on public.jobs
for select
to authenticated
using (true);

drop policy if exists "anon can insert jobs" on public.jobs;
drop policy if exists "authenticated can insert jobs" on public.jobs;
create policy "authenticated can insert jobs"
on public.jobs
for insert
to authenticated
with check (true);

drop policy if exists "anon can update jobs" on public.jobs;
drop policy if exists "authenticated can update jobs" on public.jobs;
create policy "authenticated can update jobs"
on public.jobs
for update
to authenticated
using (true)
with check (true);
