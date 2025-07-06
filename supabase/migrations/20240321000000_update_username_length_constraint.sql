-- 既存の制約を削除
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_length;

-- 新しい制約を追加（1文字以上）
ALTER TABLE profiles ADD CONSTRAINT username_length CHECK (char_length(username) >= 1); 