-- 本番環境のデータを削除するSQLスクリプト
-- 注意: このスクリプトは本番環境のデータを完全に削除します

-- auth.usersテーブルのデータを削除（Supabase Auth）
DELETE FROM auth.users;

-- 各テーブルのデータを削除（依存関係の順序に従う）
DELETE FROM votes;
DELETE FROM posts;
DELETE FROM channels;
DELETE FROM profiles;

-- シーケンスをリセット
ALTER SEQUENCE IF EXISTS channels_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS votes_id_seq RESTART WITH 1;

-- 確認用のクエリ
SELECT 
    'votes' as table_name, COUNT(*) as count FROM votes
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'channels', COUNT(*) FROM channels
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'users', COUNT(*) FROM auth.users
ORDER BY table_name; 