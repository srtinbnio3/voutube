-- プロジェクト振り込み管理機能の追加
-- 作成日時: 2025-08-27 18:53:31 JST
-- 概要: プロジェクト実施者と企画者への振り込み管理機能を追加

-- プロジェクト実施者への振り込み管理テーブル
CREATE TABLE "public"."project_payouts" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "campaign_id" uuid NOT NULL,
    "gross_amount" integer NOT NULL,           -- 総支援額
    "platform_fee" integer NOT NULL,          -- 運営手数料（9%）
    "stripe_fee" integer NOT NULL,            -- Stripe手数料
    "net_amount" integer NOT NULL,            -- 振込予定額（手数料差し引き後）
    "payout_status" text NOT NULL DEFAULT 'pending',
    "payout_method" text DEFAULT 'bank_transfer',
    "payout_date" timestamp with time zone,
    "processed_by" uuid,                      -- 処理した管理者ID
    "processing_notes" text,                  -- 処理メモ
    "bank_transfer_id" text,                  -- 銀行振込ID（管理用）
    "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLSを有効化
ALTER TABLE "public"."project_payouts" ENABLE ROW LEVEL SECURITY;

-- creator_rewardsテーブルに振り込み管理フィールドを追加
ALTER TABLE "public"."creator_rewards"
ADD COLUMN IF NOT EXISTS "payout_method" text DEFAULT 'bank_transfer',
ADD COLUMN IF NOT EXISTS "processed_by" uuid,
ADD COLUMN IF NOT EXISTS "processing_notes" text,
ADD COLUMN IF NOT EXISTS "bank_transfer_id" text;

-- ステータス制約の更新
ALTER TABLE "public"."project_payouts"
ADD CONSTRAINT "project_payouts_payout_status_check"
CHECK (payout_status = ANY (ARRAY[
    'pending'::text,
    'processing'::text, 
    'completed'::text,
    'failed'::text,
    'cancelled'::text
]));

-- creator_rewardsのステータス制約の更新（既存制約を削除して再作成）
ALTER TABLE "public"."creator_rewards" 
DROP CONSTRAINT IF EXISTS "creator_rewards_payment_status_check";

ALTER TABLE "public"."creator_rewards"
ADD CONSTRAINT "creator_rewards_payment_status_check"
CHECK (payment_status = ANY (ARRAY[
    'pending'::text,
    'processing'::text,
    'paid'::text,
    'failed'::text,
    'cancelled'::text
]));

-- インデックス作成
CREATE UNIQUE INDEX project_payouts_pkey ON public.project_payouts USING btree (id);
CREATE INDEX project_payouts_campaign_id_idx ON public.project_payouts USING btree (campaign_id);
CREATE INDEX project_payouts_status_idx ON public.project_payouts USING btree (payout_status);
CREATE INDEX project_payouts_date_idx ON public.project_payouts USING btree (payout_date);
CREATE INDEX project_payouts_processed_by_idx ON public.project_payouts USING btree (processed_by);

-- 主キー制約
ALTER TABLE "public"."project_payouts" 
ADD CONSTRAINT "project_payouts_pkey" PRIMARY KEY USING INDEX "project_payouts_pkey";

-- 外部キー制約
ALTER TABLE "public"."project_payouts" 
ADD CONSTRAINT "project_payouts_campaign_id_fkey" 
FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE;

ALTER TABLE "public"."project_payouts" 
ADD CONSTRAINT "project_payouts_processed_by_fkey" 
FOREIGN KEY (processed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- creator_rewardsに外部キー制約を追加
ALTER TABLE "public"."creator_rewards" 
ADD CONSTRAINT "creator_rewards_processed_by_fkey" 
FOREIGN KEY (processed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 金額制約
ALTER TABLE "public"."project_payouts"
ADD CONSTRAINT "project_payouts_amounts_check"
CHECK (gross_amount >= 0 AND platform_fee >= 0 AND stripe_fee >= 0 AND net_amount >= 0);

-- updated_atカラムを更新するトリガー
CREATE OR REPLACE TRIGGER update_project_payouts_updated_at 
    BEFORE UPDATE ON public.project_payouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- プロジェクト完了時に振り込み記録を自動作成する関数
CREATE OR REPLACE FUNCTION public.create_project_payout_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    gross_amount_val integer;
    platform_fee_val integer;
    stripe_fee_val integer;
    net_amount_val integer;
BEGIN
    -- ステータスがcompletedに変更された場合のみ処理
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- 各種金額を計算
        gross_amount_val := NEW.current_amount;
        platform_fee_val := ROUND(gross_amount_val * 0.09);  -- 9%
        stripe_fee_val := ROUND(gross_amount_val * 0.036 + 30); -- 3.6% + 30円
        net_amount_val := gross_amount_val - platform_fee_val - stripe_fee_val;
        
        -- プロジェクト実施者への振り込み記録を作成
        INSERT INTO project_payouts (
            campaign_id,
            gross_amount,
            platform_fee,
            stripe_fee,
            net_amount,
            payout_status
        ) VALUES (
            NEW.id,
            gross_amount_val,
            platform_fee_val,
            stripe_fee_val,
            net_amount_val,
            'pending'
        );
        
        -- 企画者報酬が存在する場合は作成（3%、最低5万円）
        IF gross_amount_val >= 166667 THEN  -- 5万円 ÷ 0.03 = 166,667円以上の場合
            INSERT INTO creator_rewards (
                campaign_id,
                amount,
                payment_status
            ) VALUES (
                NEW.id,
                ROUND(gross_amount_val * 0.03),  -- 3%
                'pending'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- トリガー作成
CREATE OR REPLACE TRIGGER on_campaign_completion_create_payouts
    AFTER UPDATE ON public.crowdfunding_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION create_project_payout_on_completion();

-- コメント追加
COMMENT ON TABLE "public"."project_payouts" 
IS 'プロジェクト実施者（YouTuber）への振り込み管理テーブル';

COMMENT ON COLUMN "public"."project_payouts"."gross_amount" 
IS '総支援額（手数料差し引き前）';

COMMENT ON COLUMN "public"."project_payouts"."platform_fee" 
IS '運営手数料（9%）';

COMMENT ON COLUMN "public"."project_payouts"."stripe_fee" 
IS 'Stripe決済手数料（3.6% + 30円）';

COMMENT ON COLUMN "public"."project_payouts"."net_amount" 
IS 'プロジェクト実施者への振込予定額（手数料差し引き後）';
