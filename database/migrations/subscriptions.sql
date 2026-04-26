create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),

  structure_id uuid not null,

  plan text default 'trial',
  status text default 'active',

  trial_start timestamp default now(),
  trial_end timestamp,

  is_active boolean default true,

  created_at timestamp default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),

  structure_id uuid not null,
  amount integer,
  status text default 'pending', -- pending / validated

  created_at timestamp default now()
);