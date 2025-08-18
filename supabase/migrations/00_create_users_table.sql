create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  fid text unique not null,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Create a policy that allows users to read all rows
create policy "Users are viewable by everyone" on public.users
  for select using (true);

-- Create a policy that allows authenticated users to update their own data
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Create indexes
create index if not exists users_fid_idx on public.users (fid);
create index if not exists users_username_idx on public.users (username);
