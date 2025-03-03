import { getUserProfile } from "../../actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { FormMessage, Message } from "@/components/form-message";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: { status?: string; message?: string };
}) {
  // Supabaseクライアントを作成
  const supabase = await createClient();
  
  // 現在のユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // ユーザーが認証されていない場合はログインページにリダイレクト
  if (userError || !user) {
    redirect("/sign-in");
  }
  
  // プロフィール情報を取得
  const profile = await getUserProfile();
  
  // 検索パラメータからメッセージ情報を取得
  const message: Message | undefined = searchParams.status === "success" && searchParams.message
    ? { success: searchParams.message }
    : searchParams.status === "error" && searchParams.message
    ? { error: searchParams.message }
    : undefined;

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <h1 className="text-3xl font-bold">プロフィール編集</h1>
      
      <div className="flex justify-center">
        <ProfileForm initialData={profile} message={message} />
      </div>
    </div>
  );
} 