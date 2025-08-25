-- Add escrow_id column to orders table
alter table public.orders
add column escrow_id text;
