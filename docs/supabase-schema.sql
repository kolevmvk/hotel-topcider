-- Vojni hotel — Supabase / PostgreSQL šema za produkciju
-- Pokrenuti u Supabase SQL Editor-u ili psql-u.
-- MVP aplikacija koristi localStorage; ova šema je ciljna migracija.

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- access_credentials — prvi sloj pristupa (/access gate)
-- ============================================================
create table if not exists public.access_credentials (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists idx_access_credentials_username
  on public.access_credentials (username)
  where is_active = true;

-- ============================================================
-- audit_logs — evidencija pristupa i app prijava
-- ============================================================
create type public.audit_event_type as enum ('access_login', 'app_login');
create type public.app_login_type as enum ('stanar', 'dezurni', 'upravnik', 'gost');

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type public.audit_event_type not null,
  success boolean not null,
  timestamp timestamptz not null default now(),
  ip_address text,
  user_agent text,
  referer text,
  path text,
  method text,
  -- access_login
  username text,
  -- app_login
  login_type public.app_login_type,
  identifier text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_audit_logs_timestamp
  on public.audit_logs (timestamp desc);

create index if not exists idx_audit_logs_event_type
  on public.audit_logs (event_type, timestamp desc);

-- ============================================================
-- analytics_events — jedinstveni event stream (navigacija, klikovi, biznis, bezbednost)
-- ============================================================
create type public.analytics_category as enum (
  'security', 'navigation', 'interaction', 'business'
);
create type public.analytics_actor_type as enum (
  'anonymous', 'access_user', 'app_user'
);
create type public.analytics_device_type as enum (
  'mobile', 'tablet', 'desktop', 'unknown'
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  category public.analytics_category not null,
  event_name text not null,
  success boolean,
  timestamp timestamptz not null default now(),
  actor_type public.analytics_actor_type not null default 'anonymous',
  actor_id text,
  actor_role public.user_role,
  actor_label text,
  room text,
  visit_id text,
  session_id text,
  path text,
  referrer text,
  target_id text,
  target_label text,
  device_type public.analytics_device_type not null default 'unknown',
  os text,
  browser text,
  is_pwa boolean not null default false,
  viewport_w integer,
  viewport_h integer,
  ip_address text,
  user_agent text,
  is_bot boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_analytics_events_timestamp
  on public.analytics_events (timestamp desc);

create index if not exists idx_analytics_events_category_name
  on public.analytics_events (category, event_name, timestamp desc);

create index if not exists idx_analytics_events_actor
  on public.analytics_events (actor_id, timestamp desc)
  where actor_id is not null;

create index if not exists idx_analytics_events_bot
  on public.analytics_events (is_bot, timestamp desc)
  where is_bot = true;

create index if not exists idx_analytics_events_device
  on public.analytics_events (device_type, timestamp desc);

-- ============================================================
-- users — stanari i službeni nalozi (app login)
-- ============================================================
create type public.user_role as enum ('stanar', 'dezurni', 'upravnik', 'gost');
create type public.user_status as enum ('pending', 'active', 'inactive');

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  full_name text not null,
  room text,
  pin_hash text not null,
  phone text,
  role public.user_role not null default 'stanar',
  status public.user_status not null default 'pending',
  username text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.users (id)
);

create index if not exists idx_users_room on public.users (room);
create index if not exists idx_users_status on public.users (status);
create unique index if not exists idx_users_staff_username
  on public.users (username)
  where username is not null;

-- ============================================================
-- problem_reports — prijave stanara
-- ============================================================
create type public.problem_category as enum (
  'voda', 'struja', 'grejanje', 'internet', 'higijena', 'drugo'
);
create type public.problem_status as enum ('Primljeno', 'U radu', 'Rešeno');

create table if not exists public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  full_name text not null,
  room text not null,
  category public.problem_category not null,
  description text not null,
  phone text,
  status public.problem_status not null default 'Primljeno',
  dezurni_potvrda jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_problem_reports_status
  on public.problem_reports (status, created_at desc);

create index if not exists idx_problem_reports_user
  on public.problem_reports (user_id);

-- ============================================================
-- notices — obaveštenja hotela
-- ============================================================
create type public.notice_priority as enum ('hitno', 'obicno');
create type public.notice_category as enum (
  'opste', 'restoran', 'odrzavanje', 'bezbednost', 'dogadjaj'
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  naslov text not null,
  datum date not null,
  kategorija public.notice_category not null default 'opste',
  tekst text not null,
  prioritet public.notice_priority not null default 'obicno',
  aktivno boolean not null default true,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notices_aktivno
  on public.notices (aktivno, datum desc);

-- ============================================================
-- messages — direktne poruke između uloga
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.users (id),
  from_role public.user_role not null,
  from_name text not null,
  from_room text,
  to_user_id uuid not null references public.users (id),
  to_role public.user_role not null,
  to_name text not null,
  naslov text not null,
  tekst text not null,
  created_at timestamptz not null default now(),
  procitano_at timestamptz
);

create index if not exists idx_messages_to_user
  on public.messages (to_user_id, created_at desc);

create index if not exists idx_messages_from_user
  on public.messages (from_user_id, created_at desc);

-- ============================================================
-- hotel_tasks — zadaci upravnika dežurnoj službi
-- ============================================================
create type public.task_priority as enum ('hitno', 'obicno');
create type public.task_status as enum ('Dodeljen', 'U radu', 'Izvršen', 'Potvrđen');

create table if not exists public.hotel_tasks (
  id uuid primary key default gen_random_uuid(),
  naslov text not null,
  opis text not null,
  prioritet public.task_priority not null default 'obicno',
  status public.task_status not null default 'Dodeljen',
  created_by_id uuid not null references public.users (id),
  created_by_name text not null,
  rok timestamptz,
  zapazanja jsonb not null default '[]'::jsonb,
  izvrsenje jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hotel_tasks_status
  on public.hotel_tasks (status, created_at desc);

-- ============================================================
-- shift_logs — dnevnik dežurne smene
-- ============================================================
create type public.shift_log_type as enum ('zapažanje', 'primedba', 'info');

create table if not exists public.shift_logs (
  id uuid primary key default gen_random_uuid(),
  tip public.shift_log_type not null,
  tekst text not null,
  author_id uuid not null references public.users (id),
  author_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_shift_logs_created
  on public.shift_logs (created_at desc);

-- ============================================================
-- hotel_rooms — evidencija soba
-- ============================================================
create type public.room_occupancy as enum ('slobodna', 'zauzeta', 'renoviranje');
create type public.room_condition as enum ('odlicno', 'dobro', 'zadovoljavajuce', 'potrebno_obnavljanje');
create type public.room_purpose as enum ('stanar', 'gost', 'mesovita', 'sluzbena');

create table if not exists public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  broj text not null unique,
  sprat text not null,
  namena public.room_purpose not null default 'mesovita',
  status public.room_occupancy not null default 'slobodna',
  stanje public.room_condition not null default 'dobro',
  treba_renoviranje boolean not null default false,
  napomena_renoviranje text,
  inventar jsonb not null default '[]'::jsonb,
  ocitanja jsonb not null default '[]'::jsonb,
  dodeljeni_user_id uuid references public.users (id),
  interna_napomena text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- room_handovers — prijem i predaja sobe
-- ============================================================
create type public.handover_type as enum ('prijem', 'predaja');
create type public.handover_status as enum ('ceka_korisnika', 'ceka_dezurnog', 'zavrseno');

create table if not exists public.room_handovers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hotel_rooms (id),
  broj_sobe text not null,
  tip public.handover_type not null,
  user_id uuid not null references public.users (id),
  user_name text not null,
  user_role public.user_role not null,
  inventar jsonb not null default '[]'::jsonb,
  stanje_sobe public.room_condition not null,
  korisnik_potvrdio boolean not null default false,
  korisnik_potvrdio_at timestamptz,
  dezurni_potvrda jsonb,
  status public.handover_status not null default 'ceka_korisnika',
  created_at timestamptz not null default now()
);

create index if not exists idx_room_handovers_room
  on public.room_handovers (room_id, created_at desc);

-- ============================================================
-- assistant — lokalni AI asistent (sesije, poruke, uvidi)
-- ============================================================
create type public.assistant_audience as enum (
  'executive', 'operational', 'general', 'developer'
);

create type public.assistant_message_role as enum ('user', 'assistant');

create type public.assistant_insight_type as enum (
  'pain_point', 'priority', 'sentiment', 'current_process', 'usefulness', 'topic', 'open_question'
);

create table if not exists public.assistant_sessions (
  id uuid primary key default gen_random_uuid(),
  access_username text not null,
  organization text not null,
  audience public.assistant_audience not null default 'general',
  visit_id text,
  phase text not null default 'welcome',
  message_count integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_activity_at timestamptz not null default now()
);

create index if not exists idx_assistant_sessions_username
  on public.assistant_sessions (access_username, last_activity_at desc);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assistant_sessions(id) on delete cascade,
  role public.assistant_message_role not null,
  content text not null,
  phase text not null default 'welcome',
  timestamp timestamptz not null default now()
);

create index if not exists idx_assistant_messages_session
  on public.assistant_messages (session_id, timestamp);

create table if not exists public.assistant_insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assistant_sessions(id) on delete cascade,
  insight_type public.assistant_insight_type not null,
  value text not null,
  extracted_at timestamptz not null default now()
);

create index if not exists idx_assistant_insights_session
  on public.assistant_insights (session_id, extracted_at);

-- ============================================================
-- RLS placeholders (prilagoditi pre produkcije)
-- ============================================================
-- alter table public.users enable row level security;
-- alter table public.problem_reports enable row level security;
-- ... dodati politike po ulozi (stanar / dezurni / upravnik)

comment on table public.access_credentials is 'Prvi sloj — pristup celoj aplikaciji pre /login';
comment on table public.audit_logs is 'Evidencija pokušaja pristupa i app prijava (bez PIN/password)';
comment on table public.analytics_events is 'Analitika: navigacija, klikovi, poslovni događaji, bezbednost (bez PIN/password)';
comment on table public.assistant_sessions is 'AI asistent — sesije po access username / komandi';
comment on table public.assistant_messages is 'AI asistent — poruke razgovora';
comment on table public.assistant_insights is 'AI asistent — izvučeni uvidi iz razgovora';
comment on table public.users is 'App korisnici — stanari (soba+PIN) i službeni nalozi';
