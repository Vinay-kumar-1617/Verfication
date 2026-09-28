create extension if not exists "pgcrypto";

create table if not exists public.api_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  service text not null check (length(service) > 0),
  reference_id text,
  status text not null default 'pending',
  payload jsonb,
  error_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.digilocker_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  state text not null,
  redirect_uri text,
  auth_code text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, state)
);

create table if not exists public.vehicle_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  registration_number text not null,
  reference_id text,
  status text not null default 'pending',
  response_payload jsonb,
  error_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_api_transactions_user_id on public.api_transactions (user_id);
create index if not exists idx_api_transactions_status on public.api_transactions (status);
create index if not exists idx_digilocker_sessions_user_id on public.digilocker_sessions (user_id);
create index if not exists idx_vehicle_requests_user_id on public.vehicle_requests (user_id);

alter table public.api_transactions enable row level security;
alter table public.digilocker_sessions enable row level security;
alter table public.vehicle_requests enable row level security;

create policy "Users can read their own API transactions"
  on public.api_transactions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own API transactions"
  on public.api_transactions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own API transaction state"
  on public.api_transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status is not null and reference_id is not null);

create policy "Users can read their own DigiLocker sessions"
  on public.digilocker_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own DigiLocker sessions"
  on public.digilocker_sessions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own DigiLocker sessions"
  on public.digilocker_sessions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and state is not null);

create policy "Users can read their own vehicle requests"
  on public.vehicle_requests
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vehicle requests"
  on public.vehicle_requests
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vehicle requests"
  on public.vehicle_requests
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and registration_number is not null);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_api_transactions_updated_at
before update on public.api_transactions
for each row execute function public.set_updated_at();

create trigger set_digilocker_sessions_updated_at
before update on public.digilocker_sessions
for each row execute function public.set_updated_at();

create trigger set_vehicle_requests_updated_at
before update on public.vehicle_requests
for each row execute function public.set_updated_at();
