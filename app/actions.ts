"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * 新規ユーザー登録の処理を行う関数
 * 
 * この関数は以下の手順で動作します：
 * 1. フォームからメールアドレスとパスワードを受け取る
 * 2. Supabase（データベース）に新しいユーザーを登録
 * 3. 確認メールを送信
 * 4. 結果に応じて適切なメッセージを表示
 */
export const signUpAction = async (formData: FormData) => {
  // フォームからメールアドレスとパスワードを取得します
  // toString()は、値を文字列に変換する処理です
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // Supabase（データベース）に接続するための準備をします
  const supabase = await createClient();

  // 現在のウェブサイトのURLを取得します（メール認証用に必要）
  const origin = (await headers()).get("origin");

  // メールアドレスとパスワードが正しく入力されているか確認
  // もし入力されていない場合は、エラーメッセージを表示してサインアップページに戻ります
  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Supabaseを使って新しいユーザーを登録します
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // メール認証が完了した後、ユーザーをどのページに戻すかを設定
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  // エラーが発生した場合（例：既に登録済みのメールアドレス、パスワードが短すぎる等）
  if (error) {
    // エラー内容をログに記録し、ユーザーにエラーメッセージを表示
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  // 登録が成功した場合、確認メールを送信した旨をユーザーに通知
  return encodedRedirect(
    "success",
    "/sign-up",
    "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。",
  );
};

/**
 * ログイン処理を行う関数
 * 
 * この関数は以下の手順で動作します：
 * 1. フォームからメールアドレスとパスワードを受け取る
 * 2. 認証情報が正しいか確認
 * 3. 成功したら指定されたページへ移動
 */
export const signInAction = async (formData: FormData) => {
  // フォームから必要な情報を取得
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect_to") as string; // ログイン成功後に移動するページのURL
  
  // データベースに接続
  const supabase = await createClient();

  // メールアドレスとパスワードでログインを試みる
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // ログインに失敗した場合（パスワードが間違っている等）
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // ログイン成功：指定されたページまたはチャンネル一覧ページへ移動
  return redirect(redirectTo || "/channels");
};

/**
 * パスワードを忘れた場合のリセットメール送信処理
 * 
 * この関数は以下の手順で動作します：
 * 1. フォームからメールアドレスを受け取る
 * 2. パスワードリセット用のメールを送信
 * 3. 結果に応じて適切なメッセージを表示
 */
export const forgotPasswordAction = async (formData: FormData) => {
  // フォームからメールアドレスを取得
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  // メールアドレスが入力されているか確認
  if (!email) {
    return encodedRedirect("error", "/forgot-password", "メールアドレスを入力してください");
  }

  // パスワードリセット用のメールを送信
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  });

  // エラーが発生した場合（存在しないメールアドレス等）
  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "パスワードのリセットに失敗しました",
    );
  }

  // コールバックURL（戻り先のページ）が指定されている場合はそこへ移動
  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  // メール送信成功のメッセージを表示
  return encodedRedirect(
    "success",
    "/forgot-password",
    "パスワードリセット用のメールを送信しました。メールのリンクをクリックしてパスワードを再設定してください。",
  );
};

/**
 * パスワードの再設定処理
 * 
 * この関数は以下の手順で動作します：
 * 1. フォームから新しいパスワードを2回（確認用）受け取る
 * 2. 2つのパスワードが一致するか確認
 * 3. パスワードを更新
 * 4. 結果に応じて適切なメッセージを表示
 */
export const resetPasswordAction = async (formData: FormData) => {
  // データベースに接続
  const supabase = await createClient();

  // フォームから新しいパスワードを2回分取得
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // パスワードが両方とも入力されているか確認
  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードと確認用パスワードを入力してください",
    );
  }

  // 2つのパスワードが一致するか確認
  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードが一致しません",
    );
  }

  // データベース上でパスワードを更新
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  // エラーが発生した場合
  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "パスワードの更新に失敗しました",
    );
  }

  // パスワード更新成功のメッセージを表示
  encodedRedirect("success", "/protected/reset-password", "パスワードを更新しました");
};

/**
 * ログアウト処理
 * 
 * この関数は以下の手順で動作します：
 * 1. ユーザーをログアウト
 * 2. ログインページへ移動
 */
export const signOutAction = async () => {
  const supabase = await createClient();
  // ユーザーをログアウトさせる
  await supabase.auth.signOut();
  // ログインページへ移動
  return redirect("/sign-in");
};

/**
 * Googleアカウントでログインする処理
 * 
 * この関数は以下の手順で動作します：
 * 1. ログイン後の移動先ページ情報を取得
 * 2. Googleの認証ページへ移動するURLを生成
 * 3. ユーザーをGoogleの認証ページへ移動
 */
export const signInWithGoogleAction = async (formData?: FormData) => {
  // データベースに接続
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  
  // フォームからログイン後の移動先URLを取得（ある場合）
  let redirectTo = formData?.get("redirect_to")?.toString();
  
  // 現在のページのURLから移動先情報を取得（フォームに情報がない場合）
  const referer = headersList.get("referer");
  if (referer && !redirectTo) {
    // URLからredirect_toパラメータを探して取得
    const url = new URL(referer);
    redirectTo = url.searchParams.get("redirect_to") || undefined;
  }

  // Google認証後の戻り先URLを作成
  const redirectUrl = new URL(`${origin}/auth/callback`);
  if (redirectTo) {
    redirectUrl.searchParams.set("redirect_to", redirectTo);
  }

  // Google認証を開始（基本認証のみ）
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",  // Google認証を使用することを指定
    options: {
      redirectTo: redirectUrl.toString(),  // 認証後の戻り先URLを設定
      // 基本的な認証のみ（YouTube APIのスコープは含めない）
      scopes: "openid profile email",
      queryParams: {
        access_type: 'offline',  // refresh tokenを取得するために必要
        prompt: 'consent',       // 毎回同意画面を表示してtokenを確実に取得
      },
    },
  });

  // エラーが発生した場合
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Googleの認証ページへユーザーを移動
  return redirect(data.url);
};

/**
 * YouTube API権限付きでGoogleログインする処理
 * 
 * クラウドファンディング開始などYouTube APIアクセスが必要な機能で使用します
 */
export const signInWithGoogleForYouTubeAction = async (formData?: FormData) => {
  // データベースに接続
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  
  // フォームからログイン後の移動先URLを取得（ある場合）
  let redirectTo = formData?.get("redirect_to")?.toString();
  
  // 現在のページのURLから移動先情報を取得（フォームに情報がない場合）
  const referer = headersList.get("referer");
  if (referer && !redirectTo) {
    // URLからredirect_toパラメータを探して取得
    const url = new URL(referer);
    redirectTo = url.searchParams.get("redirect_to") || undefined;
  }

  // Google認証後の戻り先URLを作成
  const redirectUrl = new URL(`${origin}/auth/callback`);
  if (redirectTo) {
    redirectUrl.searchParams.set("redirect_to", redirectTo);
  }

  // Google認証を開始（YouTube API権限も含む）
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",  // Google認証を使用することを指定
    options: {
      redirectTo: redirectUrl.toString(),  // 認証後の戻り先URLを設定
      // YouTube API権限も含めたスコープ - チャンネル一覧取得に必要な最小限の権限
      scopes: "openid profile email https://www.googleapis.com/auth/youtube.readonly",
      queryParams: {
        access_type: 'offline',  // refresh tokenを取得するために必要
        prompt: 'consent',       // 毎回同意画面を表示してtokenを確実に取得
      },
    },
  });

  // エラーが発生した場合
  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Googleの認証ページへユーザーを移動
  return redirect(data.url);
};
