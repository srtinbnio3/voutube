"use client"  // クライアントサイドでの実行を指定

import { Database } from "@/database.types"  // データベースの型定義
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// チャンネルデータの型定義
type Channel = Database["public"]["Tables"]["channels"]["Row"]

// コンポーネントのプロパティの型定義
interface ChannelInfoProps {
  channel: Channel  // 表示するチャンネルの情報
}

export function ChannelInfo({ channel }: ChannelInfoProps) {
  // チャンネル名から2文字のイニシャルを生成
  const initials = channel.name
    .split('')
    .filter(char => char.match(/[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/))
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-12 w-12">
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
      <div>
        <h1 className="text-2xl font-bold">{channel.name}</h1>
        <p className="text-muted-foreground">{channel.description}</p>
        <p className="text-sm text-muted-foreground mt-1">
          投稿数: {channel.post_count || 0}
        </p>
      </div>
    </div>
  )
} 