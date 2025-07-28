-- ストレージバケットとポリシーの設定
-- 作成日時: 2025-07-19
-- 概要: user-contentストレージバケットの作成と関連ポリシーの設定

-- ==========================================
-- ストレージバケットの作成
-- ==========================================

-- user-contentバケットを作成（既に存在する場合はスキップ）
INSERT INTO storage.buckets (id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'user-content', 
  'user-content', 
  null, 
  true, 
  false, 
  52428800, -- 50MB (50 * 1024 * 1024)
  '{"image/jpeg", "image/jpg", "image/png", "image/webp"}'
) ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ストレージポリシーの設定
-- ==========================================

-- 既存のポリシーが存在する場合は削除
DROP POLICY IF EXISTS "認証済みユーザーのみアップロード可能" ON storage.objects;
DROP POLICY IF EXISTS "認証済みユーザーは自分のファイルのみ更新可能" ON storage.objects;
DROP POLICY IF EXISTS "全ユーザーが閲覧可能" ON storage.objects;

-- 1. 認証済みユーザーのみアップロード可能
CREATE POLICY "認証済みユーザーのみアップロード可能" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-content');

-- 2. 認証済みユーザーは自分のファイルのみ更新可能
-- ファイルパスの最初のフォルダ名がユーザーIDと一致する場合のみ更新可能
CREATE POLICY "認証済みユーザーは自分のファイルのみ更新可能" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. 認証済みユーザーは自分のファイルのみ削除可能
CREATE POLICY "認証済みユーザーは自分のファイルのみ削除可能" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. 全ユーザーが閲覧可能（パブリックアクセス）
CREATE POLICY "全ユーザーが閲覧可能" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'user-content');

-- ==========================================
-- マイグレーション完了の確認
-- ==========================================

-- バケットが正常に作成されたことを確認するためのコメント
-- このマイグレーション実行後、以下が利用可能になります：
-- 1. user-contentバケット（最大50MB、JPEG/PNG/WebP対応）
-- 2. 認証ユーザーによるファイルアップロード
-- 3. 自分のファイルのみ更新・削除
-- 4. 全ユーザーによるファイル閲覧 