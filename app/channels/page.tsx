import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ChannelList } from './_components/channel-list'
import { ChannelForm } from './_components/channel-form'

// キャッシュを無効化して常に最新データを取得
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ChannelsPage() {
  // Cookieを取得（認証情報などが含まれる）
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
  // post_countの降順（投稿数が多い順）で並び替え
  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .order("post_count", { ascending: false })

  return (
    <div className="container max-w-4xl py-6">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">チャンネル一覧</h1>
        <ChannelForm />  {/* チャンネル作成フォーム */}
      </div>
      {/* チャンネル一覧の表示 */}
      <ChannelList initialChannels={channels || []} />
    </div>
  )
} 