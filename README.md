# Production Flow

Production Flow is an internal job and production control system for tracking general jobs, production work, design tasks, print jobs, web projects, video work, service requests, and operational workflows.

## Features

- Job board with status columns
- Board View and List View
- New job creation
- Edit job records
- Archive and restore workflow
- TV Mode
- PDF job record export
- Jobs report exports
- Filters
- Supabase database support
- Supabase Auth login protection
- Local fallback when Supabase is not configured
- Settings page for dropdown data management
- Client management
- Status management
- Priority management
- Job type management
- Production stage management
- Resource management
- Waiting reason management
- Requester management

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- `@supabase/supabase-js`
- `jspdf`
- `xlsx`
- Native browser CSV export

## Getting Started

1. Clone the repository.
2. Install dependencies.
3. Create environment variables.
4. Run the development server.
5. Open the app in the browser.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create a local `.env.local` file using `.env.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

How to get these values from Supabase:

1. Open your Supabase project.
2. Go to `Project Settings`.
3. Open `API`.
4. Copy the `Project URL`.
5. Copy the `anon public` key.

## Supabase Setup

Production Flow now treats Supabase as the main source of truth when the environment variables are configured.

Files:

- `supabase/schema.sql`
- `supabase/seed.sql`
- `src/lib/supabaseClient.ts`

Setup steps:

1. Create a Supabase project.
2. Open `SQL Editor`.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Confirm the tables, indexes, triggers, grants, and RLS policies were created.
6. In `Authentication > Providers`, enable `Email`.
7. Create at least one user in `Authentication > Users`.
8. Add the environment variables locally and in deployment.
9. Restart the app after adding the environment variables.

Main tables:

- `jobs`
- `clients`
- `statuses`
- `priorities`
- `job_types`
- `production_stages`
- `resources`
- `waiting_reasons`
- `requesters`

The schema file also creates:

- `updated_at` triggers for all writable tables
- case-insensitive unique indexes for dropdown-style name fields
- indexes for common job lookups such as `job_number`, `status_id`, `client_id`, `due_date`, and `archived_at`
- grants for `authenticated`
- row-level security policies that allow authenticated users to `select`, `insert`, and `update`
- revokes for anonymous access on app tables

`jobs` columns:

- `job_number`
- `title`
- `client_id`
- `job_type_id`
- `production_stage_id`
- `status_id`
- `priority_id`
- `due_date`
- `due_text`
- `item_project_asset`
- `requested_by_id`
- `resource_id`
- `quantity`
- `output_quantity`
- `cut_quantity`
- `lamination_finishing_quantity`
- `waiting_reason_id`
- `main_file_link`
- `artwork_design_link`
- `final_production_link`
- `internal_notes`
- `reference_url`
- `reference_attachment_url`
- `created_at`
- `updated_at`
- `completed_at`
- `archived_at`

`created_at` and `updated_at` are database-managed timestamps. The app job payload does not manually send them during create or edit.

Frontend job payload written by the live app:

- `job_number`
- `title`
- `client_id`
- `job_type_id`
- `production_stage_id`
- `status_id`
- `priority_id`
- `due_date`
- `due_text`
- `item_project_asset`
- `requested_by_id`
- `resource_id`
- `quantity`
- `output_quantity`
- `cut_quantity`
- `lamination_finishing_quantity`
- `waiting_reason_id`
- `main_file_link`
- `artwork_design_link`
- `final_production_link`
- `internal_notes`
- `reference_url`
- `reference_attachment_url`
- `completed_at`
- `archived_at`

Do not use legacy `jobs` columns such as:

- `file_link`
- `artwork_link`
- `production_file_link`
- `notes`
- `reference_image`
- `print_quantity`
- `lamination_quantity`

## Data Source Behavior

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set and the connection succeeds:

- users must sign in with Supabase Auth before accessing the app
- jobs load from Supabase
- dropdown data loads from Supabase
- create, edit, status changes, archive, restore, reports, and settings all use Supabase

When Supabase is not configured or the connection fails:

- the login gate shows a setup-required message
- browser storage is still used for fallback preferences in local-only scenarios

Local storage is no longer the primary job database.

## Login Setup

Production Flow is now protected by Supabase Auth.

Required setup:

1. Open your Supabase project.
2. Go to `Authentication > Providers`.
3. Enable `Email`.
4. Go to `Authentication > Users`.
5. Create users for each person who should access Production Flow.
6. Keep using the project `URL` and `anon public` key in `.env.local`.

App behavior:

- unauthenticated users are redirected to `/login`
- authenticated users can access board, jobs, settings, reports, archive, and TV Mode
- the header includes a logout button
- database reads and writes require an authenticated Supabase session

## Settings

The app now includes a `Settings` page at `/settings`.

Available sections:

- Clients
- Statuses
- Priorities
- Job Types
- Production Stages
- Resources
- Waiting Reasons
- Requesters

Each section supports:

- list
- add
- edit
- deactivate using `is_active = false`
- reactivate using `is_active = true`

Records are not permanently deleted from the UI workflow.

## Editing Dropdown Options

### Clients

Used in the Client dropdown and reports.

Managed in:

- `Settings > Clients`

Fields:

- `name`
- `contact_name`
- `email`
- `phone`
- `notes`
- `sort_order`
- `is_active`
- unique name protection through a case-insensitive index

### Statuses

Used for board columns, list status changes, TV Mode, and archive behavior.

Managed in:

- `Settings > Statuses`

Fields:

- `name`
- `slug`
- `color`
- `sort_order`
- `is_board_column`
- `is_done`
- `is_active`

Board columns are generated from active statuses where:

- `is_board_column = true`
- `is_active = true`

Default expected columns:

- `New`
- `In Progress`
- `Waiting`
- `Done`

### Priorities

Managed in:

- `Settings > Priorities`

Fields:

- `name`
- `color`
- `sort_order`
- `is_active`

Current seeded priorities:

- `Low`
- `Normal`
- `High`

### Job Types

Managed in:

- `Settings > Job Types`

Current seeded job types:

- `Design`
- `Print`
- `Website`
- `Video`
- `Admin`
- `Installation`
- `Other`

### Production Stages

Managed in:

- `Settings > Production Stages`

Current seeded stages:

- `Artwork`
- `Printing`
- `Production`
- `Review`
- `Approval`
- `Installation`

### Resources

Managed in:

- `Settings > Resources`

This table can represent materials, internal resources, or work outputs.

### Waiting Reasons

Managed in:

- `Settings > Waiting Reasons`

Used when a job is blocked or waiting.

### Requesters

Managed in:

- `Settings > Requesters`

Used in the `Requested By` dropdown.

Fields:

- `name`
- `sort_order`
- `is_active`

## Active vs Deleted Items

Do not permanently delete dropdown items that may already be linked to jobs.

Use `is_active = false` instead.

Inactive items should:

- disappear from new job dropdowns
- remain visible in old job records
- preserve reporting and historical data

## How Job Numbers Work

New jobs use sequential IDs:

- `JOB-001`
- `JOB-002`
- `JOB-003`

When Supabase is active, the next number is generated from the latest `job_number` stored in the `jobs` table.

## Board View vs List View

### Board View

Best for visual workflow and production tracking.

Board columns come from Supabase statuses where:

- `is_board_column = true`
- `is_active = true`

### List View

Best for quick scanning, filtering, and operational row-based management.

List View includes:

- `Job ID`
- `Title`
- `Client`
- `Status`
- `Priority`
- `Job Type`
- `Production Stage`
- `Due Date / Due Text`
- `Updated At`
- `Actions`

The selected view is stored locally in:

- `productionFlowViewMode`

Allowed values:

- `board`
- `list`

## Reports and Exports

### Individual Job PDF

Generated from each job card or job row.

Example filename:

- `production-flow-JOB-001.pdf`

### Jobs Report PDF

Generated from the Reports page.

Example filename:

- `production-flow-jobs-report-YYYY-MM-DD.pdf`

### CSV Export

Exports the filtered report table.

### Excel Export

Exports two sheets:

- `Summary`
- `Jobs`

## Archive

Archive behavior:

- jobs are not deleted
- archiving sets `archived_at`
- archived jobs are hidden from the active board and active list
- archived jobs appear in `Archive`
- archived jobs can be restored by clearing `archived_at`

## TV Mode

TV Mode is a simplified read-only production display.

It focuses on:

- active jobs
- waiting jobs
- production status
- board columns generated from active statuses

## Local Fallback

Supabase is the intended primary source of truth.

Local fallback is still present for:

- demo/fallback jobs when Supabase is unavailable
- fallback dropdown data when Supabase is unavailable
- browser-only preferences

Current local storage keys:

- `productionFlowJobs`
- `productionFlowHistory`
- `productionFlowClients`
- `productionFlowJobTypes`
- `productionFlowResources`
- `productionFlowRequestedBy`
- `productionFlowViewMode`

## Deployment to Vercel

1. Push the project to GitHub.
2. Create a new Vercel project.
3. Connect the repository.
4. Add `NEXT_PUBLIC_SUPABASE_URL`.
5. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Deploy.
7. Open the production URL.
8. Make sure email/password auth is enabled and production users exist in Supabase Auth.

## Daily Usage Workflow

1. Create a new job.
2. Fill in the client, title, due date, priority, and production details.
3. Move the job through statuses.
4. Use `Waiting` when the job is blocked.
5. Add links and internal notes.
6. Export a PDF if needed.
7. Mark the job complete through the appropriate done status.
8. Archive it when it is no longer active.

## Maintenance Notes

- Manage dropdown values in `Settings` instead of hardcoding them
- Keep seed data generic
- Keep schema and seed files in sync
- Treat Supabase as the main database in connected environments
- Use local fallback only for offline/demo scenarios

## Troubleshooting

### Jobs are not saving

Check:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `supabase/schema.sql` was run successfully
- RLS policies exist for `jobs` and the dropdown tables
- the signed-in user session is valid
- the `authenticated` role has `select`, `insert`, and `update` access through RLS

### Dropdowns are empty

Check:

- `supabase/seed.sql` was executed
- the relevant table rows have `is_active = true`
- the signed-in user can read the dropdown tables through RLS

### Board columns are missing

Check statuses where:

- `is_board_column = true`
- `is_active = true`

### Archive looks empty

Check whether the jobs actually have `archived_at` populated.

### App still shows fallback data

Check whether Supabase is configured correctly. If not, the app intentionally stays on the local fallback path.

### Supabase connection fails

Check:

- project URL
- anon key
- network access
- email/password auth is enabled
- row-level security or permissions for the `authenticated` role

## Generic Product Rule

Production Flow should remain generic across the codebase, UI, exports, schema, and demo content.
