"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { Tables } from "@/database.types";
import sharp from "sharp";

// ユーザープロフィールを取得する関数
export async function getUserProfile() {
  const supabase = await createClient();
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }
  
  // ユーザーのプロフィールを取得
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (profileError) {
    console.error("プロフィール取得エラー:", profileError);
    return null;
  }
  
  return profile;
}

// プロフィールが存在するか確認する関数
export async function checkProfileExists() {
  const profile = await getUserProfile();
  return !!profile;
}

// プロフィールを更新するサーバーアクション
export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return encodedRedirect("error", "/profile/edit", "ユーザー情報の取得に失敗しました");
  }
  
  // フォームからデータを取得
  const username = formData.get("username") as string;
  const avatarUrl = formData.get("avatar_url") as string;
  
  // バリデーション
  if (!username || username.length < 3) {
    return encodedRedirect("error", "/profile/edit", "ユーザー名は3文字以上必要です");
  }
  
  // プロフィールが存在するか確認
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  
  let result;
  
  if (existingProfile) {
    // プロフィールを更新
    result = await supabase
      .from("profiles")
      .update({
        username,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } else {
    // プロフィールを新規作成
    result = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username,
        avatar_url: avatarUrl || null,
      });
  }
  
  if (result.error) {
    // ユーザー名の重複エラーの場合
    if (result.error.code === "23505") {
      return encodedRedirect("error", "/profile/edit", "このユーザー名は既に使用されています");
    }
    
    console.error("プロフィール更新エラー:", result.error);
    return encodedRedirect("error", "/profile/edit", "プロフィールの更新に失敗しました");
  }
  
  // キャッシュを更新
  revalidatePath(`/profile/${user.id}`);
  revalidatePath("/channels");
  
  return encodedRedirect("success", `/profile/${user.id}`, "プロフィールを更新しました");
}

// プロフィール画像をアップロードするサーバーアクション
export async function uploadProfileImageAction(formData: FormData) {
  const supabase = await createClient();
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "ユーザー情報の取得に失敗しました" };
  }

  // 現在のプロフィール画像を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  // 画像ファイルを取得
  const file = formData.get("image") as File;
  
  if (!file) {
    return { error: "画像ファイルが選択されていません" };
  }
  
  // ファイルサイズチェック (5MB以下)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "ファイルサイズは5MB以下にしてください" };
  }
  
  // ファイル形式チェック
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { error: "JPG、PNG、GIF、WebP形式の画像のみアップロード可能です" };
  }

  try {
    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 画像の最適化
    const optimizedBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 80,
        effort: 6
      })
      .toBuffer();

    // ファイル名を生成（ユーザーID + タイムスタンプ + .webp）
    const fileName = `${user.id}_${Date.now()}.webp`;
    const filePath = `avatars/${fileName}`;
    
    // Storageにアップロード
    const { error: uploadError, data } = await supabase.storage
      .from("user-content")
      .upload(filePath, optimizedBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/webp"
      });
    
    if (uploadError) {
      console.error("画像アップロードエラー:", uploadError);
      return { error: "画像のアップロードに失敗しました" };
    }
    
    // 画像の公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from("user-content")
      .getPublicUrl(filePath);

    // 古い画像を削除
    if (profile?.avatar_url) {
      const oldFilePath = profile.avatar_url.split('/').pop();
      if (oldFilePath) {
        await supabase.storage
          .from("user-content")
          .remove([`avatars/${oldFilePath}`]);
      }
    }
    
    return { url: publicUrl };
  } catch (error) {
    console.error("画像処理エラー:", error);
    return { error: "画像の処理に失敗しました" };
  }
} 