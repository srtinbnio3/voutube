import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ChannelList } from "./channels/_components/channel-list"

// ページの動的生成を有効化（毎回最新のデータを取得）
export const dynamic = "force-dynamic"

export default async function HomePage() {
  // Cookieを取得（ユーザーの認証情報などが含まれる）
  const cookieStore = await cookies()

  // Supabaseデータベースに接続するための設定
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,        // データベースのURL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,   // 接続用の認証キー
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // チャンネル一覧を取得
  const { data: channels } = await supabase
    .from("channels")           // channelsテーブルから
    .select("*")               // 全ての列を
    .order("post_count", { ascending: false })  // 投稿数が多い順に
    .limit(10)                // 10件まで取得

  // ページのレイアウトを返す
  return (
    <div className="container max-w-4xl py-6">
      {/* ページタイトル */}
      <h1 className="text-2xl font-bold mb-6">チャンネル一覧</h1>
      {/* チャンネル一覧コンポーネント（取得したデータを渡す） */}
      <ChannelList initialChannels={channels || []} />
    </div>
  )
}
