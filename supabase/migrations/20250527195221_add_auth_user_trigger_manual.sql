-- プロフィール自動作成トリガー（auth.usersテーブル用）
-- ユーザーがauth.usersテーブルに新規登録された際に、自動的にpublic.profilesテーブルにプロフィールを作成する
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();
