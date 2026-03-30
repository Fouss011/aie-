create table if not exists sales (
  id bigint generated always as identity primary key,
  product text not null,
  amount numeric not null check (amount >= 0),
  client_name text,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id bigint generated always as identity primary key,
  label text not null,
  amount numeric not null check (amount >= 0),
  category text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);