import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User } from "lucide-react"
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
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements - 他のページと統一 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative">
        <div className="container max-w-4xl py-4 sm:py-8 px-3 sm:px-4 lg:px-6">
          {/* ヘッダー部分 - モバイル最適化 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild 
                className="flex-shrink-0 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-800/90 border-0 shadow-lg w-10 h-10 sm:w-12 sm:h-12"
              >
                <Link href={`/channels/${params.channel_id}`}>
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400 truncate">
                  {channel.name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  投稿企画詳細
                </p>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="space-y-6 sm:space-y-8">
            {/* 投稿カード */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-0 shadow-xl overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                {/* 投稿者情報とアクションボタン */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.profiles.id}`} className="hover:opacity-80 transition-opacity">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-white/50 dark:ring-slate-700/50">
                        <AvatarImage
                          src={post.profiles.avatar_url || undefined}
                          alt={post.profiles.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(post.profiles.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/profile/${post.profiles.id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                      >
                        {post.profiles.username}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(post.created_at).toLocaleDateString("ja-JP")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex gap-2 flex-shrink-0">
                    <StartCrowdfundingButton 
                      postId={params.post_id} 
                      channelId={params.channel_id} 
                      postTitle={post.title}
                    />
                    <PostShareButton 
                      postId={params.post_id} 
                      channelId={params.channel_id} 
                      title={post.title} 
                    />
                  </div>
                </div>

                {/* 投稿内容 */}
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400 leading-tight">
                    {post.title}
                  </h2>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {post.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* コメントセクション */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-0 shadow-xl">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400">
                    コメント
                  </h2>
                </div>
                <CommentList postId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 