"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 新規ユーザー登録の処理
export const signUpAction = async (formData: FormData) => {
  // フォームからメールアドレスとパスワードを取得
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  // Supabaseクライアントを作成
  const supabase = await createClient();
  // 現在のサイトのURLを取得（メール認証用）
  const origin = (await headers()).get("origin");

  // メールアドレスとパスワードが入力されているか確認
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Supabaseで新規ユーザーを登録
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // メール認証後のリダイレクト先を設定
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  // エラーが発生した場合
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // 成功した場合
  return encodedRedirect(
    "success",
    "/sign-up",
    "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。",
  );
};

// ログイン処理
export const signInAction = async (formData: FormData) => {
  // フォームからデータを取得
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect_to") as string; // ログイン後のリダイレクト先
  const supabase = await createClient();

  // メールアドレスとパスワードでログイン
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // エラーが発生した場合
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // ログイン成功時：指定されたページまたはチャンネル一覧へリダイレクト
  return redirect(redirectTo || "/channels");
};

// パスワードリセットメールの送信処理
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  // メールアドレスが入力されているか確認
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "メールアドレスを入力してください");
  }

  // パスワードリセットメールを送信
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードのリセットに失敗しました",
    );
  }

  // コールバックURLが指定されている場合はそこへリダイレクト
  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  // 成功メッセージを表示
  return encodedRedirect(
    "success",
    "/forgot-password",
    "パスワードリセット用のメールを送信しました。メールのリンクをクリックしてパスワードを再設定してください。",
  );
};

// パスワードのリセット処理
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  // フォームから新しいパスワードを取得
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // パスワードが入力されているか確認
  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードと確認用パスワードを入力してください",
    );
  }

  // パスワードが一致するか確認
  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードが一致しません",
    );
  }

  // パスワードを更新
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードの更新に失敗しました",
    );
  }

  // 成功メッセージを表示
  encodedRedirect("success", "/protected/reset-password", "パスワードを更新しました");
};

// ログアウト処理
export const signOutAction = async () => {
  const supabase = await createClient();
  // ログアウトを実行
  await supabase.auth.signOut();
  // ログインページへリダイレクト
  return redirect("/sign-in");
};

// Google認証でのログイン処理
export const signInWithGoogleAction = async (formData?: FormData) => {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  
  // FormDataからredirect_toを取得（ある場合）
  let redirectTo = formData?.get("redirect_to")?.toString();
  
  // HTTPヘッダーからリファラーURLを取得
  const referer = headersList.get("referer");
  if (referer && !redirectTo) {
    // URLからredirect_toクエリパラメータを抽出
    const url = new URL(referer);
    redirectTo = url.searchParams.get("redirect_to") || undefined;
  }

  // リダイレクト先URLの構築
  const redirectUrl = new URL(`${origin}/auth/callback`);
  if (redirectTo) {
    redirectUrl.searchParams.set("redirect_to", redirectTo);
  }

  // Google認証を開始
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl.toString(),
    },
  });

  // エラーが発生した場合
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Google認証ページにリダイレクト
  return redirect(data.url);
};
