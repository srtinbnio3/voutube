-- オーナー情報の追加フィールドを crowdfunding_campaigns テーブルに追加
-- 作成日時: 2025-08-03
-- 概要: 法人情報、特商法情報、運営主体タイプなどのオーナー情報フィールドを追加

-- crowdfunding_campaigns テーブルにオーナー情報関連フィールドを追加
ALTER TABLE "public"."crowdfunding_campaigns" 
    ADD COLUMN IF NOT EXISTS "operator_type" text DEFAULT 'individual',
    ADD COLUMN IF NOT EXISTS "corporate_info" jsonb,
    ADD COLUMN IF NOT EXISTS "legal_info" jsonb;

-- 制約の追加（存在確認をしてから追加）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operator_type_check' 
        AND table_name = 'crowdfunding_campaigns'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "public"."crowdfunding_campaigns"
            ADD CONSTRAINT "operator_type_check" 
            CHECK (operator_type IN ('individual', 'corporate'));
    END IF;
END $$;

-- インデックス作成
CREATE INDEX IF NOT EXISTS "crowdfunding_campaigns_operator_type_idx" 
    ON "public"."crowdfunding_campaigns" USING btree ("operator_type");

-- コメント追加
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."operator_type" IS '運営主体タイプ (individual: 個人, corporate: 法人)';
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."corporate_info" IS '法人情報 (JSON形式)';
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."legal_info" IS '特商法表記情報 (JSON形式)';

-- サンプルデータ構造のコメント
/*
corporate_info の構造例:
{
  "company_name": "株式会社サンプル",
  "representative_name": "山田太郎", 
  "representative_name_kana": "ヤマダ タロウ",
  "representative_birth_date": "1980-01-01",
  "company_postal_code": "150-0002",
  "company_address": "東京都渋谷区渋谷1-1-1",
  "company_phone": "03-1234-5678",
  "registration_number": "1234567890123"
}

legal_info の構造例:
{
  "display_method": "template", // "template" または "input"
  "business_name": "株式会社サンプル",
  "business_representative": "山田太郎",
  "business_postal_code": "150-0002", 
  "business_address": "東京都渋谷区渋谷1-1-1",
  "phone_number": "03-1234-5678"
}

bank_account_info の構造例:
{
  "bank_name": "みずほ銀行",
  "bank_branch": "渋谷支店", 
  "bank_account_type": "普通",
  "bank_account_number": "1234567",
  "bank_account_holder": "ヤマダ タロウ"
}
*/