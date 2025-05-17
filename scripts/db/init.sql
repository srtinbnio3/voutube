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
  
  constraint username_length check (char_length(username) >= 1)
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

-- コメントテーブルの作成
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. crowdfunding_campaigns table
create table crowdfunding_campaigns (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  channel_id uuid references channels(id) on delete cascade not null,
  title text not null,
  description text not null,
  target_amount integer not null check (target_amount > 0),
  current_amount integer default 0 check (current_amount >= 0),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text not null check (status in ('draft', 'active', 'completed', 'cancelled')),
  reward_enabled boolean default false,
  bank_account_info jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint end_date_after_start_date check (end_date > start_date),
  constraint title_length check (char_length(title) >= 3 and char_length(title) <= 100),
  constraint description_length check (char_length(description) >= 10 and char_length(description) <= 1000)
);

-- 6. crowdfunding_rewards table
create table crowdfunding_rewards (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references crowdfunding_campaigns(id) on delete cascade not null,
  title text not null,
  description text not null,
  amount integer not null check (amount > 0),
  quantity integer not null check (quantity > 0),
  remaining_quantity integer not null check (remaining_quantity >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint title_length check (char_length(title) >= 3 and char_length(title) <= 100),
  constraint description_length check (char_length(description) >= 10 and char_length(description) <= 1000),
  constraint remaining_quantity_less_than_quantity check (remaining_quantity <= quantity)
);

-- 7. crowdfunding_supporters table
create table crowdfunding_supporters (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references crowdfunding_campaigns(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  reward_id uuid references crowdfunding_rewards(id) on delete cascade not null,
  amount integer not null check (amount > 0),
  payment_status text not null check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint unique_support check (amount >= (
    select amount from crowdfunding_rewards where id = reward_id
  ))
);

-- 8. crowdfunding_payments table
create table crowdfunding_payments (
  id uuid default uuid_generate_v4() primary key,
  supporter_id uuid references crowdfunding_supporters(id) on delete cascade not null,
  stripe_payment_intent_id text not null,
  stripe_customer_id text not null,
  amount integer not null check (amount > 0),
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table channels enable row level security;
alter table profiles enable row level security;
alter table posts enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

-- RLS Policies
-- channels policies
create policy "Channels are viewable by everyone" on channels
  for select using (true);

-- 追加: 認証済みユーザーがチャンネルを作成できるポリシー
create policy "Authenticated users can create channels" on channels
  for insert with check (auth.role() = 'authenticated');

-- 追加: チャンネルの更新ポリシー（必要に応じて）
create policy "Users can update channels" on channels
  for update using (auth.role() = 'authenticated');

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

-- コメントの閲覧ポリシー（全ユーザーが閲覧可能）
create policy "コメントは全ユーザーが閲覧可能"
  on comments for select
  using (true);

-- コメントの作成ポリシー（認証済みユーザーのみ）
create policy "認証済みユーザーのみコメントを作成可能"
  on comments for insert
  with check (auth.uid() = user_id);

-- コメントの更新ポリシー（自分のコメントのみ）
create policy "自分のコメントのみ更新可能"
  on comments for update
  using (auth.uid() = user_id);

-- コメントの削除ポリシー（自分のコメントのみ）
create policy "自分のコメントのみ削除可能"
  on comments for delete
  using (auth.uid() = user_id);

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

-- Create profile for new user trigger
create or replace function create_profile_for_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    -- OAuth認証の場合はraw_user_meta_dataからusernameを取得、
    -- なければメールアドレスのローカル部分を使用
    coalesce(
      (new.raw_user_meta_data->>'name')::text,
      split_part(new.email, '@', 1)
    ),
    -- OAuth認証の場合はavatarを使用
    (new.raw_user_meta_data->>'avatar_url')::text
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_profile_for_new_user();

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "認証済みユーザーのみアップロード可能" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-content');

-- 認証済みユーザーは自分のファイルのみ更新可能
CREATE POLICY "認証済みユーザーは自分のファイルのみ更新可能" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 全ユーザーが閲覧可能
CREATE POLICY "全ユーザーが閲覧可能" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'user-content');

-- 更新日時を自動更新するトリガーの作成
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

ALTER TABLE comments ADD COLUMN mentioned_username text; 

-- Create indexes
create index crowdfunding_campaigns_channel_id_idx on crowdfunding_campaigns (channel_id);
create index crowdfunding_campaigns_status_idx on crowdfunding_campaigns (status);
create index crowdfunding_campaigns_dates_idx on crowdfunding_campaigns (start_date, end_date);
create index crowdfunding_rewards_campaign_id_idx on crowdfunding_rewards (campaign_id);
create index crowdfunding_supporters_campaign_id_idx on crowdfunding_supporters (campaign_id);
create index crowdfunding_supporters_user_id_idx on crowdfunding_supporters (user_id);
create index crowdfunding_payments_supporter_id_idx on crowdfunding_payments (supporter_id);
create index crowdfunding_payments_stripe_payment_intent_id_idx on crowdfunding_payments (stripe_payment_intent_id);

-- Create triggers
create or replace function update_campaign_amount()
returns trigger as $$
begin
  if (TG_OP = 'INSERT' and new.status = 'completed') then
    update crowdfunding_campaigns
    set current_amount = current_amount + new.amount
    where id = new.campaign_id;
  elsif (TG_OP = 'UPDATE' and old.status != 'completed' and new.status = 'completed') then
    update crowdfunding_campaigns
    set current_amount = current_amount + new.amount
    where id = new.campaign_id;
  elsif (TG_OP = 'UPDATE' and old.status = 'completed' and new.status != 'completed') then
    update crowdfunding_campaigns
    set current_amount = current_amount - old.amount
    where id = old.campaign_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_supporter_update_campaign_amount
  after insert or update on crowdfunding_supporters
  for each row
  execute function update_campaign_amount();

create or replace function update_reward_quantity()
returns trigger as $$
begin
  if (TG_OP = 'INSERT' and new.status = 'completed') then
    update crowdfunding_rewards
    set remaining_quantity = remaining_quantity - 1
    where id = new.reward_id;
  elsif (TG_OP = 'UPDATE' and old.status != 'completed' and new.status = 'completed') then
    update crowdfunding_rewards
    set remaining_quantity = remaining_quantity - 1
    where id = new.reward_id;
  elsif (TG_OP = 'UPDATE' and old.status = 'completed' and new.status != 'completed') then
    update crowdfunding_rewards
    set remaining_quantity = remaining_quantity + 1
    where id = old.reward_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_supporter_update_reward_quantity
  after insert or update on crowdfunding_supporters
  for each row
  execute function update_reward_quantity();

-- creator_rewardsテーブルの作成
create table creator_rewards (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references crowdfunding_campaigns(id) on delete cascade not null,
  amount integer not null check (amount > 0),
  payment_status text not null check (payment_status in ('pending', 'paid')),
  payment_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- creator_rewardsのインデックス作成
create index creator_rewards_campaign_id_idx on creator_rewards (campaign_id);
create index creator_rewards_payment_status_idx on creator_rewards (payment_status);

-- creator_rewardsのRLSポリシー
alter table creator_rewards enable row level security;

create policy "Creator rewards are viewable by everyone" on creator_rewards
  for select using (true);

create policy "Authenticated users can create creator rewards" on creator_rewards
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own creator rewards" on creator_rewards
  for update using (auth.role() = 'authenticated');

-- creator_rewardsの更新日時トリガー
create trigger update_creator_rewards_updated_at
  before update on creator_rewards
  for each row
  execute function update_updated_at_column(); 