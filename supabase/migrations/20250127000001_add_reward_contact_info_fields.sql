-- リワードテーブルに支援者情報取得設定フィールドを追加
-- 作成日時: 2025-01-27
-- 概要: 支援者の連絡先情報取得に関する設定フィールドを追加

-- crowdfunding_rewards テーブルに支援者情報取得設定フィールドを追加
ALTER TABLE "public"."crowdfunding_rewards" 
ADD COLUMN "requires_contact_info" boolean DEFAULT false,
ADD COLUMN "requires_email" boolean DEFAULT false,
ADD COLUMN "requires_address" boolean DEFAULT false;

-- コメントを追加して各フィールドの用途を明確化
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_contact_info" IS '支援者の情報が必要かどうか（氏名・連絡先など）';
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_email" IS 'メールアドレスの取得が必要かどうか';
COMMENT ON COLUMN "public"."crowdfunding_rewards"."requires_address" IS '住所・氏名・電話番号の取得が必要かどうか';

-- インデックスを追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS "crowdfunding_rewards_requires_contact_info_idx" 
ON "public"."crowdfunding_rewards" ("requires_contact_info");

CREATE INDEX IF NOT EXISTS "crowdfunding_rewards_requires_email_idx" 
ON "public"."crowdfunding_rewards" ("requires_email");

CREATE INDEX IF NOT EXISTS "crowdfunding_rewards_requires_address_idx" 
ON "public"."crowdfunding_rewards" ("requires_address"); 