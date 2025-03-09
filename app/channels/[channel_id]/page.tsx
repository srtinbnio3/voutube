import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ChannelInfo } from './_components/channel-info'
import { PostCard } from './_components/post-card'
import { PostForm } from './_components/post-form'
import { PostSort } from './_components/post-sort'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
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
  const query = supabase
    .from("posts")
    .select(`
      *,
      votes (
        is_upvote,
        user_id
      ),
      profiles!user_id (
        id,
        username,
        avatar_url
      )
    `)  // 投票情報とプロフィール情報も一緒に取得
    .eq("channel_id", params.channel_id)

  // ソート順の適用
  if (sort === 'popular') {
    query
      .order('score', { ascending: false })  // スコアが高い順
      .order('created_at', { ascending: false })  // 同じスコアの場合は新しい順
  } else {
    query
      .order('created_at', { ascending: false })  // 新しい順
      .order('score', { ascending: false })  // 同じ日付の場合はスコアが高い順
  }

  const { data: posts } = await query.limit(10)

  // ログイン中のユーザーIDを取得
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  const isLoggedIn = !!session

  // ページのレイアウトを返す
  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/channels">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <ChannelInfo channel={channel} />
      </div>
      
      {/* 投稿フォームの表示 */}
      <div className="flex justify-end">
        <PostForm channelId={channel.id} />
      </div>
      
      {/* 投稿一覧の表示 */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">投稿企画一覧</h2>
          <PostSort currentSort={sort} />
        </div>
        <div className="grid gap-4">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} userId={userId} />
          ))}
          {!posts?.length && (
            <p className="text-center text-muted-foreground">投稿がありません</p>
          )}
        </div>
      </div>
    </div>
  )
} 