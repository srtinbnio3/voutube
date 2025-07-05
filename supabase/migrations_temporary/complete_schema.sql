SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  base_username text;
  generated_handle text;
  counter integer := 1;
begin
  -- 基本となるusernameを取得
  base_username := coalesce(
    (new.raw_user_meta_data->>'name')::text,
    split_part(new.email, '@', 1)
  );
  
  -- 基本usernameが空の場合は'user'を使用
  if base_username is null or trim(base_username) = '' then
    base_username := 'user';
  end if;
  
  -- user_handleを自動生成（user_ + ランダムな8桁の英数字）
  generated_handle := 'user_' || lower(substring(md5(random()::text), 1, 8));
  
  -- user_handleがユニークになるまでループ（念のため）
  while exists (select 1 from public.profiles where user_handle = generated_handle) loop
    generated_handle := 'user_' || lower(substring(md5(random()::text), 1, 8));
    counter := counter + 1;
    
    -- 無限ループ防止（最大100回試行）
    if counter > 100 then
      generated_handle := 'user_' || extract(epoch from now())::bigint;
      exit;
    end if;
  end loop;
  
  insert into public.profiles (id, user_handle, username, avatar_url)
  values (
    new.id,
    generated_handle,
    base_username,
    (new.raw_user_meta_data->>'avatar_url')::text
  );
  return new;
end;
$$;

-- プロフィール自動作成トリガー（auth.usersテーブル用）
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_connection_count"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  connection_count integer;
BEGIN
  SELECT count(*) INTO connection_count
  FROM pg_stat_activity
  WHERE state = 'active';
  
  RETURN connection_count;
END;
$$;

ALTER FUNCTION "public"."get_connection_count"() OWNER TO "postgres";

COMMENT ON FUNCTION "public"."get_connection_count"() IS '現在のアクティブな接続数を返します';

CREATE OR REPLACE FUNCTION "public"."get_db_size"() RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  db_size bigint;
BEGIN
  SELECT pg_database_size(current_database()) INTO db_size;
  RETURN db_size;
END;
$$;

ALTER FUNCTION "public"."get_db_size"() OWNER TO "postgres";

COMMENT ON FUNCTION "public"."get_db_size"() IS 'データベースの合計サイズをバイト単位で返します';

CREATE OR REPLACE FUNCTION "public"."get_slow_queries"() RETURNS TABLE("query" "text", "calls" bigint, "avg_time" double precision, "max_time" double precision, "avg_rows" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."get_slow_queries"() OWNER TO "postgres";

COMMENT ON FUNCTION "public"."get_slow_queries"() IS '遅いクエリのリストを返します（pg_stat_statements拡張が必要です）';

CREATE OR REPLACE FUNCTION "public"."get_table_row_counts"() RETURNS TABLE("table_name" "text", "row_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."get_table_row_counts"() OWNER TO "postgres";

COMMENT ON FUNCTION "public"."get_table_row_counts"() IS '各テーブルの行数を返します';

CREATE OR REPLACE FUNCTION "public"."update_campaign_amount"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."update_campaign_amount"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_channel_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."update_channel_stats"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_post_score"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."update_post_score"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_reward_quantity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;

ALTER FUNCTION "public"."update_reward_quantity"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  -- レコード更新時にupdated_atを現在時刻に設定
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "user_handle" "text" NOT NULL,
    "username" "text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 1)),
    CONSTRAINT "user_handle_length" CHECK (("char_length"("user_handle") >= 1))
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."channels" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "youtube_channel_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "subscriber_count" integer,
    "icon_url" "text",
    "post_count" integer DEFAULT 0,
    "latest_post_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "owner_user_id" "uuid",
    "ownership_verified_at" timestamp with time zone,
    "ownership_verification_expires_at" timestamp with time zone,
    "ownership_verification_method" "text" DEFAULT 'youtube_api',
    "last_ownership_check_at" timestamp with time zone,
    CONSTRAINT "ownership_verification_method_check" CHECK (("ownership_verification_method" = ANY (ARRAY['youtube_api'::"text", 'manual'::"text"])))
);

ALTER TABLE "public"."channels" OWNER TO "postgres";

COMMENT ON COLUMN "public"."channels"."owner_user_id" IS 'チャンネルの所有者のユーザーID（確認済み）';
COMMENT ON COLUMN "public"."channels"."ownership_verified_at" IS '所有権が最後に確認された日時';
COMMENT ON COLUMN "public"."channels"."ownership_verification_expires_at" IS '所有権確認の有効期限（通常は30日後）';
COMMENT ON COLUMN "public"."channels"."ownership_verification_method" IS '所有権確認の方法（youtube_api, manual）';
COMMENT ON COLUMN "public"."channels"."last_ownership_check_at" IS '最後に所有権チェックを実行した日時';

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "mentioned_username" "text",
    "parent_id" "uuid"
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."creator_rewards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "payment_status" "text" NOT NULL,
    "payment_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "creator_rewards_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "creator_rewards_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text"])))
);

ALTER TABLE "public"."creator_rewards" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."crowdfunding_campaigns" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "channel_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "target_amount" integer NOT NULL,
    "current_amount" integer DEFAULT 0,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "status" "text" NOT NULL,
    "reward_enabled" boolean DEFAULT false,
    "bank_account_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "crowdfunding_campaigns_current_amount_check" CHECK (("current_amount" >= 0)),
    CONSTRAINT "crowdfunding_campaigns_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "crowdfunding_campaigns_target_amount_check" CHECK (("target_amount" > 0)),
    CONSTRAINT "description_length" CHECK ((("char_length"("description") >= 10) AND ("char_length"("description") <= 1000))),
    CONSTRAINT "end_date_after_start_date" CHECK (("end_date" > "start_date")),
    CONSTRAINT "title_length" CHECK ((("char_length"("title") >= 3) AND ("char_length"("title") <= 100)))
);

ALTER TABLE "public"."crowdfunding_campaigns" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."crowdfunding_payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "supporter_id" "uuid" NOT NULL,
    "stripe_payment_intent_id" "text" NOT NULL,
    "stripe_customer_id" "text" NOT NULL,
    "amount" integer NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "crowdfunding_payments_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "crowdfunding_payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'succeeded'::"text", 'failed'::"text", 'refunded'::"text"])))
);

ALTER TABLE "public"."crowdfunding_payments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."crowdfunding_rewards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "amount" integer NOT NULL,
    "quantity" integer NOT NULL,
    "remaining_quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "crowdfunding_rewards_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "crowdfunding_rewards_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "crowdfunding_rewards_remaining_quantity_check" CHECK (("remaining_quantity" >= 0)),
    CONSTRAINT "description_length" CHECK ((("char_length"("description") >= 10) AND ("char_length"("description") <= 1000))),
    CONSTRAINT "remaining_quantity_less_than_quantity" CHECK (("remaining_quantity" <= "quantity")),
    CONSTRAINT "title_length" CHECK ((("char_length"("title") >= 3) AND ("char_length"("title") <= 100)))
);

ALTER TABLE "public"."crowdfunding_rewards" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."crowdfunding_supporters" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "payment_status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "crowdfunding_supporters_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "crowdfunding_supporters_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"])))
);

ALTER TABLE "public"."crowdfunding_supporters" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "channel_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "score" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "description_length" CHECK ((("char_length"("description") >= 10) AND ("char_length"("description") <= 1000))),
    CONSTRAINT "title_length" CHECK ((("char_length"("title") >= 3) AND ("char_length"("title") <= 100)))
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "is_upvote" boolean NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE "public"."votes" OWNER TO "postgres";

ALTER TABLE ONLY "public"."channels"
    ADD CONSTRAINT "channels_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."channels"
    ADD CONSTRAINT "channels_youtube_channel_id_key" UNIQUE ("youtube_channel_id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."creator_rewards"
    ADD CONSTRAINT "creator_rewards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."crowdfunding_campaigns"
    ADD CONSTRAINT "crowdfunding_campaigns_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."crowdfunding_payments"
    ADD CONSTRAINT "crowdfunding_payments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."crowdfunding_rewards"
    ADD CONSTRAINT "crowdfunding_rewards_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."crowdfunding_supporters"
    ADD CONSTRAINT "crowdfunding_supporters_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_handle_key" UNIQUE ("user_handle");

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "unique_user_post" UNIQUE ("user_id", "post_id");

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");

CREATE INDEX "channels_latest_post_at_idx" ON "public"."channels" USING "btree" ("latest_post_at" DESC);

CREATE INDEX "channels_post_count_idx" ON "public"."channels" USING "btree" ("post_count" DESC);

CREATE INDEX "channels_youtube_id_idx" ON "public"."channels" USING "btree" ("youtube_channel_id");

CREATE INDEX "idx_channels_owner_user_id" ON "public"."channels" USING "btree" ("owner_user_id");

CREATE INDEX "idx_channels_ownership_expires" ON "public"."channels" USING "btree" ("ownership_verification_expires_at");

CREATE INDEX "creator_rewards_campaign_id_idx" ON "public"."creator_rewards" USING "btree" ("campaign_id");

CREATE INDEX "creator_rewards_payment_status_idx" ON "public"."creator_rewards" USING "btree" ("payment_status");

CREATE INDEX "crowdfunding_campaigns_channel_id_idx" ON "public"."crowdfunding_campaigns" USING "btree" ("channel_id");

CREATE INDEX "crowdfunding_campaigns_dates_idx" ON "public"."crowdfunding_campaigns" USING "btree" ("start_date", "end_date");

CREATE INDEX "crowdfunding_campaigns_status_idx" ON "public"."crowdfunding_campaigns" USING "btree" ("status");

CREATE INDEX "crowdfunding_payments_stripe_payment_intent_id_idx" ON "public"."crowdfunding_payments" USING "btree" ("stripe_payment_intent_id");

CREATE INDEX "crowdfunding_payments_supporter_id_idx" ON "public"."crowdfunding_payments" USING "btree" ("supporter_id");

CREATE INDEX "crowdfunding_rewards_campaign_id_idx" ON "public"."crowdfunding_rewards" USING "btree" ("campaign_id");

CREATE INDEX "crowdfunding_supporters_campaign_id_idx" ON "public"."crowdfunding_supporters" USING "btree" ("campaign_id");

CREATE INDEX "crowdfunding_supporters_user_id_idx" ON "public"."crowdfunding_supporters" USING "btree" ("user_id");

CREATE INDEX "posts_channel_created_idx" ON "public"."posts" USING "btree" ("channel_id", "created_at" DESC);

CREATE INDEX "posts_channel_score_idx" ON "public"."posts" USING "btree" ("channel_id", "score" DESC);

CREATE INDEX "votes_post_id_idx" ON "public"."votes" USING "btree" ("post_id");

CREATE INDEX "comments_parent_id_idx" ON "public"."comments" USING "btree" ("parent_id");

CREATE OR REPLACE TRIGGER "on_post_update_channel_stats" AFTER INSERT OR DELETE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_channel_stats"();

CREATE OR REPLACE TRIGGER "on_supporter_update_campaign_amount" AFTER INSERT OR UPDATE ON "public"."crowdfunding_supporters" FOR EACH ROW EXECUTE FUNCTION "public"."update_campaign_amount"();

CREATE OR REPLACE TRIGGER "on_supporter_update_reward_quantity" AFTER INSERT OR UPDATE ON "public"."crowdfunding_supporters" FOR EACH ROW EXECUTE FUNCTION "public"."update_reward_quantity"();

CREATE OR REPLACE TRIGGER "on_vote_update_score" AFTER INSERT OR DELETE OR UPDATE ON "public"."votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_score"();

CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_creator_rewards_updated_at" BEFORE UPDATE ON "public"."creator_rewards" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."channels"
    ADD CONSTRAINT "channels_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."creator_rewards"
    ADD CONSTRAINT "creator_rewards_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."crowdfunding_campaigns"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_campaigns"
    ADD CONSTRAINT "crowdfunding_campaigns_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_campaigns"
    ADD CONSTRAINT "crowdfunding_campaigns_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_payments"
    ADD CONSTRAINT "crowdfunding_payments_supporter_id_fkey" FOREIGN KEY ("supporter_id") REFERENCES "public"."crowdfunding_supporters"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_rewards"
    ADD CONSTRAINT "crowdfunding_rewards_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."crowdfunding_campaigns"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_supporters"
    ADD CONSTRAINT "crowdfunding_supporters_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."crowdfunding_campaigns"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_supporters"
    ADD CONSTRAINT "crowdfunding_supporters_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "public"."crowdfunding_rewards"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."crowdfunding_supporters"
    ADD CONSTRAINT "crowdfunding_supporters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

CREATE POLICY "Authenticated users can create channels" ON "public"."channels" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Channels are viewable by everyone" ON "public"."channels" FOR SELECT USING (true);

CREATE POLICY "Users can update channels" ON "public"."channels" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "チャンネル所有者のみ所有権情報を更新可能" ON "public"."channels" FOR UPDATE USING (("auth"."uid"() = "owner_user_id"));

CREATE POLICY "Authenticated users can create creator rewards" ON "public"."creator_rewards" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Authenticated users can create posts" ON "public"."posts" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Authenticated users can vote" ON "public"."votes" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Creator rewards are viewable by everyone" ON "public"."creator_rewards" FOR SELECT USING (true);

CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT USING (true);

CREATE POLICY "Profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can delete their own posts" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can delete their own votes" ON "public"."votes" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own creator rewards" ON "public"."creator_rewards" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Users can update their own posts" ON "public"."posts" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "Users can update their own votes" ON "public"."votes" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Votes are viewable by everyone" ON "public"."votes" FOR SELECT USING (true);

ALTER TABLE "public"."channels" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."creator_rewards" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "コメントは全ユーザーが閲覧可能" ON "public"."comments" FOR SELECT USING (true);

CREATE POLICY "自分のコメントのみ削除可能" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "自分のコメントのみ更新可能" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "認証済みユーザーのみコメントを作成可能" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_connection_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_connection_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_connection_count"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_db_size"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_db_size"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_db_size"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_slow_queries"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_slow_queries"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_slow_queries"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_table_row_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_row_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_row_counts"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_campaign_amount"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_amount"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_amount"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_channel_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_channel_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_channel_stats"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_post_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_score"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_reward_quantity"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reward_quantity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reward_quantity"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON TABLE "public"."channels" TO "anon";
GRANT ALL ON TABLE "public"."channels" TO "authenticated";
GRANT ALL ON TABLE "public"."channels" TO "service_role";

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";

GRANT ALL ON TABLE "public"."creator_rewards" TO "anon";
GRANT ALL ON TABLE "public"."creator_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."creator_rewards" TO "service_role";

GRANT ALL ON TABLE "public"."crowdfunding_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."crowdfunding_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."crowdfunding_campaigns" TO "service_role";

GRANT ALL ON TABLE "public"."crowdfunding_payments" TO "anon";
GRANT ALL ON TABLE "public"."crowdfunding_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."crowdfunding_payments" TO "service_role";

GRANT ALL ON TABLE "public"."crowdfunding_rewards" TO "anon";
GRANT ALL ON TABLE "public"."crowdfunding_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."crowdfunding_rewards" TO "service_role";

GRANT ALL ON TABLE "public"."crowdfunding_supporters" TO "anon";
GRANT ALL ON TABLE "public"."crowdfunding_supporters" TO "authenticated";
GRANT ALL ON TABLE "public"."crowdfunding_supporters" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
