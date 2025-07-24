-- ストーリーカラム追加
-- 作成日時: 2025-01-25
-- 概要: crowdfunding_campaignsテーブルにstoryカラムを追加

-- crowdfunding_campaigns テーブルにstoryカラムを追加
ALTER TABLE "public"."crowdfunding_campaigns" 
    ADD COLUMN "story" text;

-- ストーリーの長さ制約を追加（最大20000文字）
ALTER TABLE "public"."crowdfunding_campaigns"
    ADD CONSTRAINT "crowdfunding_campaigns_story_length" 
    CHECK (char_length(story) <= 20000);

-- コメント追加
COMMENT ON COLUMN "public"."crowdfunding_campaigns"."story" IS 'プロジェクトの詳細なストーリー・説明（HTML形式）'; 