import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Supabaseクライアントの初期化
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // リクエストからすべてのクッキーを取得
          getAll() {
            return request.cookies.getAll();
          },
          // レスポンスにクッキーを設定
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // セッションの有効期限が切れている場合は更新（Server Componentsに必要）
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // 保護されたルートへのアクセス制御
    // 未認証ユーザーが保護されたパスにアクセスした場合、ログインページへリダイレクト
    if ((request.nextUrl.pathname.startsWith("/protected") ||
         request.nextUrl.pathname.startsWith("/profile")) && 
        (!user || userError)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // 認証済みユーザーのリダイレクト
    if (user && !userError) {
      // 認証済みユーザーがサインインページやサインアップページにアクセスした場合、
      // チャンネル一覧ページにリダイレクト
      if (request.nextUrl.pathname.startsWith("/sign-in") || 
          request.nextUrl.pathname.startsWith("/sign-up")) {
        return NextResponse.redirect(new URL("/channels", request.url));
      }
    }

    return response;
  } catch (e) {
    // Supabaseクライアントの作成に失敗した場合
    // 環境変数が正しく設定されていない可能性があります
    // http://localhost:3000 で次のステップを確認してください
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
