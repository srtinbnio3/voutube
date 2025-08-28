-- 手数料構造の変更：運営11%（Stripe手数料を含む）、企画者3%
-- 作成日時: 2025-08-28 17:36:43 JST
-- 概要: 運営手数料を9%から11%に変更し、Stripe手数料を運営負担に変更

-- プロジェクト完了時の振り込み記録作成関数を更新
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
        platform_fee_val := ROUND(gross_amount_val * 0.11);  -- 11% (Stripe手数料を含む)
        stripe_fee_val := 0;  -- Stripe手数料は運営負担のため、実施者負担は0
        net_amount_val := gross_amount_val - platform_fee_val; -- 運営手数料のみ差し引き
        
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
        -- 注意: 企画者報酬の最低閾値を変更（5万円 ÷ 0.03 = 166,667円 → 新計算: 5万円 ÷ 0.03 = 166,667円のまま）
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

-- 既存のproject_payoutsテーブルにコメントを更新
COMMENT ON COLUMN "public"."project_payouts"."platform_fee" 
IS '運営手数料（11%、Stripe決済手数料を含む）';

COMMENT ON COLUMN "public"."project_payouts"."stripe_fee" 
IS 'Stripe決済手数料（運営負担のため実施者振込計算では0）';

COMMENT ON COLUMN "public"."project_payouts"."net_amount" 
IS 'プロジェクト実施者への振込予定額（運営手数料11%差し引き後、Stripe手数料は運営負担）';

-- 法務・利用規約関連のコメント追加
COMMENT ON TABLE "public"."project_payouts" 
IS 'プロジェクト実施者（YouTuber）への振り込み管理テーブル。運営手数料11%（Stripe手数料含む）を差し引いた金額を振込。';

-- 計算例を示すコメント
/*
新しい手数料構造の計算例：
支援総額: 100,000円の場合
├─ プロジェクト実施者: 86,000円 (運営手数料11%差し引き後)
├─ 運営収入: 11,000円 (11%、この中からStripe手数料約3,630円を支払い)
├─ 企画者報酬: 3,000円 (3%)
└─ 運営実質収入: 約7,370円 (11,000円 - 3,630円)

従来（運営9%）との比較:
├─ 従来の運営実質収入: 約5,370円 (9,000円 - 3,630円)  
└─ 新構造の運営実質収入: 約7,370円 (+2,000円改善)
*/
