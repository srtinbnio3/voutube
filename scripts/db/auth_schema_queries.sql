-- =================================================
-- Supabase Auth Schema Related Queries
-- ダッシュボードのSQL EDITORで実行してください
-- =================================================

-- 実行順序: 以下のクエリを順番に実行してください

-- =================================================
-- ステップ1: 既存のトリガーを削除（存在する場合）
-- =================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =================================================
-- ステップ2: プロフィール自動作成トリガー関数の作成・更新
-- =================================================
CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 1;
begin
  -- 基本となるusernameを取得
  base_username := coalesce(
    (new.raw_user_meta_data->>'name')::text,
    split_part(new.email, '@', 1)
  );
  
  -- 基本usernameが空の場合は'user'を使用
  if base_username is null or trim(base_username) = '' then
    base_username := 'user';
  end if;
  
  -- 最初は基本usernameをそのまま使用
  final_username := base_username;
  
  -- usernameがユニークになるまでループ
  while exists (select 1 from public.profiles where username = final_username) loop
    final_username := base_username || '_' || counter;
    counter := counter + 1;
    
    -- 無限ループ防止（最大100回試行）
    if counter > 100 then
      final_username := base_username || '_' || extract(epoch from now())::bigint;
      exit;
    end if;
  end loop;
  
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    final_username,
    (new.raw_user_meta_data->>'avatar_url')::text
  );
  return new;
end;
$$;

-- =================================================
-- ステップ3: プロフィール自動作成トリガーの作成（auth.usersテーブル用）
-- =================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- =================================================
-- 実行後の確認クエリ（オプション）
-- =================================================

-- トリガーが正しく作成されたか確認
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 関数が正しく作成されたか確認
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name = 'create_profile_for_new_user' 
  AND routine_schema = 'public';

-- =================================================
-- 注意事項:
-- 1. この関数とトリガーは新規ユーザー登録時にプロフィールを自動作成します
-- 2. OAuth認証（Google等）のメタデータからusernameとavatarを取得します
-- 3. メタデータが無い場合は、メールアドレスのローカル部分をusernameとして使用します
-- 4. トリガーはauth.usersテーブルに作用するため、SQL EDITORから実行する必要があります
-- 5. 既存のユーザーには影響しません（新規登録ユーザーのみ対象）
-- 6. 本番環境とテスト環境の両方で実行する必要があります
-- =================================================

-- =================================================
-- トラブルシューティング:
-- もしエラーが発生した場合：
-- 1. public.profiles テーブルが存在することを確認
-- 2. auth.users テーブルへのアクセス権限を確認
-- 3. 関数の作成が成功していることを確認
-- ================================================= 