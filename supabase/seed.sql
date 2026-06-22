insert into statuses (name, slug, color, sort_order, is_board_column, is_done, is_active)
values
  ('New', 'new', '#0f172a', 1, true, false, true),
  ('In Progress', 'in-progress', '#f59e0b', 2, true, false, true),
  ('Waiting', 'waiting', '#dc2626', 3, true, false, true),
  ('Done', 'done', '#059669', 4, true, true, true)
on conflict (slug) do update
set name = excluded.name,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_board_column = excluded.is_board_column,
    is_done = excluded.is_done,
    is_active = excluded.is_active;

insert into priorities (name, color, sort_order, is_active)
values
  ('Low', '#64748b', 1, true),
  ('Normal', '#2563eb', 2, true),
  ('High', '#dc2626', 3, true)
on conflict (name) do update
set color = excluded.color,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into job_types (name, sort_order, is_active)
values
  ('Design', 1, true),
  ('Print', 2, true),
  ('Website', 3, true),
  ('Video', 4, true),
  ('Admin', 5, true),
  ('Installation', 6, true),
  ('Other', 7, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into production_stages (name, sort_order, is_active)
values
  ('Artwork', 1, true),
  ('Printing', 2, true),
  ('Production', 3, true),
  ('Review', 4, true),
  ('Approval', 5, true),
  ('Installation', 6, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into resources (name, sort_order, is_active)
values
  ('Design files', 1, true),
  ('Print stock', 2, true),
  ('Design assets', 3, true),
  ('Video assets', 4, true),
  ('Approval notes', 5, true),
  ('Site checklist', 6, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into waiting_reasons (name, sort_order, is_active)
values
  ('Waiting client approval', 1, true),
  ('Waiting internal approval', 2, true),
  ('Waiting resources', 3, true),
  ('Waiting Information', 4, true),
  ('Waiting files', 5, true),
  ('Waiting review', 6, true),
  ('Other', 7, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into requesters (name, sort_order, is_active)
values
  ('Internal Team', 1, true),
  ('Design Team', 2, true),
  ('Sales Team', 3, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;

insert into clients (name, sort_order, is_active)
values
  ('Acme Studio', 1, true),
  ('Local Business', 2, true),
  ('Creative Agency', 3, true),
  ('Content Client', 4, true),
  ('Internal Team', 5, true),
  ('Print Client', 6, true),
  ('General', 7, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;
