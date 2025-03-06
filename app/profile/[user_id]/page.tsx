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
      <h1 className="text-3xl font-bold">ユーザープロフィール</h1>

      <Card className="max-w-md">
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
      </Card>

      {userPosts && userPosts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">{profile.username}の投稿企画</h2>
          <div className="grid gap-4">
            {userPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{post.title}</h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      スコア: {post.score || 0}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {post.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <Link 
                      href={`/channels/${post.channels.id}`}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      {post.channels.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/channels">チャンネル一覧に戻る</Link>
        </Button>
      </div>
    </div>
  );
} 