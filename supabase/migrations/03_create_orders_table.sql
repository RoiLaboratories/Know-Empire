create table public.orders (
  id uuid not null default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  buyer_fid bigint not null,
  seller_id uuid not null references public.users(id),
  product_id uuid not null references public.products(id),
  status text not null check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  price decimal not null,
  shipping_address jsonb,
  tracking_number text,

  constraint orders_pkey primary key (id)
);

-- Create an index for faster queries on buyer_fid
create index orders_buyer_fid_idx on public.orders(buyer_fid);

-- Create a trigger to automatically update updated_at
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_current_timestamp_updated_at();

-- Grant access to authenticated users
grant all on public.orders to authenticated;

-- RLS policies
alter table public.orders enable row level security;

-- Users can only read their own orders
create policy "Users can read their own orders"
  on public.orders for select
  using (auth.uid() in (
    select id from public.users where fid = buyer_fid
  ));

-- Users can create orders (will be restricted by API logic)
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() in (
    select id from public.users where fid = buyer_fid
  ));

-- Users can update their own orders (status updates will be restricted by API logic)
create policy "Users can update their own orders"
  on public.orders for update
  using (auth.uid() in (
    select id from public.users where fid = buyer_fid
  ));
