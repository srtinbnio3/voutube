import { createClient } from "@/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UserProfilePage(
  props: {
    params: Promise<{ user_id: string }>;
  }
) {
  const params = await props.params;
  // Supabaseクライアントを作成
  const supabase = await createClient();

  // ユーザープロフィールを取得
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.user_id)
    .single();

  // プロフィールが存在しない場合は404ページを表示
  if (error || !profile) {
    notFound();
  }

  // ユーザーの投稿を取得（最新10件）
  const { data: userPosts } = await supabase
    .from("posts")
    .select(`
      *,
      channels (
        id,
        name
      )
    `)
    .eq("user_id", params.user_id)
    .order("created_at", { ascending: false })
    .limit(10);

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">ユーザープロフィール</h1>

      <div className="flex justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="flex flex-col items-center gap-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback className="text-4xl">{getInitials(profile.username)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-2xl">{profile.username}</CardTitle>
              <CardDescription>
                登録日: {new Date(profile.created_at).toLocaleDateString("ja-JP")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">最近の投稿</h2>
                <ul className="space-y-2">
                  {userPosts.map((post) => (
                    <li key={post.id}>
                      <Link href={`/channels/${post.channels.id}/posts/${post.id}`}>
                        <div className="p-2 hover:bg-muted rounded-lg">
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.channels.name} • {new Date(post.created_at).toLocaleDateString("ja-JP")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">投稿はまだありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 