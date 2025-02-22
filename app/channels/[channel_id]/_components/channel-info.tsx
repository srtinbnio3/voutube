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
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={channel.icon_url || ""} />
        <AvatarFallback>CH</AvatarFallback>  {/* アイコンが読み込めない場合の代替表示 */}
      </Avatar>
      <div>
        <h2 className="text-xl font-bold">{channel.name}</h2>
        <p className="text-sm text-muted-foreground">
          投稿数: {channel.post_count || 0}
        </p>
        {/* 登録者数の表示（存在する場合のみ） */}
        {channel.subscriber_count && (
          <p className="text-sm text-muted-foreground">
            登録者数: {channel.subscriber_count.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
} 