-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
-- 1. channels table
create table channels (
  id uuid default uuid_generate_v4() primary key,
  youtube_channel_id text unique not null,
  name text not null,
  description text,
  subscriber_count integer,
  icon_url text,
  post_count integer default 0,
  latest_post_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(username) >= 3)
);

-- 3. posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  channel_id uuid references channels(id) on delete cascade not null,
  title text not null,
  description text not null,
  score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint title_length check (char_length(title) >= 3 and char_length(title) <= 100),
  constraint description_length check (char_length(description) >= 10 and char_length(description) <= 1000)
);

-- 4. votes table
create table votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  is_upvote boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint unique_user_post unique (user_id, post_id)
);

-- Enable RLS
alter table channels enable row level security;
alter table profiles enable row level security;
alter table posts enable row level security;
alter table votes enable row level security;

-- RLS Policies
-- channels policies
create policy "Channels are viewable by everyone" on channels
  for select using (true);

-- profiles policies
create policy "Profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can create their own profile" on profiles
  for insert with check (auth.uid() = id);

-- posts policies
create policy "Posts are viewable by everyone" on posts
  for select using (true);

create policy "Authenticated users can create posts" on posts
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own posts" on posts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own posts" on posts
  for delete using (auth.uid() = user_id);

-- votes policies
create policy "Votes are viewable by everyone" on votes
  for select using (true);

create policy "Authenticated users can vote" on votes
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own votes" on votes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own votes" on votes
  for delete using (auth.uid() = user_id);

-- Triggers
-- Update channel stats
create or replace function update_channel_stats()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update channels
    set post_count = post_count + 1,
        latest_post_at = new.created_at
    where id = new.channel_id;
  elsif (TG_OP = 'DELETE') then
    update channels
    set post_count = post_count - 1,
        latest_post_at = (
          select max(created_at)
          from posts
          where channel_id = old.channel_id
        )
    where id = old.channel_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_post_update_channel_stats
  after insert or delete on posts
  for each row
  execute function update_channel_stats();

-- Update post score
create or replace function update_post_score()
returns trigger as $$
begin
  update posts
  set score = (
    select count(case when is_upvote then 1 end) - count(case when not is_upvote then 1 end)
    from votes
    where post_id = coalesce(new.post_id, old.post_id)
  )
  where id = coalesce(new.post_id, old.post_id);
  return null;
end;
$$ language plpgsql security definer;

create trigger on_vote_update_score
  after insert or update or delete on votes
  for each row
  execute function update_post_score();

-- Create indexes
create index channels_post_count_idx on channels (post_count desc);
create index channels_latest_post_at_idx on channels (latest_post_at desc);
create index channels_youtube_id_idx on channels (youtube_channel_id);
create index posts_channel_score_idx on posts (channel_id, score desc);
create index posts_channel_created_idx on posts (channel_id, created_at desc);
create index votes_post_id_idx on votes (post_id); 