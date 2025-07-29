-- リワードテーブルに追加フィールドを追加
-- 作成日時: 2025-01-26
-- 概要: UIで使用されているがDBに存在しないフィールドを追加

-- crowdfunding_rewards テーブルに新しいフィールドを追加
ALTER TABLE "public"."crowdfunding_rewards" 
ADD COLUMN "delivery_date" text,
ADD COLUMN "requires_shipping" boolean DEFAULT false,
ADD COLUMN "shipping_info" text,
ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb,
ADD COLUMN "template" text,
ADD COLUMN "is_unlimited" boolean DEFAULT false;

-- 既存のデータに対してis_unlimitedフラグを設定
-- quantity が 999999 以上の場合は無制限として扱う
UPDATE "public"."crowdfunding_rewards" 
SET "is_unlimited" = true 
WHERE "quantity" >= 999999;

-- 無制限の場合のquantityを正規化（999999 → 1に変更）
UPDATE "public"."crowdfunding_rewards" 
SET "quantity" = 1,
    "remaining_quantity" = 1
WHERE "is_unlimited" = true;

-- 制約を追加
ALTER TABLE "public"."crowdfunding_rewards" 
ADD CONSTRAINT "delivery_date_format" 
CHECK ("delivery_date" IS NULL OR "delivery_date" ~ '^[0-9]{4}-[0-9]{2}$');

-- インデックスを追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS "crowdfunding_rewards_delivery_date_idx" 
ON "public"."crowdfunding_rewards" ("delivery_date");

CREATE INDEX IF NOT EXISTS "crowdfunding_rewards_is_unlimited_idx" 
ON "public"."crowdfunding_rewards" ("is_unlimited"); 