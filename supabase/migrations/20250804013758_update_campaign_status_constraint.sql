-- キャンペーンのステータス制約を更新
-- 作成日時: 2025-08-04 01:37:58 JST
-- 概要: 'under_review'と'rejected'ステータスを追加してワークフロー機能をサポート

-- 既存の制約を削除
ALTER TABLE "public"."crowdfunding_campaigns" 
    DROP CONSTRAINT IF EXISTS "crowdfunding_campaigns_status_check";

-- 新しい制約を追加（under_review, rejectedを含む）
ALTER TABLE "public"."crowdfunding_campaigns" 
    ADD CONSTRAINT "crowdfunding_campaigns_status_check" 
    CHECK ((status = ANY (ARRAY[
        'draft'::text, 
        'under_review'::text, 
        'rejected'::text, 
        'active'::text, 
        'completed'::text, 
        'cancelled'::text
    ])));

-- コメント追加
COMMENT ON CONSTRAINT "crowdfunding_campaigns_status_check" ON "public"."crowdfunding_campaigns" 
    IS 'キャンペーンステータス制約: draft(編集中) -> under_review(審査中) -> rejected(要修正) or active(公開中) -> completed(完了) or cancelled(中止)';