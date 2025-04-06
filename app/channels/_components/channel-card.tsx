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

type Channel = Database["public"]["Tables"]["channels"]["Row"]

interface ChannelCardProps {
  channel: Channel
}

const ChannelCard = memo(function ChannelCard({ channel }: ChannelCardProps) {
  const { toast } = useToast()
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

  const handleShare = async (type: 'x' | 'copy') => {
    const url = `${window.location.origin}/channels/${channel.id}`
    
    if (type === 'x') {
      const text = `${channel.name}の投稿企画一覧`
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      window.open(shareUrl, '_blank')
    } else {
      await navigator.clipboard.writeText(url)
      toast({
        title: "リンクをコピーしました",
        description: "チャンネルのURLがクリップボードにコピーされました",
      })
    }
  }

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
                投稿数: {channel.post_count || 0} · 登録者数: {formatNumber(channel.subscriber_count || 0)}
              </p>
            </div>
          </div>
          <div className="ml-auto" onClick={(e) => e.preventDefault()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('x')}>
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 fill-current"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Xでシェア
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  リンクをコピー
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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