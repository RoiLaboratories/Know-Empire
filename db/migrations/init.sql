-- Create Users Table
create table public.users (
    id uuid default gen_random_uuid() primary key,
    farcaster_id text unique not null,
    farcaster_username text unique not null,
    display_name text,
    avatar_url text,
    bio text,
    is_seller boolean default false,
    seller_handle text unique,
    seller_category text,
    seller_email text,
    seller_location text,
    seller_description text,
    seller_rating numeric(3,2),
    seller_total_sales integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Products Table
create table public.products (
    id uuid default gen_random_uuid() primary key,
    seller_id uuid references public.users(id) not null,
    title text not null,
    description text not null,
    price numeric(10,2) not null,
    photos text[] not null,
    country text not null,
    delivery text not null,
    category text not null,
    status text default 'active' check (status in ('active', 'sold', 'inactive')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint photos_length check (array_length(photos, 1) between 1 and 4)
);

-- Create Orders Table
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    buyer_id uuid references public.users(id) not null,
    seller_id uuid references public.users(id) not null,
    product_id uuid references public.products(id) not null,
    status text default 'pending' check (status in ('pending', 'completed', 'cancelled')),
    total_amount numeric(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Create RLS Policies

-- Users Policies
create policy "Users are viewable by everyone"
    on public.users for select
    using (true);

create policy "Anyone can create a user profile"
    on public.users for insert
    with check (true);

create policy "Users can update their own profile"
    on public.users for update
    using (auth.uid() = id);

-- Products Policies
create policy "Products are viewable by everyone"
    on public.products for select
    using (true);

create policy "Users can create their own products"
    on public.products for insert
    with check (auth.uid() = seller_id);

create policy "Users can update their own products"
    on public.products for update
    using (auth.uid() = seller_id);

create policy "Users can delete their own products"
    on public.products for delete
    using (auth.uid() = seller_id);

-- Orders Policies
create policy "Users can view their own orders"
    on public.orders for select
    using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can create orders"
    on public.orders for insert
    with check (auth.uid() = buyer_id);

create policy "Users can update their own orders"
    on public.orders for update
    using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Create function to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create storage bucket for product images if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        insert into storage.buckets (id, name, public) 
        values ('product-images', 'product-images', true);
    END IF;
END $$;

-- Set up storage policy for product images
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;

    -- Create new policies
    CREATE POLICY "Anyone can view product images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'product-images' );

    CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK ( 
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

    CREATE POLICY "Users can update their own product images"
    ON storage.objects FOR UPDATE
    USING ( 
        bucket_id = 'product-images' 
        AND auth.uid() = owner
    );

    CREATE POLICY "Users can delete their own product images"
    ON storage.objects FOR DELETE
    USING ( 
        bucket_id = 'product-images' 
        AND auth.uid() = owner
    );
END $$;

-- Create triggers for updated_at
create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute function public.handle_updated_at();

create trigger handle_products_updated_at
    before update on public.products
    for each row
    execute function public.handle_updated_at();

create trigger handle_orders_updated_at
    before update on public.orders
    for each row
    execute function public.handle_updated_at();
