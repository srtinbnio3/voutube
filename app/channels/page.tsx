import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ChannelList } from './_components/channel-list'
import { ChannelForm } from './_components/channel-form'

// キャッシュを無効化して常に最新データを取得
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ChannelsPage() {
  const cookieStore = await cookies()
  
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

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .order("post_count", { ascending: false })

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">チャンネル一覧</h1>
        <ChannelForm />
      </div>
      <ChannelList initialChannels={channels || []} />
    </div>
  )
} 