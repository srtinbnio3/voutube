import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CommentList } from "@/components/comments/comment-list"
import { PostShareButton } from "./_components/post-share-button"
import { StartCrowdfundingButton } from "./_components/start-crowdfunding-button"

export default async function PostDetailPage(
  props: {
    params: Promise<{ channel_id: string; post_id: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient()

  // 投稿の取得
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      ),
      channels (
        id,
        name
      )
    `)
    .eq("id", params.post_id)
    .single()

  if (postError || !post) {
    notFound()
  }

  // チャンネルの取得
  const { data: channel, error: channelError } = await supabase
    .from("channels")
    .select("*")
    .eq("id", params.channel_id)
    .single()

  if (channelError || !channel) {
    notFound()
  }

  // ユーザー情報の取得
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/channels/${params.channel_id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{channel.name}</h1>
          <p className="text-sm text-muted-foreground">投稿詳細</p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6">
          {/* 投稿者情報 */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.profiles.id}`} className="hover:opacity-80">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={post.profiles.avatar_url || undefined}
                    alt={post.profiles.username}
                  />
                  <AvatarFallback>{getInitials(post.profiles.username)}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  href={`/profile/${post.profiles.id}`}
                  className="font-medium hover:underline"
                >
                  {post.profiles.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {/* クラウドファンディング開始ボタン（すべてのユーザーに表示） */}
              <StartCrowdfundingButton 
                postId={params.post_id} 
                channelId={params.channel_id} 
                postTitle={post.title}
              />
              
              {/* シェアボタン */}
              <PostShareButton 
                postId={params.post_id} 
                channelId={params.channel_id} 
                title={post.title} 
              />
            </div>
          </div>

          {/* 投稿内容 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{post.description}</p>
          </div>
        </div>
      </div>

      {/* コメントセクション */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">コメント</h2>
        <CommentList postId={post.id} />
      </div>
    </div>
  )
} 