import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // このファイルは認証（ログインや新規登録）の処理が完了した後に実行されます
  
  // 1. URLから必要な情報を取得
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");          // 認証コード（SupabaseがログインOKかを確認するためのコード）
  const origin = requestUrl.origin;                          // 現在のサイトのURL（例：http://localhost:3000）
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();  // リダイレクト先のパス（指定されている場合）

  // 2. 認証コードがある場合、ユーザーセッションを作成
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);  // 認証コードを使ってログイン状態を作成
  }

  // 3. リダイレクト先の決定
  // リダイレクト先が指定されている場合はそこへ
  if (redirectTo) {
    // redirectToが完全なURL（httpで始まる）かパスかを判定
    try {
      // 完全なURLの場合はそのまま使用
      const url = new URL(redirectTo);
      return NextResponse.redirect(url.toString());
    } catch {
      // パスの場合はoriginと結合
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // リダイレクト先が指定されていない場合はチャンネル一覧ページへ
  return NextResponse.redirect(`${origin}/channels`);
}
