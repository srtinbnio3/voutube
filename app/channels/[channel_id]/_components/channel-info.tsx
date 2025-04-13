"use client"  // クライアントサイドでの実行を指定

import { useState } from "react"
import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Youtube, Share2, Link as LinkIcon } from "lucide-react"
import { formatNumber } from "../../../lib/format"
import { createBrowserClient } from "@supabase/ssr"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ShareButton } from "@/components/share-button"
import { useShare } from "@/hooks/use-share"

// チャンネルデータの型定義
type Channel = Database["public"]["Tables"]["channels"]["Row"]

// コンポーネントのプロパティの型定義
interface ChannelInfoProps {
  channel: Channel  // 表示するチャンネルの情報
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  const { toast } = useToast()
  const { data: channelData, error, isLoading } = useSWR(
    `/api/channels/${channel.id}/subscriber-count`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // チャンネル名から2文字のイニシャルを生成
  const initials = channel.name
    .split('')
    .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const { handleShare } = useShare({
    url: `${window.location.origin}/channels/${channel.id}`,
    text: `${channel.name}の投稿企画一覧`
  })

  return (
    <div 
      role="group" 
      aria-label="チャンネル情報" 
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        <span 
          role="img" 
          aria-label={`${channel.name}のアバター`}
          className="relative flex shrink-0 overflow-hidden rounded-full h-12 w-12"
        >
          <Avatar>
            {channel.icon_url ? (
              <AvatarImage
                src={channel.icon_url}
                alt={channel.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            ) : null}
            <AvatarFallback delayMs={600}>
              {initials || 'CH'}
            </AvatarFallback>
          </Avatar>
        </span>
        <div className="flex items-center justify-between gap-4 flex-1">
          <h1 className="text-2xl font-bold">{channel.name}</h1>
          <div className="flex-shrink-0">
            <ShareButton onShare={handleShare} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-muted-foreground">{channel.description ?? '説明はありません'}</p>
        <div className="flex gap-4">
          <p className="text-sm text-muted-foreground">
            投稿数: {channel.post_count || 0}
          </p>
          <p className="text-sm text-muted-foreground">
            登録者数: {isLoading ? '読み込み中...' : formatNumber(channelData?.subscriber_count || 0)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a
            href={`https://www.youtube.com/channel/${channel.youtube_channel_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Youtube className="h-4 w-4" />
            YouTubeチャンネルを開く
          </a>
        </Button>
      </div>
    </div>
  )
} 