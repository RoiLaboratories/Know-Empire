-- Add wallet_address column to users table
alter table public.users
add column wallet_address text;

-- Create a trigger to ensure wallet_address is set for sellers
create or replace function check_seller_wallet_address()
returns trigger as $$
begin
  if new.is_seller = true and new.wallet_address is null then
    raise exception 'Wallet address is required for sellers';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_seller_wallet_address
before insert or update on public.users
for each row
execute function check_seller_wallet_address();
