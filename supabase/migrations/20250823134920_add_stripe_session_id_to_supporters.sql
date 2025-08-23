-- Stripe Checkoutセッション対応のためのカラム追加
-- 作成日時: 2025-08-23
-- 概要: crowdfunding_supportersテーブルにstripe_session_idカラムを追加

-- crowdfunding_supportersテーブルにstripe_session_idカラムを追加
ALTER TABLE "public"."crowdfunding_supporters" 
ADD COLUMN "stripe_session_id" text;

-- stripe_session_idのインデックスを作成（検索効率向上のため）
CREATE INDEX crowdfunding_supporters_stripe_session_id_idx 
ON public.crowdfunding_supporters USING btree (stripe_session_id);

-- コメント追加
COMMENT ON COLUMN "public"."crowdfunding_supporters"."stripe_session_id" 
IS 'Stripe Checkoutセッション用のID（決済処理追跡用）';
