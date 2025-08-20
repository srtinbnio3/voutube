-- プロジェクト公開制御機能の追加
-- 作成日時: 2025-08-19 17:03:17 JST
-- 概要: プロジェクトオーナーが公開タイミングを制御できる機能を追加

-- 新しいステータス値を追加
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
        'approved'::text,      -- 新規: 管理者承認済み、公開待ち
        'scheduled'::text,     -- 新規: 公開予約中
        'active'::text,
        'rejected'::text,
        'completed'::text,
        'cancelled'::text
      ]
    )
  );

-- 公開制御関連フィールドを追加
ALTER TABLE public.crowdfunding_campaigns
  ADD COLUMN IF NOT EXISTS published_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS auto_publish_enabled boolean DEFAULT false;

-- インデックス追加
CREATE INDEX IF NOT EXISTS crowdfunding_campaigns_published_at_idx 
  ON public.crowdfunding_campaigns (published_at);
CREATE INDEX IF NOT EXISTS crowdfunding_campaigns_scheduled_publish_at_idx 
  ON public.crowdfunding_campaigns (scheduled_publish_at);
CREATE INDEX IF NOT EXISTS crowdfunding_campaigns_status_scheduled_idx 
  ON public.crowdfunding_campaigns (status) WHERE status = 'scheduled';

-- コメント追加
COMMENT ON COLUMN public.crowdfunding_campaigns.published_at 
  IS 'プロジェクトが実際に公開された日時';
COMMENT ON COLUMN public.crowdfunding_campaigns.scheduled_publish_at 
  IS '公開予約日時（この日時になったら自動的にactiveに変更）';
COMMENT ON COLUMN public.crowdfunding_campaigns.auto_publish_enabled 
  IS '自動公開が有効かどうか（falseの場合は手動公開のみ）';

-- 制約追加
ALTER TABLE public.crowdfunding_campaigns
  ADD CONSTRAINT scheduled_publish_date_future 
  CHECK (
    scheduled_publish_at IS NULL OR 
    scheduled_publish_at > created_at
  );

-- 公開状態を確認する関数
CREATE OR REPLACE FUNCTION public.is_campaign_published(campaign_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM crowdfunding_campaigns 
    WHERE id = campaign_id 
    AND status = 'active' 
    AND published_at IS NOT NULL
  );
END;
$$;

-- 公開予約処理用の関数
CREATE OR REPLACE FUNCTION public.process_scheduled_publications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 公開予約時刻を過ぎたプロジェクトを自動公開
  UPDATE crowdfunding_campaigns
  SET 
    status = 'active',
    published_at = NOW(),
    updated_at = NOW()
  WHERE 
    status = 'scheduled'
    AND scheduled_publish_at <= NOW()
    AND auto_publish_enabled = true;
    
  -- ログ出力（開発時のデバッグ用）
  RAISE NOTICE 'Processed scheduled publications at %', NOW();
END;
$$;

-- コメント: この関数は定期的に実行される予定（API Routes等から）
COMMENT ON FUNCTION public.process_scheduled_publications() 
  IS '公開予約されたプロジェクトを自動的にactiveに変更する関数';
