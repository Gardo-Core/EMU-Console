-- ============================================================
-- EMU Console — Supabase Setup Script
-- Registro Clienti: Schema, RLS Policies, Storage
-- ============================================================

-- 1. TABELLA CLIENTS
-- Contiene i clienti. Usa soft-delete (deleted_at) invece di CASCADE.
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  created_by uuid not null,
  deleted_at timestamptz
);

-- 2. TABELLA CONFIG_FILES
-- Metadata logico dei file .ini caricati per ogni cliente.
create table config_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  file_name text not null,
  latest_version int default 1,
  created_at timestamptz default now(),
  created_by uuid not null,
  deleted_at timestamptz,
  unique (client_id, file_name)
);

-- 3. TABELLA CONFIG_FILE_VERSIONS
-- Versioni fisiche dei file (ogni upload crea una nuova versione).
create table config_file_versions (
  id uuid primary key default gen_random_uuid(),
  file_id uuid references config_files(id),
  version int not null,
  storage_path text not null,
  file_size bigint,
  mime_type text,
  checksum text,
  uploaded_by uuid not null,
  created_at timestamptz default now(),
  deleted_at timestamptz,
  unique (file_id, version)
);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- Policy permissive: qualsiasi richiesta autenticata (con anon key) 
-- può eseguire tutte le operazioni CRUD.
-- ============================================================

-- Abilita RLS su tutte le tabelle
alter table clients enable row level security;
alter table config_files enable row level security;
alter table config_file_versions enable row level security;

-- Policy per CLIENTS
create policy "Allow all on clients"
  on clients
  for all
  using (true)
  with check (true);

-- Policy per CONFIG_FILES
create policy "Allow all on config_files"
  on config_files
  for all
  using (true)
  with check (true);

-- Policy per CONFIG_FILE_VERSIONS
create policy "Allow all on config_file_versions"
  on config_file_versions
  for all
  using (true)
  with check (true);
