-- キャンペーンステータスの許容値を拡張
-- 追加: under_review, rejected, needs_revision
-- 既存制約を削除して再作成

ALTER TABLE public.crowdfunding_campaigns
  DROP CONSTRAINT IF EXISTS crowdfunding_campaigns_status_check;

ALTER TABLE public.crowdfunding_campaigns
  ADD CONSTRAINT crowdfunding_campaigns_status_check
  CHECK (
    status = ANY (
      ARRAY[
        'draft'::text,
        'under_review'::text,
        'needs_revision'::text,
        'active'::text,
        'rejected'::text,
        'completed'::text,
        'cancelled'::text
      ]
    )
  );


