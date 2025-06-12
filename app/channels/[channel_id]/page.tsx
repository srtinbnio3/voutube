import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ChannelInfo } from './_components/channel-info'
import { PostCard } from './_components/post-card'
import { PostForm } from './_components/post-form'
import { PostSort } from './_components/post-sort'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PlusCircle } from 'lucide-react'
import Link from 'next/link'

// ページの動的生成を有効化（キャッシュを無効化）
export const dynamic = "force-dynamic"

// URLのパラメータの型定義
export default async function ChannelPage(props: {
  params: Promise<{ channel_id: string }>;
  searchParams: Promise<{ sort?: 'popular' | 'recent' }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const sort = searchParams.sort || 'popular'; // デフォルトは人気順

  // Cookieの取得（認証情報などが含まれる）
  const cookieStore = await cookies()

  // Supabaseクライアントの初期化
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // チャンネル情報の取得
  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", params.channel_id)  // URLのIDと一致するチャンネルを検索
    .single()  // 1件のみ取得

  // チャンネルが存在しない場合は404ページを表示
  if (!channel) {
    notFound()
  }

  // チャンネルの投稿一覧を取得
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      ),
      votes (
        is_upvote,
        user_id
      )
    `)
    .eq("channel_id", params.channel_id)
    .order(sort === "popular" ? "score" : "created_at", { ascending: false })

  // 各投稿のコメント数を取得
  const postsWithCommentCount = await Promise.all(
    posts?.map(async (post) => {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id)
      
      return {
        ...post,
        comment_count: count || 0
      }
    }) || []
  )

  // ログイン中のユーザーIDを取得
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id
  const isLoggedIn = !!user

  // ページのレイアウトを返す
  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background Elements - チャンネル一覧ページと統一 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative">
        <div className="container max-w-6xl py-4 sm:py-8 px-3 sm:px-4 lg:px-6">
          {/* ヘッダー部分 - モバイル最適化 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Button variant="ghost" size="icon" asChild className="flex-shrink-0 backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-800/90 border-0 shadow-lg w-10 h-10 sm:w-12 sm:h-12">
                <Link href="/channels">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <ChannelInfo channel={channel} />
              </div>
            </div>
          </div>
          
          {/* 投稿企画セクション - モバイル最適化 */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-0 shadow-xl p-4 sm:p-6 lg:p-8">
            {/* セクションヘッダー - モバイル最適化 */}
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* タイトル行とボタン */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400">
                    投稿企画一覧
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    {postsWithCommentCount?.length || 0}件の企画が投稿されています
                  </p>
                </div>
                
                {/* 新規投稿ボタン - 全画面で右側に配置 */}
                <div className="flex-shrink-0">
                  <PostForm channelId={channel.id} />
                </div>
              </div>
              
              {/* ソートボタン */}
              <div className="flex justify-end">
                <PostSort currentSort={sort} />
              </div>
            </div>
            
            {/* 投稿一覧 - モバイル最適化 */}
            <div className="space-y-4 sm:space-y-6">
              {postsWithCommentCount?.length ? (
                postsWithCommentCount.map((post) => (
                  <PostCard key={post.id} post={post} userId={userId} />
                ))
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                    <PlusCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    まだ投稿がありません
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                    このチャンネルで最初の企画を投稿してみましょう！あなたのアイデアがクリエイターの次の動画になるかもしれません。
                  </p>
                  {isLoggedIn && (
                    <PostForm channelId={channel.id} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 