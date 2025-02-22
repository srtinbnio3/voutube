import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = "force-dynamic"

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

  // チャンネル一覧を取得
  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">チャンネル一覧</h1>
      <div className="grid gap-4">
        {channels?.map((channel) => (
          <Link key={channel.id} href={`/channels/${channel.id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={channel.icon_url || ""} />
                  <AvatarFallback>CH</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{channel.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    投稿数: {channel.post_count || 0}
                  </p>
                  {channel.subscriber_count && (
                    <p className="text-sm text-muted-foreground">
                      登録者数: {channel.subscriber_count.toLocaleString()}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {channel.description || "説明はありません"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 