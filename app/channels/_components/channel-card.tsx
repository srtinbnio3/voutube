"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"
import { formatNumber } from "../../lib/format"
import { memo, useMemo } from "react"
import { Share2, Link as LinkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import useSWR from 'swr'
import { fetcher } from '../../lib/fetcher'
import { ShareButton } from "@/components/share-button"
import { useShare } from "@/hooks/use-share"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelCardProps {
  channel: Channel
}

const ChannelCard = memo(function ChannelCard({ channel }: ChannelCardProps) {
  const { toast } = useToast()
  
  // 登録者数を取得
  const { data: channelData, error, isLoading } = useSWR(
    `/api/channels/${channel.id}/subscriber-count`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // チャンネル名から2文字のイニシャルを生成
  const initials = useMemo(() => {
    return channel.name
      .split('')
      .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [channel.name])

  // 最終投稿日時の相対表示
  const relativeTime = useMemo(() => {
    if (!channel.latest_post_at) return null
    return formatDistanceToNow(new Date(channel.latest_post_at), { locale: ja, addSuffix: true })
  }, [channel.latest_post_at])

  const { handleShare } = useShare({
    url: `${window.location.origin}/channels/${channel.id}`,
    text: `${channel.name}の投稿企画一覧`
  })

  return (
    <Link href={`/channels/${channel.id}`}>
      <Card className="hover:bg-accent cursor-pointer transition-colors">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {channel.icon_url && (
                <AvatarImage 
                  src={channel.icon_url} 
                  alt={channel.name} 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              )}
              <AvatarFallback delayMs={600}>
                {initials || 'CH'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-semibold">{channel.name}</h3>
              <p className="text-sm text-muted-foreground">
                企画投稿数: {channel.post_count || 0} · 登録者数: {isLoading ? '読み込み中...' : formatNumber(channelData?.subscriber_count || 0)}
              </p>
            </div>
          </div>
          <div className="ml-auto" onClick={(e) => e.preventDefault()}>
            <ShareButton onShare={handleShare} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description || "説明はありません"}
          </p>
          {relativeTime && (
            <p className="text-xs text-muted-foreground mt-2">
              最終投稿: {relativeTime}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
})

// コンポーネントの名前を設定
ChannelCard.displayName = 'ChannelCard'

// コンポーネントをエクスポート
export { ChannelCard } 