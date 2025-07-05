create table "public"."channels" (
    "id" uuid not null default uuid_generate_v4(),
    "youtube_channel_id" text not null,
    "name" text not null,
    "description" text,
    "subscriber_count" integer,
    "icon_url" text,
    "post_count" integer default 0,
    "latest_post_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."channels" enable row level security;

create table "public"."comments" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "mentioned_username" text,
    "parent_id" uuid
);


alter table "public"."comments" enable row level security;

create table "public"."creator_rewards" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "amount" integer not null,
    "payment_status" text not null,
    "payment_date" timestamp with time zone,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."creator_rewards" enable row level security;

create table "public"."crowdfunding_campaigns" (
    "id" uuid not null default uuid_generate_v4(),
    "post_id" uuid not null,
    "channel_id" uuid not null,
    "title" text not null,
    "description" text not null,
    "target_amount" integer not null,
    "current_amount" integer default 0,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "status" text not null,
    "reward_enabled" boolean default false,
    "bank_account_info" jsonb,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


create table "public"."crowdfunding_payments" (
    "id" uuid not null default uuid_generate_v4(),
    "supporter_id" uuid not null,
    "stripe_payment_intent_id" text not null,
    "stripe_customer_id" text not null,
    "amount" integer not null,
    "status" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


create table "public"."crowdfunding_rewards" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "title" text not null,
    "description" text not null,
    "amount" integer not null,
    "quantity" integer not null,
    "remaining_quantity" integer not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


create table "public"."crowdfunding_supporters" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "user_id" uuid not null,
    "reward_id" uuid not null,
    "amount" integer not null,
    "payment_status" text not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


create table "public"."posts" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "channel_id" uuid not null,
    "title" text not null,
    "description" text not null,
    "score" integer default 0,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."posts" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "username" text not null,
    "avatar_url" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."profiles" enable row level security;

create table "public"."votes" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "post_id" uuid not null,
    "is_upvote" boolean not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."votes" enable row level security;

CREATE INDEX channels_latest_post_at_idx ON public.channels USING btree (latest_post_at DESC);

CREATE UNIQUE INDEX channels_pkey ON public.channels USING btree (id);

CREATE INDEX channels_post_count_idx ON public.channels USING btree (post_count DESC);

CREATE UNIQUE INDEX channels_youtube_channel_id_key ON public.channels USING btree (youtube_channel_id);

CREATE INDEX channels_youtube_id_idx ON public.channels USING btree (youtube_channel_id);

CREATE INDEX comments_parent_id_idx ON public.comments USING btree (parent_id);

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE INDEX creator_rewards_campaign_id_idx ON public.creator_rewards USING btree (campaign_id);

CREATE INDEX creator_rewards_payment_status_idx ON public.creator_rewards USING btree (payment_status);

CREATE UNIQUE INDEX creator_rewards_pkey ON public.creator_rewards USING btree (id);

CREATE INDEX crowdfunding_campaigns_channel_id_idx ON public.crowdfunding_campaigns USING btree (channel_id);

CREATE INDEX crowdfunding_campaigns_dates_idx ON public.crowdfunding_campaigns USING btree (start_date, end_date);

CREATE UNIQUE INDEX crowdfunding_campaigns_pkey ON public.crowdfunding_campaigns USING btree (id);

CREATE INDEX crowdfunding_campaigns_status_idx ON public.crowdfunding_campaigns USING btree (status);

CREATE UNIQUE INDEX crowdfunding_payments_pkey ON public.crowdfunding_payments USING btree (id);

CREATE INDEX crowdfunding_payments_stripe_payment_intent_id_idx ON public.crowdfunding_payments USING btree (stripe_payment_intent_id);

CREATE INDEX crowdfunding_payments_supporter_id_idx ON public.crowdfunding_payments USING btree (supporter_id);

CREATE INDEX crowdfunding_rewards_campaign_id_idx ON public.crowdfunding_rewards USING btree (campaign_id);

CREATE UNIQUE INDEX crowdfunding_rewards_pkey ON public.crowdfunding_rewards USING btree (id);

CREATE INDEX crowdfunding_supporters_campaign_id_idx ON public.crowdfunding_supporters USING btree (campaign_id);

CREATE UNIQUE INDEX crowdfunding_supporters_pkey ON public.crowdfunding_supporters USING btree (id);

CREATE INDEX crowdfunding_supporters_user_id_idx ON public.crowdfunding_supporters USING btree (user_id);

CREATE INDEX posts_channel_created_idx ON public.posts USING btree (channel_id, created_at DESC);

CREATE INDEX posts_channel_score_idx ON public.posts USING btree (channel_id, score DESC);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX unique_user_post ON public.votes USING btree (user_id, post_id);

CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id);

CREATE INDEX votes_post_id_idx ON public.votes USING btree (post_id);

alter table "public"."channels" add constraint "channels_pkey" PRIMARY KEY using index "channels_pkey";

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."creator_rewards" add constraint "creator_rewards_pkey" PRIMARY KEY using index "creator_rewards_pkey";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_pkey" PRIMARY KEY using index "crowdfunding_campaigns_pkey";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_pkey" PRIMARY KEY using index "crowdfunding_payments_pkey";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_pkey" PRIMARY KEY using index "crowdfunding_rewards_pkey";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_pkey" PRIMARY KEY using index "crowdfunding_supporters_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."votes" add constraint "votes_pkey" PRIMARY KEY using index "votes_pkey";

alter table "public"."channels" add constraint "channels_youtube_channel_id_key" UNIQUE using index "channels_youtube_channel_id_key";

alter table "public"."comments" add constraint "comments_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_parent_id_fkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."creator_rewards" add constraint "creator_rewards_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."creator_rewards" validate constraint "creator_rewards_amount_check";

alter table "public"."creator_rewards" add constraint "creator_rewards_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."creator_rewards" validate constraint "creator_rewards_campaign_id_fkey";

alter table "public"."creator_rewards" add constraint "creator_rewards_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text]))) not valid;

alter table "public"."creator_rewards" validate constraint "creator_rewards_payment_status_check";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_channel_id_fkey" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_channel_id_fkey";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_current_amount_check" CHECK ((current_amount >= 0)) not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_current_amount_check";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_post_id_fkey";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_status_check";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_target_amount_check" CHECK ((target_amount > 0)) not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_target_amount_check";

alter table "public"."crowdfunding_campaigns" add constraint "description_length" CHECK (((char_length(description) >= 10) AND (char_length(description) <= 1000))) not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "description_length";

alter table "public"."crowdfunding_campaigns" add constraint "end_date_after_start_date" CHECK ((end_date > start_date)) not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "end_date_after_start_date";

alter table "public"."crowdfunding_campaigns" add constraint "title_length" CHECK (((char_length(title) >= 3) AND (char_length(title) <= 100))) not valid;

alter table "public"."crowdfunding_campaigns" validate constraint "title_length";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."crowdfunding_payments" validate constraint "crowdfunding_payments_amount_check";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."crowdfunding_payments" validate constraint "crowdfunding_payments_status_check";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_supporter_id_fkey" FOREIGN KEY (supporter_id) REFERENCES crowdfunding_supporters(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_payments" validate constraint "crowdfunding_payments_supporter_id_fkey";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_amount_check";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_campaign_id_fkey";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_quantity_check";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_remaining_quantity_check" CHECK ((remaining_quantity >= 0)) not valid;

alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_remaining_quantity_check";

alter table "public"."crowdfunding_rewards" add constraint "description_length" CHECK (((char_length(description) >= 10) AND (char_length(description) <= 1000))) not valid;

alter table "public"."crowdfunding_rewards" validate constraint "description_length";

alter table "public"."crowdfunding_rewards" add constraint "remaining_quantity_less_than_quantity" CHECK ((remaining_quantity <= quantity)) not valid;

alter table "public"."crowdfunding_rewards" validate constraint "remaining_quantity_less_than_quantity";

alter table "public"."crowdfunding_rewards" add constraint "title_length" CHECK (((char_length(title) >= 3) AND (char_length(title) <= 100))) not valid;

alter table "public"."crowdfunding_rewards" validate constraint "title_length";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_amount_check";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_campaign_id_fkey";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_payment_status_check";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_reward_id_fkey" FOREIGN KEY (reward_id) REFERENCES crowdfunding_rewards(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_reward_id_fkey";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_user_id_fkey";

alter table "public"."posts" add constraint "description_length" CHECK (((char_length(description) >= 10) AND (char_length(description) <= 1000))) not valid;

alter table "public"."posts" validate constraint "description_length";

alter table "public"."posts" add constraint "posts_channel_id_fkey" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_channel_id_fkey";

alter table "public"."posts" add constraint "posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_user_id_fkey";

alter table "public"."posts" add constraint "title_length" CHECK (((char_length(title) >= 3) AND (char_length(title) <= 100))) not valid;

alter table "public"."posts" validate constraint "title_length";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."profiles" add constraint "username_length" CHECK ((char_length(username) >= 1)) not valid;

alter table "public"."profiles" validate constraint "username_length";

alter table "public"."votes" add constraint "unique_user_post" UNIQUE using index "unique_user_post";

alter table "public"."votes" add constraint "votes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_post_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_connection_count()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  connection_count integer;
BEGIN
  SELECT count(*) INTO connection_count
  FROM pg_stat_activity
  WHERE state = 'active';
  
  RETURN connection_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_db_size()
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  db_size bigint;
BEGIN
  SELECT pg_database_size(current_database()) INTO db_size;
  RETURN db_size;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_slow_queries()
 RETURNS TABLE(query text, calls bigint, avg_time double precision, max_time double precision, avg_rows bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- pg_stat_statementsが存在するか確認
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    RETURN QUERY
    SELECT 
      pg_stat_statements.query,
      pg_stat_statements.calls,
      pg_stat_statements.total_time / pg_stat_statements.calls as avg_time,
      pg_stat_statements.max_time,
      pg_stat_statements.rows / pg_stat_statements.calls as avg_rows
    FROM pg_stat_statements
    WHERE pg_stat_statements.calls > 10  -- 10回以上実行されたクエリに限定
    AND pg_stat_statements.total_time / pg_stat_statements.calls > 1000  -- 平均1秒以上かかるクエリ
    ORDER BY avg_time DESC
    LIMIT 10;
  ELSE
    -- pg_stat_statementsがない場合は空の結果を返す
    RETURN QUERY
    SELECT 
      'pg_stat_statements extension is not installed'::text,
      0::bigint,
      0::double precision,
      0::double precision,
      0::bigint
    LIMIT 0;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_table_row_counts()
 RETURNS TABLE(table_name text, row_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    relname::text, 
    CASE 
      WHEN reltuples < 1000 THEN (SELECT count(*) FROM pg_catalog.pg_class c WHERE c.relname = relname)::bigint
      ELSE reltuples::bigint
    END as row_count
  FROM pg_class
  WHERE relkind = 'r' 
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND relname NOT LIKE 'pg_%'
    AND relname NOT LIKE '_%;'
  ORDER BY row_count DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_campaign_amount()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if (TG_OP = 'INSERT' and new.status = 'completed') then
    -- 新規支援完了時：支援金額を加算
    update crowdfunding_campaigns
    set current_amount = current_amount + new.amount
    where id = new.campaign_id;
  elsif (TG_OP = 'UPDATE' and old.status != 'completed' and new.status = 'completed') then
    -- 支援ステータスが完了に変更時：支援金額を加算
    update crowdfunding_campaigns
    set current_amount = current_amount + new.amount
    where id = new.campaign_id;
  elsif (TG_OP = 'UPDATE' and old.status = 'completed' and new.status != 'completed') then
    -- 支援ステータスが完了から変更時：支援金額を減算
    update crowdfunding_campaigns
    set current_amount = current_amount - old.amount
    where id = old.campaign_id;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_channel_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if (TG_OP = 'INSERT') then
    -- 新規投稿時：投稿数を+1し、最新投稿日時を更新
    update channels
    set post_count = post_count + 1,
        latest_post_at = new.created_at
    where id = new.channel_id;
  elsif (TG_OP = 'DELETE') then
    -- 投稿削除時：投稿数を-1し、最新投稿日時を更新（残りの投稿の中で最新のもの）
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_post_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- 投票の変更時に投稿のスコアを再計算
  update posts
  set score = (
    select count(case when is_upvote then 1 end) - count(case when not is_upvote then 1 end)
    from votes
    where post_id = coalesce(new.post_id, old.post_id)
  )
  where id = coalesce(new.post_id, old.post_id);
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_reward_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  if (TG_OP = 'INSERT' and new.status = 'completed') then
    -- 新規支援完了時：リワード残数を-1
    update crowdfunding_rewards
    set remaining_quantity = remaining_quantity - 1
    where id = new.reward_id;
  elsif (TG_OP = 'UPDATE' and old.status != 'completed' and new.status = 'completed') then
    -- 支援ステータスが完了に変更時：リワード残数を-1
    update crowdfunding_rewards
    set remaining_quantity = remaining_quantity - 1
    where id = new.reward_id;
  elsif (TG_OP = 'UPDATE' and old.status = 'completed' and new.status != 'completed') then
    -- 支援ステータスが完了から変更時：リワード残数を+1
    update crowdfunding_rewards
    set remaining_quantity = remaining_quantity + 1
    where id = old.reward_id;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- レコード更新時にupdated_atを現在時刻に設定
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$
;

grant delete on table "public"."channels" to "anon";

grant insert on table "public"."channels" to "anon";

grant references on table "public"."channels" to "anon";

grant select on table "public"."channels" to "anon";

grant trigger on table "public"."channels" to "anon";

grant truncate on table "public"."channels" to "anon";

grant update on table "public"."channels" to "anon";

grant delete on table "public"."channels" to "authenticated";

grant insert on table "public"."channels" to "authenticated";

grant references on table "public"."channels" to "authenticated";

grant select on table "public"."channels" to "authenticated";

grant trigger on table "public"."channels" to "authenticated";

grant truncate on table "public"."channels" to "authenticated";

grant update on table "public"."channels" to "authenticated";

grant delete on table "public"."channels" to "service_role";

grant insert on table "public"."channels" to "service_role";

grant references on table "public"."channels" to "service_role";

grant select on table "public"."channels" to "service_role";

grant trigger on table "public"."channels" to "service_role";

grant truncate on table "public"."channels" to "service_role";

grant update on table "public"."channels" to "service_role";

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."creator_rewards" to "anon";

grant insert on table "public"."creator_rewards" to "anon";

grant references on table "public"."creator_rewards" to "anon";

grant select on table "public"."creator_rewards" to "anon";

grant trigger on table "public"."creator_rewards" to "anon";

grant truncate on table "public"."creator_rewards" to "anon";

grant update on table "public"."creator_rewards" to "anon";

grant delete on table "public"."creator_rewards" to "authenticated";

grant insert on table "public"."creator_rewards" to "authenticated";

grant references on table "public"."creator_rewards" to "authenticated";

grant select on table "public"."creator_rewards" to "authenticated";

grant trigger on table "public"."creator_rewards" to "authenticated";

grant truncate on table "public"."creator_rewards" to "authenticated";

grant update on table "public"."creator_rewards" to "authenticated";

grant delete on table "public"."creator_rewards" to "service_role";

grant insert on table "public"."creator_rewards" to "service_role";

grant references on table "public"."creator_rewards" to "service_role";

grant select on table "public"."creator_rewards" to "service_role";

grant trigger on table "public"."creator_rewards" to "service_role";

grant truncate on table "public"."creator_rewards" to "service_role";

grant update on table "public"."creator_rewards" to "service_role";

grant delete on table "public"."crowdfunding_campaigns" to "anon";

grant insert on table "public"."crowdfunding_campaigns" to "anon";

grant references on table "public"."crowdfunding_campaigns" to "anon";

grant select on table "public"."crowdfunding_campaigns" to "anon";

grant trigger on table "public"."crowdfunding_campaigns" to "anon";

grant truncate on table "public"."crowdfunding_campaigns" to "anon";

grant update on table "public"."crowdfunding_campaigns" to "anon";

grant delete on table "public"."crowdfunding_campaigns" to "authenticated";

grant insert on table "public"."crowdfunding_campaigns" to "authenticated";

grant references on table "public"."crowdfunding_campaigns" to "authenticated";

grant select on table "public"."crowdfunding_campaigns" to "authenticated";

grant trigger on table "public"."crowdfunding_campaigns" to "authenticated";

grant truncate on table "public"."crowdfunding_campaigns" to "authenticated";

grant update on table "public"."crowdfunding_campaigns" to "authenticated";

grant delete on table "public"."crowdfunding_campaigns" to "service_role";

grant insert on table "public"."crowdfunding_campaigns" to "service_role";

grant references on table "public"."crowdfunding_campaigns" to "service_role";

grant select on table "public"."crowdfunding_campaigns" to "service_role";

grant trigger on table "public"."crowdfunding_campaigns" to "service_role";

grant truncate on table "public"."crowdfunding_campaigns" to "service_role";

grant update on table "public"."crowdfunding_campaigns" to "service_role";

grant delete on table "public"."crowdfunding_payments" to "anon";

grant insert on table "public"."crowdfunding_payments" to "anon";

grant references on table "public"."crowdfunding_payments" to "anon";

grant select on table "public"."crowdfunding_payments" to "anon";

grant trigger on table "public"."crowdfunding_payments" to "anon";

grant truncate on table "public"."crowdfunding_payments" to "anon";

grant update on table "public"."crowdfunding_payments" to "anon";

grant delete on table "public"."crowdfunding_payments" to "authenticated";

grant insert on table "public"."crowdfunding_payments" to "authenticated";

grant references on table "public"."crowdfunding_payments" to "authenticated";

grant select on table "public"."crowdfunding_payments" to "authenticated";

grant trigger on table "public"."crowdfunding_payments" to "authenticated";

grant truncate on table "public"."crowdfunding_payments" to "authenticated";

grant update on table "public"."crowdfunding_payments" to "authenticated";

grant delete on table "public"."crowdfunding_payments" to "service_role";

grant insert on table "public"."crowdfunding_payments" to "service_role";

grant references on table "public"."crowdfunding_payments" to "service_role";

grant select on table "public"."crowdfunding_payments" to "service_role";

grant trigger on table "public"."crowdfunding_payments" to "service_role";

grant truncate on table "public"."crowdfunding_payments" to "service_role";

grant update on table "public"."crowdfunding_payments" to "service_role";

grant delete on table "public"."crowdfunding_rewards" to "anon";

grant insert on table "public"."crowdfunding_rewards" to "anon";

grant references on table "public"."crowdfunding_rewards" to "anon";

grant select on table "public"."crowdfunding_rewards" to "anon";

grant trigger on table "public"."crowdfunding_rewards" to "anon";

grant truncate on table "public"."crowdfunding_rewards" to "anon";

grant update on table "public"."crowdfunding_rewards" to "anon";

grant delete on table "public"."crowdfunding_rewards" to "authenticated";

grant insert on table "public"."crowdfunding_rewards" to "authenticated";

grant references on table "public"."crowdfunding_rewards" to "authenticated";

grant select on table "public"."crowdfunding_rewards" to "authenticated";

grant trigger on table "public"."crowdfunding_rewards" to "authenticated";

grant truncate on table "public"."crowdfunding_rewards" to "authenticated";

grant update on table "public"."crowdfunding_rewards" to "authenticated";

grant delete on table "public"."crowdfunding_rewards" to "service_role";

grant insert on table "public"."crowdfunding_rewards" to "service_role";

grant references on table "public"."crowdfunding_rewards" to "service_role";

grant select on table "public"."crowdfunding_rewards" to "service_role";

grant trigger on table "public"."crowdfunding_rewards" to "service_role";

grant truncate on table "public"."crowdfunding_rewards" to "service_role";

grant update on table "public"."crowdfunding_rewards" to "service_role";

grant delete on table "public"."crowdfunding_supporters" to "anon";

grant insert on table "public"."crowdfunding_supporters" to "anon";

grant references on table "public"."crowdfunding_supporters" to "anon";

grant select on table "public"."crowdfunding_supporters" to "anon";

grant trigger on table "public"."crowdfunding_supporters" to "anon";

grant truncate on table "public"."crowdfunding_supporters" to "anon";

grant update on table "public"."crowdfunding_supporters" to "anon";

grant delete on table "public"."crowdfunding_supporters" to "authenticated";

grant insert on table "public"."crowdfunding_supporters" to "authenticated";

grant references on table "public"."crowdfunding_supporters" to "authenticated";

grant select on table "public"."crowdfunding_supporters" to "authenticated";

grant trigger on table "public"."crowdfunding_supporters" to "authenticated";

grant truncate on table "public"."crowdfunding_supporters" to "authenticated";

grant update on table "public"."crowdfunding_supporters" to "authenticated";

grant delete on table "public"."crowdfunding_supporters" to "service_role";

grant insert on table "public"."crowdfunding_supporters" to "service_role";

grant references on table "public"."crowdfunding_supporters" to "service_role";

grant select on table "public"."crowdfunding_supporters" to "service_role";

grant trigger on table "public"."crowdfunding_supporters" to "service_role";

grant truncate on table "public"."crowdfunding_supporters" to "service_role";

grant update on table "public"."crowdfunding_supporters" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."votes" to "anon";

grant insert on table "public"."votes" to "anon";

grant references on table "public"."votes" to "anon";

grant select on table "public"."votes" to "anon";

grant trigger on table "public"."votes" to "anon";

grant truncate on table "public"."votes" to "anon";

grant update on table "public"."votes" to "anon";

grant delete on table "public"."votes" to "authenticated";

grant insert on table "public"."votes" to "authenticated";

grant references on table "public"."votes" to "authenticated";

grant select on table "public"."votes" to "authenticated";

grant trigger on table "public"."votes" to "authenticated";

grant truncate on table "public"."votes" to "authenticated";

grant update on table "public"."votes" to "authenticated";

grant delete on table "public"."votes" to "service_role";

grant insert on table "public"."votes" to "service_role";

grant references on table "public"."votes" to "service_role";

grant select on table "public"."votes" to "service_role";

grant trigger on table "public"."votes" to "service_role";

grant truncate on table "public"."votes" to "service_role";

grant update on table "public"."votes" to "service_role";

create policy "Authenticated users can create channels"
on "public"."channels"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Channels are viewable by everyone"
on "public"."channels"
as permissive
for select
to public
using (true);


create policy "Users can update channels"
on "public"."channels"
as permissive
for update
to public
using ((auth.role() = 'authenticated'::text));


create policy "コメントは全ユーザーが閲覧可能"
on "public"."comments"
as permissive
for select
to public
using (true);


create policy "自分のコメントのみ削除可能"
on "public"."comments"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "自分のコメントのみ更新可能"
on "public"."comments"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "認証済みユーザーのみコメントを作成可能"
on "public"."comments"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Authenticated users can create creator rewards"
on "public"."creator_rewards"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Creator rewards are viewable by everyone"
on "public"."creator_rewards"
as permissive
for select
to public
using (true);


create policy "Users can update their own creator rewards"
on "public"."creator_rewards"
as permissive
for update
to public
using ((auth.role() = 'authenticated'::text));


create policy "Authenticated users can create posts"
on "public"."posts"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Posts are viewable by everyone"
on "public"."posts"
as permissive
for select
to public
using (true);


create policy "Users can delete their own posts"
on "public"."posts"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own posts"
on "public"."posts"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Profiles are viewable by everyone"
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Users can create their own profile"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id));


create policy "Authenticated users can vote"
on "public"."votes"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Users can delete their own votes"
on "public"."votes"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their own votes"
on "public"."votes"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Votes are viewable by everyone"
on "public"."votes"
as permissive
for select
to public
using (true);


CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_rewards_updated_at BEFORE UPDATE ON public.creator_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_supporter_update_campaign_amount AFTER INSERT OR UPDATE ON public.crowdfunding_supporters FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

CREATE TRIGGER on_supporter_update_reward_quantity AFTER INSERT OR UPDATE ON public.crowdfunding_supporters FOR EACH ROW EXECUTE FUNCTION update_reward_quantity();

CREATE TRIGGER on_post_update_channel_stats AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_channel_stats();

CREATE TRIGGER on_vote_update_score AFTER INSERT OR DELETE OR UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION update_post_score();


