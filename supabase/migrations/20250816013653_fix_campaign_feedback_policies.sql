-- キャンペーンフィードバックのRLSポリシー修正
-- 作成日時: 2025-01-16
-- 概要: 運営メッセージ作成を許可するポリシーを修正

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "認証済みユーザーはフィードバックを作成可能" ON "public"."campaign_feedback";

-- 修正されたINSERTポリシーを作成
-- 運営メッセージ作成を明示的に許可
CREATE POLICY "認証済みユーザーはフィードバックを作成可能" ON "public"."campaign_feedback" 
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
        -- 自分のキャンペーンに対してのみ
        auth.uid() IN (
            SELECT channels.owner_user_id 
            FROM channels 
            WHERE channels.id = (
                SELECT crowdfunding_campaigns.channel_id 
                FROM crowdfunding_campaigns 
                WHERE crowdfunding_campaigns.id = campaign_feedback.campaign_id
            )
        )
        -- または運営（sender_type = 'admin'）の場合
        OR (
            sender_type = 'admin' AND 
            -- 管理者権限チェック（admin_check関数を使用）
            EXISTS (
                SELECT 1 FROM admin_users 
                WHERE user_id = auth.uid() AND is_active = true
            )
        )
    )
);

-- 運営メッセージ閲覧のためのポリシーも追加
CREATE POLICY "運営メッセージは適切な権限を持つユーザーが閲覧可能" ON "public"."campaign_feedback" 
FOR SELECT USING (
    -- キャンペーン作成者
    auth.uid() IN (
        SELECT channels.owner_user_id 
        FROM channels 
        WHERE channels.id = (
            SELECT crowdfunding_campaigns.channel_id 
            FROM crowdfunding_campaigns 
            WHERE crowdfunding_campaigns.id = campaign_feedback.campaign_id
        )
    )
    -- または管理者
    OR EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- コメント: このマイグレーションは、運営メッセージの作成と閲覧を適切に許可するようにRLSポリシーを修正します。
