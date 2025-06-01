-- クラウドファンディング機能のテーブル作成

-- creator_rewards テーブル
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

-- crowdfunding_campaigns テーブル
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

-- crowdfunding_payments テーブル
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

-- crowdfunding_rewards テーブル
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

-- crowdfunding_supporters テーブル
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

-- インデックス作成
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

-- 主キー制約
alter table "public"."creator_rewards" add constraint "creator_rewards_pkey" PRIMARY KEY using index "creator_rewards_pkey";
alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_pkey" PRIMARY KEY using index "crowdfunding_campaigns_pkey";
alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_pkey" PRIMARY KEY using index "crowdfunding_payments_pkey";
alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_pkey" PRIMARY KEY using index "crowdfunding_rewards_pkey";
alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_pkey" PRIMARY KEY using index "crowdfunding_supporters_pkey";

-- 外部キー制約
alter table "public"."creator_rewards" add constraint "creator_rewards_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE not valid;
alter table "public"."creator_rewards" validate constraint "creator_rewards_campaign_id_fkey";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_channel_id_fkey" FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_channel_id_fkey";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_post_id_fkey";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_supporter_id_fkey" FOREIGN KEY (supporter_id) REFERENCES crowdfunding_supporters(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_payments" validate constraint "crowdfunding_payments_supporter_id_fkey";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_campaign_id_fkey";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_campaign_id_fkey";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_reward_id_fkey" FOREIGN KEY (reward_id) REFERENCES crowdfunding_rewards(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_reward_id_fkey";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;
alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_user_id_fkey";

-- チェック制約
alter table "public"."creator_rewards" add constraint "creator_rewards_amount_check" CHECK ((amount > 0)) not valid;
alter table "public"."creator_rewards" validate constraint "creator_rewards_amount_check";

alter table "public"."creator_rewards" add constraint "creator_rewards_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;
alter table "public"."creator_rewards" validate constraint "creator_rewards_payment_status_check";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_current_amount_check" CHECK ((current_amount >= 0)) not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_current_amount_check";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'completed'::text, 'cancelled'::text]))) not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_status_check";

alter table "public"."crowdfunding_campaigns" add constraint "crowdfunding_campaigns_target_amount_check" CHECK ((target_amount > 0)) not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "crowdfunding_campaigns_target_amount_check";

alter table "public"."crowdfunding_campaigns" add constraint "description_length" CHECK ((char_length(description) >= 10)) not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "description_length";

alter table "public"."crowdfunding_campaigns" add constraint "end_date_after_start_date" CHECK ((end_date > start_date)) not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "end_date_after_start_date";

alter table "public"."crowdfunding_campaigns" add constraint "title_length" CHECK ((char_length(title) >= 1)) not valid;
alter table "public"."crowdfunding_campaigns" validate constraint "title_length";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_amount_check" CHECK ((amount > 0)) not valid;
alter table "public"."crowdfunding_payments" validate constraint "crowdfunding_payments_amount_check";

alter table "public"."crowdfunding_payments" add constraint "crowdfunding_payments_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;
alter table "public"."crowdfunding_payments" validate constraint "crowdfunding_payments_status_check";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_amount_check" CHECK ((amount > 0)) not valid;
alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_amount_check";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_quantity_check" CHECK ((quantity > 0)) not valid;
alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_quantity_check";

alter table "public"."crowdfunding_rewards" add constraint "crowdfunding_rewards_remaining_quantity_check" CHECK ((remaining_quantity >= 0)) not valid;
alter table "public"."crowdfunding_rewards" validate constraint "crowdfunding_rewards_remaining_quantity_check";

alter table "public"."crowdfunding_rewards" add constraint "description_length" CHECK ((char_length(description) >= 1)) not valid;
alter table "public"."crowdfunding_rewards" validate constraint "description_length";

alter table "public"."crowdfunding_rewards" add constraint "remaining_quantity_less_than_quantity" CHECK ((remaining_quantity <= quantity)) not valid;
alter table "public"."crowdfunding_rewards" validate constraint "remaining_quantity_less_than_quantity";

alter table "public"."crowdfunding_rewards" add constraint "title_length" CHECK ((char_length(title) >= 1)) not valid;
alter table "public"."crowdfunding_rewards" validate constraint "title_length";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_amount_check" CHECK ((amount > 0)) not valid;
alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_amount_check";

alter table "public"."crowdfunding_supporters" add constraint "crowdfunding_supporters_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;
alter table "public"."crowdfunding_supporters" validate constraint "crowdfunding_supporters_payment_status_check";

-- 関数作成
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
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

CREATE OR REPLACE FUNCTION public.update_reward_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
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

-- トリガー作成
CREATE TRIGGER update_creator_rewards_updated_at BEFORE UPDATE ON public.creator_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_supporter_update_campaign_amount AFTER INSERT OR UPDATE OF payment_status OR DELETE ON public.crowdfunding_supporters FOR EACH ROW EXECUTE FUNCTION update_campaign_amount();

CREATE TRIGGER on_supporter_update_reward_quantity AFTER INSERT OR UPDATE OF payment_status OR DELETE ON public.crowdfunding_supporters FOR EACH ROW EXECUTE FUNCTION update_reward_quantity();

-- RLS ポリシー
CREATE POLICY "Authenticated users can create creator rewards" ON public.creator_rewards FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Creator rewards are viewable by everyone" ON public.creator_rewards FOR SELECT USING (true);

CREATE POLICY "Users can update their own creator rewards" ON public.creator_rewards FOR UPDATE TO authenticated USING (true);
