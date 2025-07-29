-- クラウドファンディング機能のテーブル作成
-- 作成日時: 2025-07-12
-- 概要: クラウドファンディング機能に必要なテーブルと関数を追加

-- creator_rewards テーブル（クリエイター報酬）
create table "public"."creator_rewards" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "amount" integer not null,
    "payment_status" text not null,
    "payment_date" timestamp with time zone,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);

-- RLS（Row Level Security）を有効化
alter table "public"."creator_rewards" enable row level security;

-- crowdfunding_campaigns テーブル（クラウドファンディングキャンペーン）
create table "public"."crowdfunding_campaigns" (
    "id" uuid not null default uuid_generate_v4(),
    "post_id" uuid not null,
    "channel_id" uuid not null,
    "title" text not null,
    "description" text not null,
    "story" text,
    "target_amount" integer not null,
    "current_amount" integer default 0,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone not null,
    "status" text not null,
    "reward_enabled" boolean default false,
    "bank_account_info" jsonb,
    "main_image" text,
    "thumbnail_image" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);

-- RLSを有効化
alter table "public"."crowdfunding_campaigns" enable row level security;

-- crowdfunding_payments テーブル（支払い情報）
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

-- RLSを有効化
alter table "public"."crowdfunding_payments" enable row level security;

-- crowdfunding_rewards テーブル（特典）
create table "public"."crowdfunding_rewards" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "title" text not null,
    "description" text not null,
    "amount" integer not null,
    "quantity" integer not null,
    "remaining_quantity" integer not null,
    "delivery_date" text,
    "requires_shipping" boolean default false,
    "shipping_info" text,
    "images" jsonb default '[]'::jsonb,
    "template" text,
    "is_unlimited" boolean default false,
    "requires_contact_info" boolean default false,
    "requires_email" boolean default false,
    "requires_address" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);

-- RLSを有効化
alter table "public"."crowdfunding_rewards" enable row level security;

-- crowdfunding_supporters テーブル（支援者）
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

-- RLSを有効化
alter table "public"."crowdfunding_supporters" enable row level security;

-- ===============================
-- インデックス作成
-- ===============================

-- creator_rewards用インデックス
CREATE INDEX creator_rewards_campaign_id_idx ON public.creator_rewards USING btree (campaign_id);
CREATE INDEX creator_rewards_payment_status_idx ON public.creator_rewards USING btree (payment_status);
CREATE UNIQUE INDEX creator_rewards_pkey ON public.creator_rewards USING btree (id);

-- crowdfunding_campaigns用インデックス
CREATE INDEX crowdfunding_campaigns_channel_id_idx ON public.crowdfunding_campaigns USING btree (channel_id);
CREATE INDEX crowdfunding_campaigns_dates_idx ON public.crowdfunding_campaigns USING btree (start_date, end_date);
CREATE UNIQUE INDEX crowdfunding_campaigns_pkey ON public.crowdfunding_campaigns USING btree (id);
CREATE INDEX crowdfunding_campaigns_status_idx ON public.crowdfunding_campaigns USING btree (status);

-- crowdfunding_payments用インデックス
CREATE UNIQUE INDEX crowdfunding_payments_pkey ON public.crowdfunding_payments USING btree (id);
CREATE INDEX crowdfunding_payments_stripe_payment_intent_id_idx ON public.crowdfunding_payments USING btree (stripe_payment_intent_id);
CREATE INDEX crowdfunding_payments_supporter_id_idx ON public.crowdfunding_payments USING btree (supporter_id);

-- crowdfunding_rewards用インデックス
CREATE INDEX crowdfunding_rewards_campaign_id_idx ON public.crowdfunding_rewards USING btree (campaign_id);
CREATE UNIQUE INDEX crowdfunding_rewards_pkey ON public.crowdfunding_rewards USING btree (id);
CREATE INDEX crowdfunding_rewards_delivery_date_idx ON public.crowdfunding_rewards USING btree (delivery_date);
CREATE INDEX crowdfunding_rewards_is_unlimited_idx ON public.crowdfunding_rewards USING btree (is_unlimited);
CREATE INDEX crowdfunding_rewards_requires_contact_info_idx ON public.crowdfunding_rewards USING btree (requires_contact_info);
CREATE INDEX crowdfunding_rewards_requires_email_idx ON public.crowdfunding_rewards USING btree (requires_email);
CREATE INDEX crowdfunding_rewards_requires_address_idx ON public.crowdfunding_rewards USING btree (requires_address);

-- crowdfunding_supporters用インデックス
CREATE INDEX crowdfunding_supporters_campaign_id_idx ON public.crowdfunding_supporters USING btree (campaign_id);
CREATE UNIQUE INDEX crowdfunding_supporters_pkey ON public.crowdfunding_supporters USING btree (id);
CREATE INDEX crowdfunding_supporters_user_id_idx ON public.crowdfunding_supporters USING btree (user_id);

-- ===============================
-- 主キー制約
-- ===============================

alter table "public"."creator_rewards" add constraint "creator_rewards_pkey" PRIMARY KEY using index "creator_rewards_pkey";
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_pkey" PRIMARY KEY using index "crowdfunding_campaigns_pkey";
alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_pkey" PRIMARY KEY using index "crowdfunding_payments_pkey";
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_pkey" PRIMARY KEY using index "crowdfunding_rewards_pkey";
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_pkey" PRIMARY KEY using index "crowdfunding_supporters_pkey";

-- ===============================
-- 外部キー制約
-- ===============================

-- creator_rewards外部キー
alter table "public"."creator_rewards" add constraint "creator_rewards_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE;

-- crowdfunding_campaigns外部キー
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_channel_id_fkey" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE;
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- crowdfunding_payments外部キー
alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_supporter_id_fkey" FOREIGN KEY (supporter_id) REFERENCES crowdfunding_supporters(id) ON DELETE CASCADE;

-- crowdfunding_rewards外部キー
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE;

-- crowdfunding_supporters外部キー
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE;
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_reward_id_fkey" FOREIGN KEY (reward_id) REFERENCES crowdfunding_rewards(id) ON DELETE CASCADE;
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ===============================
-- チェック制約
-- ===============================

-- creator_rewards制約
alter table "public"."creator_rewards" add constraint "creator_rewards_amount_check" CHECK ((amount > 0));
alter table "public"."creator_rewards" add constraint "creator_rewards_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text])));

-- crowdfunding_campaigns制約
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_current_amount_check" CHECK ((current_amount >= 0));
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text, 'cancelled'::text])));
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_target_amount_check" CHECK ((target_amount > 0));
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_description_length" CHECK ((char_length(description) >= 10));
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_end_date_after_start_date" CHECK ((end_date > start_date));
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_title_length" CHECK ((char_length(title) >= 1));
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_story_length" CHECK ((story IS NULL OR char_length(story) <= 20000));

-- crowdfunding_payments制約
alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_amount_check" CHECK ((amount > 0));
alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])));

-- crowdfunding_rewards制約
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_amount_check" CHECK ((amount > 0));
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_quantity_check" CHECK ((quantity > 0));
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_remaining_quantity_check" CHECK ((remaining_quantity >= 0));
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_description_length" CHECK ((char_length(description) >= 1));
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_remaining_quantity_less_than_quantity" CHECK ((remaining_quantity <= quantity));
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_title_length" CHECK ((char_length(title) >= 1));
alter table "public"."crowdfunding_rewards" add constraint "delivery_date_format" CHECK ((delivery_date IS NULL OR delivery_date ~ '^[0-9]{4}-[0-9]{2}$'));

-- crowdfunding_supporters制約
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_amount_check" CHECK ((amount > 0));
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text])));

-- ===============================
-- 関数作成
-- ===============================

-- キャンペーン金額更新関数
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- 支援者のpayment_statusが'completed'のもののみ合計して current_amount を更新
  update crowdfunding_campaigns
  set current_amount = (
    select coalesce(sum(amount), 0)
    from crowdfunding_supporters
    where campaign_id = coalesce(new.campaign_id, old.campaign_id)
    and payment_status = 'completed'
  ),
  updated_at = timezone('utc'::text, now())
  where id = coalesce(new.campaign_id, old.campaign_id);
  return null;
end;
$function$;

-- 特典数量更新関数
CREATE OR REPLACE FUNCTION public.update_reward_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- 支援者のpayment_statusが'completed'のもののみカウントして remaining_quantity を更新
  update crowdfunding_rewards
  set remaining_quantity = quantity - (
    select coalesce(count(*), 0)
    from crowdfunding_supporters
    where reward_id = coalesce(new.reward_id, old.reward_id)
    and payment_status = 'completed'
  ),
  updated_at = timezone('utc'::text, now())
  where id = coalesce(new.reward_id, old.reward_id);
  return null;
end;
$function$;

-- ===============================
-- トリガー作成
-- ===============================

-- updated_atカラムを更新するトリガー
CREATE OR REPLACE TRIGGER update_creator_rewards_updated_at 
    BEFORE UPDATE ON public.creator_rewards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crowdfunding_campaigns_updated_at 
    BEFORE UPDATE ON public.crowdfunding_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crowdfunding_payments_updated_at 
    BEFORE UPDATE ON public.crowdfunding_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crowdfunding_rewards_updated_at 
    BEFORE UPDATE ON public.crowdfunding_rewards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_crowdfunding_supporters_updated_at 
    BEFORE UPDATE ON public.crowdfunding_supporters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- キャンペーン金額を自動更新するトリガー
CREATE OR REPLACE TRIGGER on_supporter_update_campaign_amount 
    AFTER INSERT OR UPDATE OF payment_status OR DELETE ON public.crowdfunding_supporters 
    FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

-- 特典数量を自動更新するトリガー
CREATE OR REPLACE TRIGGER on_supporter_update_reward_quantity 
    AFTER INSERT OR UPDATE OF payment_status OR DELETE ON public.crowdfunding_supporters 
    FOR EACH ROW EXECUTE FUNCTION update_reward_quantity();

-- ===============================
-- RLS（Row Level Security）ポリシー
-- ===============================

-- crowdfunding_campaigns のポリシー
CREATE POLICY "キャンペーンは全ユーザーが閲覧可能" ON "public"."crowdfunding_campaigns" FOR SELECT USING (true);
CREATE POLICY "認証済みユーザーはキャンペーンを作成可能" ON "public"."crowdfunding_campaigns" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "キャンペーン作成者のみ更新可能" ON "public"."crowdfunding_campaigns" FOR UPDATE USING (auth.uid() IN (SELECT owner_user_id FROM channels WHERE channels.id = crowdfunding_campaigns.channel_id));
CREATE POLICY "キャンペーン作成者のみ削除可能" ON "public"."crowdfunding_campaigns" FOR DELETE USING (auth.uid() IN (SELECT owner_user_id FROM channels WHERE channels.id = crowdfunding_campaigns.channel_id));

-- crowdfunding_rewards のポリシー
CREATE POLICY "特典は全ユーザーが閲覧可能" ON "public"."crowdfunding_rewards" FOR SELECT USING (true);
CREATE POLICY "認証済みユーザーは特典を作成可能" ON "public"."crowdfunding_rewards" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "キャンペーン作成者のみ特典を更新可能" ON "public"."crowdfunding_rewards" FOR UPDATE USING (auth.uid() IN (SELECT owner_user_id FROM channels WHERE channels.id = (SELECT channel_id FROM crowdfunding_campaigns WHERE crowdfunding_campaigns.id = crowdfunding_rewards.campaign_id)));
CREATE POLICY "キャンペーン作成者のみ特典を削除可能" ON "public"."crowdfunding_rewards" FOR DELETE USING (auth.uid() IN (SELECT owner_user_id FROM channels WHERE channels.id = (SELECT channel_id FROM crowdfunding_campaigns WHERE crowdfunding_campaigns.id = crowdfunding_rewards.campaign_id)));

-- crowdfunding_supporters のポリシー
CREATE POLICY "支援者情報は全ユーザーが閲覧可能" ON "public"."crowdfunding_supporters" FOR SELECT USING (true);
CREATE POLICY "認証済みユーザーは支援可能" ON "public"."crowdfunding_supporters" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "支援者本人のみ更新可能" ON "public"."crowdfunding_supporters" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "支援者本人のみ削除可能" ON "public"."crowdfunding_supporters" FOR DELETE USING (auth.uid() = user_id);

-- crowdfunding_payments のポリシー
CREATE POLICY "支払い情報は本人のみ閲覧可能" ON "public"."crowdfunding_payments" FOR SELECT USING (auth.uid() = (SELECT user_id FROM crowdfunding_supporters WHERE crowdfunding_supporters.id = crowdfunding_payments.supporter_id));
CREATE POLICY "認証済みユーザーは支払い情報を作成可能" ON "public"."crowdfunding_payments" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "支払い情報は本人のみ更新可能" ON "public"."crowdfunding_payments" FOR UPDATE USING (auth.uid() = (SELECT user_id FROM crowdfunding_supporters WHERE crowdfunding_supporters.id = crowdfunding_payments.supporter_id));

-- creator_rewards のポリシー
CREATE POLICY "クリエイター報酬は本人のみ閲覧可能" ON "public"."creator_rewards" FOR SELECT USING (auth.uid() IN (SELECT owner_user_id FROM channels WHERE channels.id = (SELECT channel_id FROM crowdfunding_campaigns WHERE crowdfunding_campaigns.id = creator_rewards.campaign_id)));
CREATE POLICY "認証済みユーザーはクリエイター報酬を作成可能" ON "public"."creator_rewards" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "クリエイター報酬は本人のみ更新可能" ON "public"."creator_rewards" FOR UPDATE USING (auth.uid() IN (SELECT owner_user_id FROM channels WHERE channels.id = (SELECT channel_id FROM crowdfunding_campaigns WHERE crowdfunding_campaigns.id = creator_rewards.campaign_id)));

-- ===============================
-- カラムコメント
-- ===============================

-- crowdfunding_campaigns カラムコメント
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."story" IS 'プロジェクトの詳細なストーリー・説明（HTML形式）';
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."main_image" IS 'プロジェクトのメイン画像URL（推奨サイズ: 1280×720px）';
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."thumbnail_image" IS 'プロジェクトのサムネイル画像URL（推奨サイズ: 400×300px）';

-- crowdfunding_rewards カラムコメント
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_contact_info" IS '支援者の情報が必要かどうか（氏名・連絡先など）';
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_email" IS 'メールアドレスの取得が必要かどうか';
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_address" IS '住所・氏名・電話番号の取得が必要かどうか';

-- コメント: このマイグレーションファイルは、クラウドファンディング機能に必要な全てのテーブル、制約、関数、トリガー、RLSポリシーを作成します。
-- 各テーブルには適切なインデックスが設定され、データの整合性を保つためのチェック制約も含まれています。
-- RLSポリシーにより、適切な権限管理が行われます。 