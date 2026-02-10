-- Comments table: signed-in users can post; everyone can read.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  author_avatar_url text,
  body text not null check (char_length(body) <= 2000),
  section_id text not null default 'main',
  created_at timestamptz not null default now()
);

-- Index for listing by date
create index if not exists comments_created_at_idx on public.comments(created_at desc);

-- RLS: enable
alter table public.comments enable row level security;

-- Anyone can read comments
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

-- Only authenticated users can insert; they can only set their own user_id
create policy "Authenticated users can insert own comment"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Optional: users can update/delete only their own comments
create policy "Users can update own comment"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own comment"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);
