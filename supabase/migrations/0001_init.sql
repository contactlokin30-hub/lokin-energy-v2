-- Lokin Energy — schéma initial
-- Tables : products, bundle_rules, orders, order_items, profiles
-- RLS : lecture publique du catalogue, écriture des commandes réservée
--       au rôle service (Edge Functions).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table public.products (
  id            text primary key,
  slug          text not null unique,
  sku           text not null unique,
  name          text not null,
  tagline       text not null default '',
  description   text not null default '',
  caffeine_mg   integer not null check (caffeine_mg between 0 and 200),
  intensity     smallint not null check (intensity between 1 and 3),
  pouches_per_can integer not null default 20,
  price_cents   integer not null check (price_cents > 0),
  stock         integer not null default 0 check (stock >= 0),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.bundle_rules (
  id            uuid primary key default gen_random_uuid(),
  tier_size     integer not null unique check (tier_size > 0),
  discount_pct  numeric(5,2) not null check (discount_pct between 0 and 100),
  label         text not null,
  active        boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Clients / commandes
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  created_at    timestamptz not null default now()
);

create type public.order_status as enum (
  'pending', 'paid', 'failed', 'shipped', 'cancelled', 'refunded'
);

create type public.purchase_type as enum ('one_time', 'subscription');

create table public.orders (
  id                        uuid primary key default gen_random_uuid(),
  profile_id                uuid references public.profiles (id),
  email                     text,
  status                    public.order_status not null default 'pending',
  purchase_type             public.purchase_type not null default 'one_time',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id  text,
  stripe_subscription_id    text,
  amount_total_cents        integer,
  currency                  text not null default 'eur',
  shipping_address          jsonb,
  tracking_url              text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    text not null references public.products (id),
  quantity      integer not null check (quantity > 0),
  unit_price_cents integer not null,
  discount_pct  numeric(5,2) not null default 0,
  bundle_tier   integer,
  purchase_type public.purchase_type not null default 'one_time'
);

create index orders_profile_idx on public.orders (profile_id);
create index order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.products     enable row level security;
alter table public.bundle_rules enable row level security;
alter table public.profiles     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;

-- Catalogue : lecture publique (anon + authenticated), aucune écriture client.
create policy "products_public_read"
  on public.products for select
  to anon, authenticated
  using (active);

create policy "bundle_rules_public_read"
  on public.bundle_rules for select
  to anon, authenticated
  using (active);

-- Profils : chacun lit / met à jour le sien.
create policy "profiles_own_read"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_own_update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Commandes : le client authentifié lit les siennes ; aucune politique
-- INSERT/UPDATE pour anon/authenticated → seules les Edge Functions
-- (service_role, qui contourne la RLS) écrivent.
create policy "orders_own_read"
  on public.orders for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "order_items_own_read"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Décrément de stock atomique (appelé par le webhook Stripe)
-- ---------------------------------------------------------------------------
create or replace function public.decrement_stock(p_product_id text, p_qty integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update products
     set stock = stock - p_qty
   where id = p_product_id
     and stock >= p_qty;
  if not found then
    raise exception 'Stock insuffisant pour %', p_product_id;
  end if;
end;
$$;

revoke execute on function public.decrement_stock(text, integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed catalogue
-- ---------------------------------------------------------------------------
insert into public.products
  (id, slug, sku, name, tagline, caffeine_mg, intensity, price_cents, stock)
values
  ('prod_menthe_glaciale', 'menthe-glaciale', 'LKN-MG-01', 'Menthe Glaciale', 'Le coup de froid qui réveille', 50, 2, 1490, 250),
  ('prod_cafe_original',   'cafe-original',   'LKN-CO-01', 'Café Original',   'L''espresso sans la tasse', 60, 3, 1490, 180),
  ('prod_fruits_rouges',   'fruits-rouges',   'LKN-FR-01', 'Fruits Rouges',   'L''énergie côté sucré', 40, 1, 1490, 320),
  ('prod_citron_givre',    'citron-givre',    'LKN-CG-01', 'Citron Givré',    'L''acidité qui pique', 50, 2, 1490, 210),
  ('prod_cannelle_feu',    'cannelle-feu',    'LKN-CF-01', 'Cannelle Feu',    'Ça chauffe, puis ça carbure', 60, 3, 1490, 140),
  ('prod_vanille_bourbon', 'vanille-bourbon', 'LKN-VB-01', 'Vanille Bourbon', 'La douceur qui tient la distance', 40, 1, 1490, 260);

insert into public.bundle_rules (tier_size, discount_pct, label) values
  (3, 10, 'Pack Découverte'),
  (6, 20, 'Pack Habitué'),
  (10, 30, 'Pack Équipe');
