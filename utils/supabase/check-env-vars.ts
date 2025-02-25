/**
 * 環境変数が正しく設定されているかチェックする
 * 
 * このファイルは、Supabaseの環境変数が設定されているかを確認するために使用されます。
 * 開発環境では、.env.localファイルに環境変数を設定する必要があります。
 */

// 必要な環境変数が設定されているかチェック
export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 環境変数が設定されていない場合のエラーメッセージ
export const envVarError = !hasEnvVars
  ? "環境変数が設定されていません。.env.localファイルを確認してください。"
  : null; 