-- キャンペーンフィードバック機能のテーブル作成
-- 作成日時: 2025-01-15
-- 概要: 運営とクリエイターのやりとり機能に必要なテーブルとポリシーを追加

-- campaign_feedback テーブル（キャンペーンフィードバック/メッセージ）
create table "public"."campaign_feedback" (
    "id" uuid not null default uuid_generate_v4(),
    "campaign_id" uuid not null,
    "sender_id" uuid, -- nullの場合は運営（システム）からのメッセージ
    "sender_type" text not null check (sender_type in ('user', 'admin')),
    "message" text not null,
    "message_type" text not null check (message_type in ('feedback', 'question', 'response', 'advice', 'request_change', 'approved', 'rejected')),
    "is_read" boolean not null default false,
    "admin_name" text, -- 運営メッセージの場合の表示名
    "admin_avatar" text, -- 運営メッセージの場合のアバターURL
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
);

-- RLS（Row Level Security）を有効化
alter table "public"."campaign_feedback" enable row level security;

-- ===============================
-- インデックス作成
-- ===============================

-- campaign_feedback用インデックス
CREATE INDEX campaign_feedback_campaign_id_idx ON public.campaign_feedback USING btree (campaign_id);
CREATE INDEX campaign_feedback_sender_id_idx ON public.campaign_feedback USING btree (sender_id);
CREATE INDEX campaign_feedback_created_at_idx ON public.campaign_feedback USING btree (created_at DESC);
CREATE INDEX campaign_feedback_is_read_idx ON public.campaign_feedback USING btree (is_read);
CREATE UNIQUE INDEX campaign_feedback_pkey ON public.campaign_feedback USING btree (id);

-- ===============================
-- 主キー制約
-- ===============================

alter table "public"."campaign_feedback" add constraint "campaign_feedback_pkey" PRIMARY KEY using index "campaign_feedback_pkey";

-- ===============================
-- 外部キー制約
-- ===============================

-- campaign_feedback外部キー
alter table "public"."campaign_feedback" add constraint "campaign_feedback_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES crowdfunding_campaigns(id) ON DELETE CASCADE;
alter table "public"."campaign_feedback" add constraint "campaign_feedback_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ===============================
-- チェック制約
-- ===============================

-- campaign_feedback制約
alter table "public"."campaign_feedback" add constraint "campaign_feedback_message_length" CHECK ((char_length(message) >= 1 AND char_length(message) <= 5000));

-- ===============================
-- トリガー作成
-- ===============================

-- updated_atカラムを更新するトリガー
CREATE OR REPLACE TRIGGER update_campaign_feedback_updated_at 
    BEFORE UPDATE ON public.campaign_feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================
-- RLS（Row Level Security）ポリシー
-- ===============================

-- campaign_feedback のポリシー
-- キャンペーン作成者は自分のキャンペーンのフィードバックを閲覧可能
CREATE POLICY "キャンペーン作成者はフィードバックを閲覧可能" ON "public"."campaign_feedback" 
FOR SELECT USING (
    auth.uid() IN (
        SELECT channels.owner_user_id 
        FROM channels 
        WHERE channels.id = (
            SELECT crowdfunding_campaigns.channel_id 
            FROM crowdfunding_campaigns 
            WHERE crowdfunding_campaigns.id = campaign_feedback.campaign_id
        )
    )
);

-- 認証済みユーザーは自分のキャンペーンにフィードバックを作成可能
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
        -- または運営（sender_type = 'admin'）
        OR sender_type = 'admin'
    )
);

-- 送信者本人はメッセージを更新可能（既読ステータスなど）
CREATE POLICY "メッセージ送信者は自分のメッセージを更新可能" ON "public"."campaign_feedback" 
FOR UPDATE USING (
    auth.uid() = sender_id OR 
    -- キャンペーン作成者は既読ステータスを更新可能
    auth.uid() IN (
        SELECT channels.owner_user_id 
        FROM channels 
        WHERE channels.id = (
            SELECT crowdfunding_campaigns.channel_id 
            FROM crowdfunding_campaigns 
            WHERE crowdfunding_campaigns.id = campaign_feedback.campaign_id
        )
    )
);

-- ===============================
-- カラムコメント
-- ===============================

-- campaign_feedback カラムコメント
COMMENT ON COLUMN "public"."campaign_feedback"."sender_id" IS 'メッセージ送信者のユーザーID（運営メッセージの場合はNULL）';
COMMENT ON COLUMN "public"."campaign_feedback"."sender_type" IS 'メッセージ送信者のタイプ（user: ユーザー, admin: 運営）';
COMMENT ON COLUMN "public"."campaign_feedback"."message_type" IS 'メッセージの種類（feedback, question, response, advice, request_change, approved, rejected）';
COMMENT ON COLUMN "public"."campaign_feedback"."admin_name" IS '運営メッセージの場合の表示名（例: IdeaTube運営チーム）';
COMMENT ON COLUMN "public"."campaign_feedback"."admin_avatar" IS '運営メッセージの場合のアバター画像URL';

-- コメント: このマイグレーションファイルは、キャンペーンフィードバック機能に必要なテーブル、制約、インデックス、RLSポリシーを作成します。
-- 運営とクリエイターの双方向やりとりをサポートし、適切な権限管理を提供します。