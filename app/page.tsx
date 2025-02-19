import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ChannelList } from "./channels/_components/channel-list"

export const dynamic = "force-dynamic"

export default async function HomePage() {
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
    .limit(10)

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">チャンネル一覧</h1>
      <ChannelList initialChannels={channels || []} />
    </div>
  )
}
