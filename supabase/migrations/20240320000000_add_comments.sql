-- Enable necessary extensions (既に有効な場合はスキップ)
create extension if not exists "uuid-ossp";

-- Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint content_length check (char_length(content) >= 1 and char_length(content) <= 1000)
);

-- Create indexes
create index comments_post_id_idx on comments (post_id);
create index comments_parent_id_idx on comments (parent_id);

-- Enable RLS
alter table comments enable row level security;

-- Create RLS policies
create policy "Comments are viewable by everyone" on comments
  for select using (true);

create policy "Authenticated users can create comments" on comments
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own comments" on comments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own comments" on comments
  for delete using (auth.uid() = user_id);

-- Create trigger for updating updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column(); 