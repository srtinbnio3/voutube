import { getUserProfile } from "../actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormMessage, Message } from "@/components/form-message";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { status?: string; message?: string };
}) {
  // プロフィール情報を取得
  const profile = await getUserProfile();
  
  // プロフィールがない場合は編集ページにリダイレクト
  if (!profile) {
    redirect("/profile/edit");
  }
  
  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 検索パラメータからメッセージ情報を取得
  const message: Message | undefined = searchParams.status === "success" && searchParams.message
    ? { success: searchParams.message }
    : searchParams.status === "error" && searchParams.message
    ? { error: searchParams.message }
    : undefined;

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">マイプロフィール</h1>
        <Button asChild>
          <Link href="/profile/edit">編集する</Link>
        </Button>
      </div>

      {message && <FormMessage message={message} />}

      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center gap-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="text-4xl">{getInitials(profile.username)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-2xl">{profile.username}</CardTitle>
            <CardDescription>
              作成日: {new Date(profile.created_at).toLocaleDateString("ja-JP")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            {/* 追加のプロフィール情報があれば表示 */}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/channels">チャンネル一覧に戻る</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 