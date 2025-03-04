import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ChannelList } from './_components/channel-list'
import { ChannelForm } from './_components/channel-form'

// キャッシュを無効化して常に最新データを取得
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ChannelsPage() {
  // Cookieを取得（認証情報を含む）
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

  // データベースからチャンネル一覧を取得
  const { data: channels } = await supabase
    .from("channels")
    .select("*")  // すべてのカラムを取得
    .order("post_count", { ascending: false })  // 投稿数の多い順に並び替え

  // ログイン中のユーザーIDを取得（ログインしていない場合はnull）
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  return (
    <div className="container max-w-4xl py-4 sm:py-6 px-4 sm:px-6">
      {/* ヘッダー部分 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">チャンネル一覧</h1>
        <ChannelForm />  {/* ログイン状態に関わらず表示 */}
      </div>
      {/* チャンネル一覧の表示 */}
      <ChannelList initialChannels={channels || []} />
    </div>
  )
} 