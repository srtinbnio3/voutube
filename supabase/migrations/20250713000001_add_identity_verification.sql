-- Stripe Identity本人確認機能のためのテーブル作成
-- 作成日時: 2025-01-01
-- 概要: Stripe Identityを用いた本人確認機能に必要なテーブルを追加

-- identity_verifications テーブル（本人確認情報）
CREATE TABLE "public"."identity_verifications" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "campaign_id" uuid,
    "stripe_verification_session_id" text NOT NULL,
    "verification_status" text NOT NULL DEFAULT 'pending',
    "verification_type" text NOT NULL DEFAULT 'individual',
    "verified_data" jsonb,
    "error_message" text,
    "verified_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS（Row Level Security）を有効化
ALTER TABLE "public"."identity_verifications" ENABLE ROW LEVEL SECURITY;

-- 主キー制約
ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id");

-- 外部キー制約
ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "identity_verifications_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "identity_verifications_campaign_id_fkey" 
    FOREIGN KEY ("campaign_id") REFERENCES "public"."crowdfunding_campaigns"("id") ON DELETE SET NULL;

-- 制約の追加
ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "verification_status_check" 
    CHECK (verification_status IN ('pending', 'succeeded', 'failed', 'cancelled', 'expired'));

ALTER TABLE ONLY "public"."identity_verifications"
    ADD CONSTRAINT "verification_type_check" 
    CHECK (verification_type IN ('individual', 'corporate'));

-- インデックス作成
CREATE INDEX "identity_verifications_user_id_idx" ON "public"."identity_verifications" USING btree ("user_id");
CREATE INDEX "identity_verifications_campaign_id_idx" ON "public"."identity_verifications" USING btree ("campaign_id");
CREATE INDEX "identity_verifications_stripe_session_id_idx" ON "public"."identity_verifications" USING btree ("stripe_verification_session_id");
CREATE INDEX "identity_verifications_status_idx" ON "public"."identity_verifications" USING btree ("verification_status");

-- RLSポリシー
-- ユーザーは自分の本人確認情報のみ閲覧可能
CREATE POLICY "Users can view own identity verifications" ON "public"."identity_verifications"
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の本人確認情報のみ作成可能
CREATE POLICY "Users can create own identity verifications" ON "public"."identity_verifications"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の本人確認情報のみ更新可能
CREATE POLICY "Users can update own identity verifications" ON "public"."identity_verifications"
    FOR UPDATE USING (auth.uid() = user_id);

-- crowdfunding_campaigns テーブルに本人確認関連フィールドを追加
ALTER TABLE "public"."crowdfunding_campaigns" 
    ADD COLUMN "identity_verification_required" boolean DEFAULT true,
    ADD COLUMN "identity_verification_id" uuid,
    ADD COLUMN "identity_verification_status" text DEFAULT 'not_started';

-- 外部キー制約の追加
ALTER TABLE ONLY "public"."crowdfunding_campaigns"
    ADD CONSTRAINT "crowdfunding_campaigns_identity_verification_id_fkey" 
    FOREIGN KEY ("identity_verification_id") REFERENCES "public"."identity_verifications"("id") ON DELETE SET NULL;

-- 制約の追加
ALTER TABLE ONLY "public"."crowdfunding_campaigns"
    ADD CONSTRAINT "identity_verification_status_check" 
    CHECK (identity_verification_status IN ('not_started', 'pending', 'verified', 'failed', 'expired'));

-- インデックス作成
CREATE INDEX "crowdfunding_campaigns_identity_verification_status_idx" ON "public"."crowdfunding_campaigns" USING btree ("identity_verification_status");

-- コメント追加
COMMENT ON TABLE "public"."identity_verifications" IS 'Stripe Identityを用いた本人確認情報';
COMMENT ON COLUMN "public"."identity_verifications"."stripe_verification_session_id" IS 'StripeのVerification Session ID';
COMMENT ON COLUMN "public"."identity_verifications"."verification_status" IS '確認状況 (pending, succeeded, failed, cancelled, expired)';
COMMENT ON COLUMN "public"."identity_verifications"."verification_type" IS '確認タイプ (individual, corporate)';
COMMENT ON COLUMN "public"."identity_verifications"."verified_data" IS 'Stripeから取得した検証済みデータ';

COMMENT ON COLUMN "public"."crowdfunding_campaigns"."identity_verification_required" IS '本人確認が必要かどうか';
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."identity_verification_id" IS '関連する本人確認のID';
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."identity_verification_status" IS '本人確認の状況'; 