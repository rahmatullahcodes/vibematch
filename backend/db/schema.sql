-- Spark Social relational schema draft for Postgres migration
-- Phase 2 hardening reference

create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  password_salt text not null,
  role text not null default 'member',
  account_status text not null default 'active',
  suspended_until timestamptz null,
  suspension_reason text null,
  avatar text null,
  city text null,
  age integer null,
  bio text null,
  intent text null,
  interests jsonb not null default '[]'::jsonb,
  verification jsonb not null default '{}'::jsonb,
  subscription_plan text not null default 'starter',
  subscription_status text not null default 'free',
  subscription_renews_at timestamptz null,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists moderation_reports (
  id text primary key,
  kind text not null,
  status text not null default 'open',
  reporter_user_id text not null references users(id),
  target_user_id text null references users(id),
  thread_id text null,
  message_id text null,
  reason text not null,
  action_taken text null,
  reviewed_by_user_id text null references users(id),
  reviewed_at timestamptz null,
  resolution_note text null,
  created_at timestamptz not null default now()
);

create table if not exists moderation_audit (
  id text primary key,
  actor_user_id text not null references users(id),
  target_user_id text null references users(id),
  report_id text null references moderation_reports(id),
  action text not null,
  note text null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text not null references users(id),
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  action_label text null,
  action_tab text null,
  delivery_channels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notification_preferences (
  user_id text primary key references users(id),
  in_app_by_type jsonb not null default '{}'::jsonb,
  browser_by_type jsonb not null default '{}'::jsonb,
  email_by_type jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
