-- 管理者権限システムの追加
-- 作成日時: 2025-01-15
-- 概要: プロファイルテーブルに管理者権限フィールドを追加し、適切なポリシーを設定

-- プロファイルテーブルに管理者権限フィールドを追加
ALTER TABLE "public"."profiles" 
    ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT FALSE;

-- 管理者権限フィールドのインデックスを作成
CREATE INDEX profiles_is_admin_idx ON public.profiles USING btree (is_admin);

-- 管理者ロールの種類を管理するテーブル（将来の拡張用）
CREATE TABLE "public"."admin_roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "role_type" TEXT NOT NULL CHECK (role_type IN ('super_admin', 'content_moderator', 'support')),
    "granted_by" UUID, -- 権限を付与した管理者のID
    "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "notes" TEXT, -- 権限付与の理由やメモ
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- admin_rolesテーブルの制約とインデックス
ALTER TABLE "public"."admin_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."admin_roles" ADD CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."admin_roles" ADD CONSTRAINT "admin_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE "public"."admin_roles" ADD CONSTRAINT "admin_roles_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- インデックス作成
CREATE INDEX admin_roles_user_id_idx ON public.admin_roles USING btree (user_id);
CREATE INDEX admin_roles_role_type_idx ON public.admin_roles USING btree (role_type);
CREATE INDEX admin_roles_is_active_idx ON public.admin_roles USING btree (is_active);

-- updated_atカラムを更新するトリガー
CREATE OR REPLACE TRIGGER update_admin_roles_updated_at 
    BEFORE UPDATE ON public.admin_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLSポリシー: 管理者権限情報は管理者のみ閲覧可能
CREATE POLICY "管理者権限情報は管理者のみ閲覧可能" ON "public"."admin_roles" 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_admin = TRUE
    )
);

-- 管理者権限の付与・削除は super_admin のみ可能
CREATE POLICY "管理者権限の変更は super_admin のみ可能" ON "public"."admin_roles" 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_roles ar
        JOIN profiles p ON ar.user_id = p.id
        WHERE p.id = auth.uid() 
        AND p.is_admin = TRUE
        AND ar.role_type = 'super_admin'
        AND ar.is_active = TRUE
    )
);

CREATE POLICY "管理者権限の更新は super_admin のみ可能" ON "public"."admin_roles" 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM admin_roles ar
        JOIN profiles p ON ar.user_id = p.id
        WHERE p.id = auth.uid() 
        AND p.is_admin = TRUE
        AND ar.role_type = 'super_admin'
        AND ar.is_active = TRUE
    )
);

-- プロファイルテーブルの is_admin カラムのコメント
COMMENT ON COLUMN "public"."profiles"."is_admin" IS '管理者権限フラグ（TRUE: 管理者, FALSE: 一般ユーザー）';

-- admin_rolesテーブルのコメント
COMMENT ON TABLE "public"."admin_roles" IS '管理者権限の詳細管理テーブル';
COMMENT ON COLUMN "public"."admin_roles"."role_type" IS '管理者権限の種類（super_admin: 最高管理者, content_moderator: コンテンツ管理者, support: サポート管理者）';
COMMENT ON COLUMN "public"."admin_roles"."granted_by" IS '権限を付与した管理者のユーザーID';
COMMENT ON COLUMN "public"."admin_roles"."notes" IS '権限付与の理由やメモ';

-- 初期管理者の設定用関数（開発環境用）
CREATE OR REPLACE FUNCTION create_initial_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- メールアドレスからユーザーIDを取得
    SELECT au.id INTO admin_user_id
    FROM auth.users au
    WHERE au.email = admin_email;
    
    IF admin_user_id IS NOT NULL THEN
        -- プロファイルの is_admin を TRUE に設定
        UPDATE profiles 
        SET is_admin = TRUE, updated_at = timezone('utc'::text, now())
        WHERE id = admin_user_id;
        
        -- super_admin 権限を付与
        INSERT INTO admin_roles (user_id, role_type, granted_by, notes)
        VALUES (admin_user_id, 'super_admin', admin_user_id, '初期設定による管理者権限付与')
        ON CONFLICT (user_id, role_type) DO NOTHING;
        
        RAISE NOTICE '管理者権限を付与しました: %', admin_email;
    ELSE
        RAISE EXCEPTION 'ユーザーが見つかりません: %', admin_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- テーブル制約の追加（一意制約）
ALTER TABLE "public"."admin_roles" 
    ADD CONSTRAINT "unique_user_role" UNIQUE (user_id, role_type);

-- コメント: このマイグレーションにより、細かい権限管理システムが利用可能になります。
-- 本番環境では create_initial_admin 関数を使用して初期管理者を設定してください。