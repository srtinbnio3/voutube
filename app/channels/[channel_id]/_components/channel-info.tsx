"use client"  // クライアントサイドでの実行を指定

import { useState } from "react"
import { Database } from "@/database.types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Youtube } from "lucide-react"
import { formatNumber } from "../../../lib/format"
import { createBrowserClient } from "@supabase/ssr"
import useSWR from 'swr'
import { fetcher } from '../../../lib/fetcher'

// チャンネルデータの型定義
type Channel = Database["public"]["Tables"]["channels"]["Row"]

// コンポーネントのプロパティの型定義
interface ChannelInfoProps {
  channel: Channel  // 表示するチャンネルの情報
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  const { data: channelData, error, isLoading } = useSWR(
    `/api/youtube/channel?id=${channel.youtube_channel_id}`,
    fetcher,
    {
      refreshInterval: 300000, // 5分ごとに更新
      revalidateOnFocus: false,
    }
  )

  // チャンネル名から2文字のイニシャルを生成
  const initials = channel.name
    .split('')
    .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // データベースの更新
  const updateDatabase = async (subscriberCount: number) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    await supabase
      .from('channels')
      .update({ subscriber_count: subscriberCount })
      .eq('id', channel.id)
  }

  // チャンネルデータが更新されたらデータベースも更新
  if (channelData?.subscriber_count) {
    updateDatabase(channelData.subscriber_count)
  }

  return (
    <div 
      role="group" 
      aria-label="チャンネル情報" 
      className="flex items-center gap-4"
    >
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
      <div role="group" aria-label="チャンネル詳細" className="space-y-2">
        <h1 className="text-2xl font-bold">{channel.name}</h1>
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