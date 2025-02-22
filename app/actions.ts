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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  // エラーが発生した場合
  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    // 登録成功時のメッセージを表示
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
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
    return encodedRedirect("error", "/forgot-password", "Email is required");
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
      "Could not reset password",
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
    "Check your email for a link to reset your password.",
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
      "Password and confirm password are required",
    );
  }

  // パスワードが一致するか確認
  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
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
      "Password update failed",
    );
  }

  // 成功メッセージを表示
  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

// ログアウト処理
export const signOutAction = async () => {
  const supabase = await createClient();
  // ログアウトを実行
  await supabase.auth.signOut();
  // ログインページへリダイレクト
  return redirect("/sign-in");
};
