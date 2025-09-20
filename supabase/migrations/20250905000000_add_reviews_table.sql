-- Create Reviews Table
create table public.reviews (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) not null unique,
    reviewer_id uuid references public.users(id) not null,
    reviewed_user_id uuid references public.users(id) not null,
    product_id uuid references public.products(id) not null,
    rating integer not null check (rating between 1 and 5),
    comment text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.reviews enable row level security;

-- Create RLS Policies
create policy "Reviews are viewable by everyone"
    on public.reviews for select
    using (true);

create policy "Users can create reviews for their orders"
    on public.reviews for insert
    with check (auth.uid() = reviewer_id and 
              exists (
                select 1 from orders 
                where orders.id = order_id 
                and (orders.buyer_id = reviewer_id or orders.seller_id = reviewer_id)
                and orders.status = 'completed'
              ));

create policy "Users can update their own reviews"
    on public.reviews for update
    using (auth.uid() = reviewer_id);

-- Function to update user ratings
create or replace function update_user_rating()
returns trigger as $$
begin
  update users
  set seller_rating = (
    select avg(rating)::numeric(3,2)
    from reviews
    where reviewed_user_id = new.reviewed_user_id
  )
  where id = new.reviewed_user_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update user rating on review changes
create trigger update_user_rating_on_review
after insert or update of rating on reviews
for each row
execute function update_user_rating();
