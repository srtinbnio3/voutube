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

  // 初回表示用に最初の16件のみ取得（軽量化）
  const { data: channels } = await supabase
    .from("channels")
    .select("*")  // 型エラー回避のため全項目取得（後で最適化予定）
    .order("post_count", { ascending: false })
    .range(0, 15)  // 最初の16件のみ取得

  // 全体のチャンネル数を取得
  const { count: totalChannels } = await supabase
    .from("channels")
    .select("*", { count: 'exact', head: true })

  // ログイン中のユーザーIDを取得（ログインしていない場合はnull）
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container max-w-7xl py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* ヘッダー部分 */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-white dark:via-blue-400 dark:to-purple-400 mb-4">
            チャンネル一覧
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            YouTubeチャンネルの投稿企画を発見・探索しよう
          </p>
          <div className="flex justify-center">
            <ChannelForm />
          </div>
        </div>
        
        {/* チャンネル一覧の表示 */}
        <ChannelList 
          initialChannels={channels || []} 
          totalChannels={totalChannels || 0}
          hasMore={(totalChannels || 0) > 16}
        />
      </div>
    </div>
  )
} 