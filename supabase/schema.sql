-- Het Perfecte Plaatje - database schema
-- Voer dit uit in de Supabase SQL Editor (Database -> SQL Editor -> New query).
-- Alle toegang loopt server-side via de service-role key, dus Row Level Security
-- staat hier bewust uit. Deel de service-role key nooit met de client.

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table if not exists participants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code_hash   text not null,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists photos (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references participants(id) on delete cascade,
  category_id     uuid not null references categories(id) on delete cascade,
  day_number      int not null default 1,
  storage_path    text not null,
  caption         text not null default '',
  created_at      timestamptz not null default now()
);

create table if not exists votes (
  id              uuid primary key default gen_random_uuid(),
  voter_id        uuid not null references participants(id) on delete cascade,
  category_id     uuid not null references categories(id) on delete cascade,
  photo_id        uuid not null references photos(id) on delete cascade,
  rank            int not null check (rank between 1 and 3),
  points          int not null,
  created_at      timestamptz not null default now(),
  unique (voter_id, category_id, rank),
  unique (voter_id, photo_id)
);

-- Singleton-rij met de instellingen van de competitie.
create table if not exists settings (
  id                int primary key default 1,
  competition_name  text not null default 'Het Perfecte Plaatje',
  num_days          int not null default 7,
  start_date        date,
  phase             text not null default 'setup'
                    check (phase in ('setup', 'upload', 'voting', 'results')),
  constraint settings_singleton check (id = 1)
);

-- Bestaande installaties: voeg de kolom toe als hij nog niet bestaat.
alter table settings add column if not exists start_date date;

insert into settings (id) values (1) on conflict (id) do nothing;

-- Erelijst over de jaren heen (Hall of Fame).
create table if not exists hall_of_fame (
  id           uuid primary key default gen_random_uuid(),
  year         int not null,
  kind         text not null check (kind in ('champion', 'category')),
  title        text not null,
  winner_name  text not null,
  points       int not null default 0,
  photo_path   text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists idx_hof_year on hall_of_fame(year);

-- ---------------------------------------------------------------------------
-- Storage bucket voor de foto's
-- ---------------------------------------------------------------------------
-- 'public = true' zodat de foto's via een URL getoond kunnen worden. De
-- bestandsnamen zijn willekeurig, dus de URL verraadt niet wie de inzender is.
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Indexen
create index if not exists idx_photos_category on photos(category_id);
create index if not exists idx_photos_participant on photos(participant_id);
create index if not exists idx_votes_category on votes(category_id);
create index if not exists idx_votes_photo on votes(photo_id);
