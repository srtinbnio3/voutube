import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ChannelInfo } from './_components/channel-info'
import { PostCard } from './_components/post-card'
import { PostForm } from './_components/post-form'

// ページの動的生成を有効化（キャッシュを無効化）
export const dynamic = "force-dynamic"

// URLのパラメータの型定義
export default async function ChannelPage(props: {
  params: Promise<{ channel_id: string }>;
}) {
  const params = await props.params;

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
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      votes (
        is_upvote,
        user_id
      )
    `)  // 投票情報も一緒に取得
    .eq("channel_id", params.channel_id)
    .order("score", { ascending: false })  // スコアが高い順
    .order("created_at", { ascending: false })  // 同じスコアの場合は新しい順
    .limit(10)

  // ログイン中のユーザーIDを取得
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // ページのレイアウトを返す
  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">{channel.name}</h1>
      <p className="text-muted-foreground">{channel.description}</p>
      {/* チャンネル情報と投稿フォームの表示 */}
      <div className="flex items-start justify-between">
        <ChannelInfo channel={channel} />
        <PostForm channelId={channel.id} />
      </div>
      
      {/* 投稿一覧の表示 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">投稿一覧</h2>
        <div className="grid gap-4">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
} 